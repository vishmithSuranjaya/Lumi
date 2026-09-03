"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    validateAdvertisement,
    VEHICLE_CATEGORIES,
    SRI_LANKA_DISTRICTS,
    VEHICLE_CONDITIONS,
    FUEL_TYPES,
    TRANSMISSIONS,
} from "@/lib/validations/advertisement";

interface SelectedImageItem {
    id: string;
    file: File;
    preview: string;
    sizeFormatted: string;
}

export default function PostAdvertisementPage() {
    const [formData, setFormData] = useState({
        category: "Cars & Sedans",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        condition: "Registered (Used)",
        mileage: "",
        fuelType: "Petrol",
        transmission: "Automatic",
        engineCapacity: "",
        priceLKR: "",
        isNegotiable: true,
        district: "Colombo",
        city: "",
        description: "",
        sellerName: "",
        sellerPhone: "",
        sellerEmail: "",
        hasWhatsApp: true,
    });

    const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadStep, setUploadStep] = useState<string>("");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [adRefId, setAdRefId] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up Object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
        };
    }, [selectedImages]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
        if (submitError) {
            setSubmitError(null);
        }
    };

    const processFiles = (files: FileList | File[]) => {
        const fileList = Array.from(files);
        if (fileList.length === 0) return;

        // Check maximum 5 photos limit
        if (selectedImages.length + fileList.length > 5) {
            setErrors((prev) => ({
                ...prev,
                images: `You can only upload up to 5 photos in total. (Currently have ${selectedImages.length}, tried to add ${fileList.length})`,
            }));
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        const maxFileSize = 5 * 1024 * 1024; // 5 MB

        const newItems: SelectedImageItem[] = [];

        for (const file of fileList) {
            if (!allowedTypes.includes(file.type)) {
                setErrors((prev) => ({
                    ...prev,
                    images: `"${file.name}" is not a supported format. Only JPG, PNG, and WebP images are allowed.`,
                }));
                return;
            }

            if (file.size > maxFileSize) {
                setErrors((prev) => ({
                    ...prev,
                    images: `"${file.name}" exceeds the 5MB file size limit.`,
                }));
                return;
            }

            const sizeKB = (file.size / 1024).toFixed(0);
            const sizeFormatted = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKB} KB`;

            newItems.push({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                file,
                preview: URL.createObjectURL(file),
                sizeFormatted,
            });
        }

        setSelectedImages((prev) => [...prev, ...newItems]);
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated.images;
            return updated;
        });
        if (submitError) setSubmitError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            // Reset input value so selecting the same file again triggers change
            e.target.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const itemToRemove = selectedImages[indexToRemove];
        if (itemToRemove) {
            URL.revokeObjectURL(itemToRemove.preview);
        }
        const updated = selectedImages.filter((_, idx) => idx !== indexToRemove);
        setSelectedImages(updated);
        if (updated.length === 0) {
            setErrors((prev) => ({ ...prev, images: "At least one vehicle photo is required" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // 1. Frontend validation (passing temporary previews so image presence is validated)
        const validation = validateAdvertisement({
            ...formData,
            images: selectedImages.map((img) => img.preview),
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            setSubmitError("Please correct the highlighted fields before publishing.");
            window.scrollTo({ top: 320, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        try {
            // 2. Upload images to ImageKit via Next.js API
            setUploadStep("Uploading photos to ImageKit CDN...");
            const uploadFormData = new FormData();
            selectedImages.forEach((item) => {
                uploadFormData.append("images", item.file);
            });

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadData.success) {
                throw new Error(uploadData.message || "Failed to upload images to ImageKit.");
            }

            const imageUrls: string[] = uploadData.urls;

            // 3. Save vehicle advertisement + ImageKit URLs to MongoDB
            setUploadStep("Saving advertisement details to MongoDB...");
            const response = await fetch("/api/advertisements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    images: imageUrls,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                if (result.errors) {
                    setErrors(result.errors);
                }
                throw new Error(result.message || "Failed to publish advertisement to database.");
            }

            // Success
            setAdRefId(result.refId);
            setIsSubmitted(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err: any) {
            console.error("Submission error:", err);
            setSubmitError(err.message || "A network or server error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
            setUploadStep("");
        }
    };

    const getInputClass = (field: string, extraClasses = "") =>
        `w-full px-4 py-3 bg-neutral-50 border text-sm text-neutral-900 focus:outline-none transition-colors ${errors[field]
            ? "border-red-500 bg-red-50/30 focus:border-red-600 ring-1 ring-red-500/20"
            : "border-neutral-300 focus:border-[#0F52BA]"
        } ${extraClasses}`;

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-neutral-900">
            {/* Navbar */}
            <Navbar />

            <main className="flex-1">
                {/* Hero Banner */}
                <section className="relative w-full bg-[#0c0e12] text-white py-12 sm:py-16 overflow-hidden border-b border-neutral-800">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">Post an Advertisement</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                            Sell Your Vehicle or Machinery
                        </h1>
                        <p className="text-neutral-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                            Upload photos and reach thousands of verified buyers across Sri Lanka with our premium automotive marketplace.
                        </p>
                    </div>
                </section>

                {/* Form Container */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {isSubmitted ? (
                        /* Submission Success Card */
                        <div className="bg-white border border-neutral-200/90 shadow-2xl p-8 sm:p-14 text-center animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>

                            <span className="inline-block px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-300 mb-3">
                                Advertisement Published
                            </span>

                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
                                {formData.brand} {formData.model} ({formData.year})
                            </h2>
                            <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-md mx-auto">
                                Your have Successfully published the Advertisement. Reference ID:
                            </p>

                            <div className="my-6 inline-block bg-neutral-900 text-white font-mono font-black text-xl px-6 py-3 tracking-widest border border-neutral-700 shadow-md">
                                {adRefId}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                                <Link
                                    href="/vehicles"
                                    className="px-6 py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    View in Catalog
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setSelectedImages([]);
                                        setFormData({
                                            category: "Cars & Sedans",
                                            brand: "",
                                            model: "",
                                            year: new Date().getFullYear(),
                                            condition: "Registered (Used)",
                                            mileage: "",
                                            fuelType: "Petrol",
                                            transmission: "Automatic",
                                            engineCapacity: "",
                                            priceLKR: "",
                                            isNegotiable: true,
                                            district: "Colombo",
                                            city: "",
                                            description: "",
                                            sellerName: "",
                                            sellerPhone: "",
                                            sellerEmail: "",
                                            hasWhatsApp: true,
                                        });
                                        setErrors({});
                                    }}
                                    className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Post Another Vehicle
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* The Advertisement Form */
                        <form onSubmit={handleSubmit} noValidate className="space-y-8">
                            {/* Global Error Banner */}
                            {submitError && (
                                <div className="bg-red-50 border-l-4 border-red-600 p-4 shadow-sm flex items-start gap-3 animate-in fade-in">
                                    <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-bold text-red-900">Submission Blocked</h4>
                                        <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
                                    </div>
                                </div>
                            )}

                            {/* 1. Category & Basic Info */}
                            <div className="bg-white border border-neutral-200/90 shadow-sm p-6 sm:p-8">
                                <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                            01
                                        </span>
                                        <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                            Vehicle Category & Identity
                                        </h2>
                                    </div>
                                    <span className="text-xs text-neutral-400 font-semibold">* Required fields</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {/* Category */}
                                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Vehicle / Equipment Type *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleChange("category", e.target.value)}
                                            className={getInputClass("category")}
                                        >
                                            {VEHICLE_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Brand / Make */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Brand / Make *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.brand}
                                            onChange={(e) => handleChange("brand", e.target.value)}
                                            placeholder="e.g. Toyota, Bajaj, Isuzu, CAT"
                                            className={getInputClass("brand")}
                                        />
                                        {errors.brand && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.brand}
                                            </p>
                                        )}
                                    </div>

                                    {/* Model */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Model *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={(e) => handleChange("model", e.target.value)}
                                            placeholder="e.g. Prado TX, Pulsar 150, Elf"
                                            className={getInputClass("model")}
                                        />
                                        {errors.model && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.model}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                                    {/* Year */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Manufactured Year *
                                        </label>
                                        <input
                                            type="number"
                                            min={1950}
                                            max={new Date().getFullYear() + 1}
                                            value={formData.year}
                                            onChange={(e) => handleChange("year", e.target.value ? Number(e.target.value) : "")}
                                            className={getInputClass("year")}
                                        />
                                        {errors.year && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.year}
                                            </p>
                                        )}
                                    </div>

                                    {/* Condition */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Condition *
                                        </label>
                                        <select
                                            value={formData.condition}
                                            onChange={(e) => handleChange("condition", e.target.value)}
                                            className={getInputClass("condition")}
                                        >
                                            {VEHICLE_CONDITIONS.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.condition && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.condition}
                                            </p>
                                        )}
                                    </div>

                                    {/* Mileage */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Mileage (km / hrs) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.mileage}
                                            onChange={(e) => handleChange("mileage", e.target.value)}
                                            placeholder="e.g. 45,000 km (or 0 for brand new)"
                                            className={getInputClass("mileage")}
                                        />
                                        {errors.mileage && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.mileage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Technical Specs & Pricing */}
                            <div className="bg-white border border-neutral-200/90 shadow-sm p-6 sm:p-8">
                                <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center gap-2.5">
                                    <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                        02
                                    </span>
                                    <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                        Technical Specifications & Pricing
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {/* Transmission */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Transmission
                                        </label>
                                        <select
                                            value={formData.transmission}
                                            onChange={(e) => handleChange("transmission", e.target.value)}
                                            className={getInputClass("transmission")}
                                        >
                                            {TRANSMISSIONS.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fuel Type */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Fuel Type
                                        </label>
                                        <select
                                            value={formData.fuelType}
                                            onChange={(e) => handleChange("fuelType", e.target.value)}
                                            className={getInputClass("fuelType")}
                                        >
                                            {FUEL_TYPES.map((f) => (
                                                <option key={f} value={f}>
                                                    {f}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Engine Capacity */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Engine Capacity (cc / HP)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.engineCapacity}
                                            onChange={(e) => handleChange("engineCapacity", e.target.value)}
                                            placeholder="e.g. 1998 cc / 250 HP"
                                            className={getInputClass("engineCapacity")}
                                        />
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 pt-5 border-t border-neutral-100 items-start">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Expected Price (LKR) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.priceLKR}
                                            onChange={(e) => handleChange("priceLKR", e.target.value)}
                                            placeholder="e.g. 18,500,000"
                                            className={getInputClass("priceLKR", "font-bold")}
                                        />
                                        {errors.priceLKR && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.priceLKR}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 sm:pt-7">
                                        <input
                                            type="checkbox"
                                            id="negotiable"
                                            checked={formData.isNegotiable}
                                            onChange={(e) => handleChange("isNegotiable", e.target.checked)}
                                            className="w-4 h-4 text-[#0F52BA] border-neutral-300 rounded-none focus:ring-0 cursor-pointer"
                                        />
                                        <label htmlFor="negotiable" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                                            Price is Negotiable (මිල සාකච්ඡා කරගත හැක)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Photo Uploads (Real File Upload to ImageKit) */}
                            <div className="bg-white border border-neutral-200/90 shadow-sm p-6 sm:p-8">
                                <div className="border-b border-neutral-100 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                            03
                                        </span>
                                        <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                            Vehicle Photos ({selectedImages.length}/5) *
                                        </h2>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-neutral-500 font-medium">
                                            JPG, PNG, WebP up to 5MB
                                        </span>
                                        {selectedImages.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3 py-1.5 bg-blue-50 text-[#0F52BA] hover:bg-blue-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                Add Photos
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Hidden File Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {/* Drag-and-Drop Dropzone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => {
                                        if (selectedImages.length < 5) fileInputRef.current?.click();
                                    }}
                                    className={`border-2 border-dashed p-6 sm:p-8 text-center transition-all cursor-pointer ${isDragging
                                            ? "border-[#0F52BA] bg-blue-50/60 scale-[1.01]"
                                            : errors.images
                                                ? "border-red-400 bg-red-50/20 hover:border-red-500"
                                                : "border-neutral-300 hover:border-[#0F52BA] bg-neutral-50/60 hover:bg-blue-50/30"
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-800">
                                        Drag & drop vehicle photos here, or <span className="text-[#0F52BA] underline">browse files</span>
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Upload up to 5 photos (first photo will be used as the primary cover photo)
                                    </p>
                                </div>

                                {errors.images && (
                                    <p className="text-xs text-red-600 font-semibold mt-3 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                        </svg>
                                        {errors.images}
                                    </p>
                                )}

                                {/* Image Preview Thumbnails */}
                                {selectedImages.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                                        {selectedImages.map((img, idx) => (
                                            <div
                                                key={img.id}
                                                className="relative group bg-neutral-100 border border-neutral-300 overflow-hidden shadow-sm aspect-[4/3]"
                                            >
                                                <img
                                                    src={img.preview}
                                                    alt={`Upload ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* Cover Photo Badge for Photo #1 */}
                                                {idx === 0 ? (
                                                    <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider bg-[#0F52BA] text-white px-2 py-0.5 shadow-md">
                                                        Cover Photo
                                                    </span>
                                                ) : (
                                                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/75 text-white px-1.5 py-0.5">
                                                        #{idx + 1}
                                                    </span>
                                                )}

                                                {/* File Size */}
                                                <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/75 text-white px-1.5 py-0.5">
                                                    {img.sizeFormatted}
                                                </span>

                                                {/* Remove Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(idx);
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-pointer transition-transform group-hover:scale-110"
                                                    title="Remove photo"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 4. Location & Contact Information */}
                            <div className="bg-white border border-neutral-200/90 shadow-sm p-6 sm:p-8">
                                <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center gap-2.5">
                                    <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                        04
                                    </span>
                                    <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                        Location & Seller Contact Details
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* District */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            District in Sri Lanka *
                                        </label>
                                        <select
                                            value={formData.district}
                                            onChange={(e) => handleChange("district", e.target.value)}
                                            className={getInputClass("district")}
                                        >
                                            {SRI_LANKA_DISTRICTS.map((dst) => (
                                                <option key={dst} value={dst}>
                                                    {dst}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.district && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.district}
                                            </p>
                                        )}
                                    </div>

                                    {/* City */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            City / Town *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => handleChange("city", e.target.value)}
                                            placeholder="e.g. Nugegoda, Negombo, Kandy City"
                                            className={getInputClass("city")}
                                        />
                                        {errors.city && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                                    {/* Seller Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Seller Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.sellerName}
                                            onChange={(e) => handleChange("sellerName", e.target.value)}
                                            placeholder="e.g. Kasun Fernando"
                                            className={getInputClass("sellerName")}
                                        />
                                        {errors.sellerName && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.sellerName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Mobile Phone */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Primary Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.sellerPhone}
                                            onChange={(e) => handleChange("sellerPhone", e.target.value)}
                                            placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                                            className={getInputClass("sellerPhone")}
                                        />
                                        {errors.sellerPhone && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.sellerPhone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.sellerEmail}
                                            onChange={(e) => handleChange("sellerEmail", e.target.value)}
                                            placeholder="seller@example.com"
                                            className={getInputClass("sellerEmail")}
                                        />
                                        {errors.sellerEmail && (
                                            <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                {errors.sellerEmail}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Description */}
                                <div className="space-y-1.5 mt-5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Vehicle Description & Features
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => handleChange("description", e.target.value)}
                                        placeholder="Describe vehicle options (sunroof, leather seats, service records, ownership history, warranty etc.)..."
                                        className={getInputClass("description", "resize-none")}
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit CTA */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121418] text-white p-6 sm:p-8">
                                <div>
                                    <h3 className="font-extrabold text-base sm:text-lg">
                                        Ready to Publish Your Advertisement?
                                    </h3>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Photos will be uploaded to ImageKit and details saved securely to MongoDB.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-8 py-4 bg-[#0F52BA] hover:bg-[#0c4399] disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {uploadStep || "Processing..."}
                                        </>
                                    ) : (
                                        "Publish Advertisement"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
