"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { VehicleAd } from "@/components/VehicleCatalog";

interface VehicleDetailViewProps {
    vehicle: VehicleAd;
    similarVehicles: VehicleAd[];
}

export default function VehicleDetailView({ vehicle, similarVehicles }: VehicleDetailViewProps) {
    const images = useMemo(() => {
        if (vehicle.images && vehicle.images.length > 0) {
            return vehicle.images;
        }
        return [];
    }, [vehicle.images]);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [copiedShareLink, setCopiedShareLink] = useState(false);
    const [pageUrl, setPageUrl] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPageUrl(window.location.href);
        }
    }, []);

    // Loan Calculator State
    const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30); // 30% default
    const [loanYears, setLoanYears] = useState<number>(5); // 5 years
    const [interestRate, setInterestRate] = useState<number>(12); // 12% p.a.

    // Monthly Lease Calculation (Standard Reducing Balance Loan formula)
    const monthlyEstimate = useMemo(() => {
        const principal = vehicle.priceLKR * (1 - downPaymentPercent / 100);
        if (principal <= 0) return 0;
        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = loanYears * 12;
        const emi =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
        return isNaN(emi) ? 0 : Math.round(emi);
    }, [vehicle.priceLKR, downPaymentPercent, loanYears, interestRate]);

    const downPaymentAmount = useMemo(() => {
        return Math.round((vehicle.priceLKR * downPaymentPercent) / 100);
    }, [vehicle.priceLKR, downPaymentPercent]);

    const handleShare = async () => {
        if (typeof window === "undefined") return;
        const shareData = {
            title: `${vehicle.year} ${vehicle.brand} ${vehicle.model}`,
            text: `Check out this ${vehicle.year} ${vehicle.brand} ${vehicle.model} for LKR ${vehicle.priceLKR.toLocaleString()} on Lumi Automotive.`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch {
                // user cancelled or share failed, fallback to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopiedShareLink(true);
            setTimeout(() => setCopiedShareLink(false), 2500);
        } catch {
            alert("Vehicle link copied to clipboard!");
        }
    };

    const whatsAppHref = useMemo(() => {
        const cleanPhone = (vehicle.sellerPhone || "").replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("0") ? `94${cleanPhone.slice(1)}` : cleanPhone;
        const linkPart = pageUrl ? `\n\nLink: ${pageUrl}` : "";
        const msg = encodeURIComponent(
            `Hello ${vehicle.sellerName || ""}, I am inquiring about your ${vehicle.year} ${vehicle.brand} ${vehicle.model} (Ref ID: ${vehicle.refId}) on Lumi Marketplace.${linkPart}`
        );
        return `https://wa.me/${formattedPhone}?text=${msg}`;
    }, [vehicle, pageUrl]);

    return (
        <div className="w-full bg-[#f8f9fa] text-neutral-900">
            {/* Top Navigation & Breadcrumbs */}
            <div className="bg-white border-b border-neutral-200 sticky top-0 z-20 backdrop-blur-md bg-white/95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 overflow-x-auto py-1">
                        <Link href="/" className="hover:text-[#0F52BA] transition-colors whitespace-nowrap">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/vehicles" className="hover:text-[#0F52BA] transition-colors whitespace-nowrap">
                            Vehicles
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/vehicles?category=${encodeURIComponent(vehicle.category)}`}
                            className="hover:text-[#0F52BA] transition-colors whitespace-nowrap"
                        >
                            {vehicle.category}
                        </Link>
                        <span>/</span>
                        <span className="text-neutral-900 font-bold truncate max-w-[200px] sm:max-w-none">
                            {vehicle.brand} {vehicle.model}
                        </span>
                    </nav>

                    {/* Quick Action Tools */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="px-3.5 py-1.5 border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            title="Share vehicle listing"
                        >
                            <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                            </svg>
                            <span>{copiedShareLink ? "Link Copied!" : "Share"}</span>
                        </button>

                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className={`px-3.5 py-1.5 border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${isSaved
                                ? "bg-rose-50 border-rose-300 text-rose-600"
                                : "border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-700"
                                }`}
                            title="Save vehicle"
                        >
                            <svg
                                className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-neutral-600"}`}
                                fill={isSaved ? "currentColor" : "none"}
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                />
                            </svg>
                            <span>{isSaved ? "Saved" : "Save"}</span>
                        </button>

                        <Link
                            href="/vehicles"
                            className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                        >
                            ← Back to Catalog
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Details Body */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT COLUMN: Gallery, Badges, Specs, Description & Finance (8 Cols) */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        {/* Title & Header Mobile & Tablet View */}
                        <div className="border-b border-neutral-200 pb-6">
                            <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                <span className="bg-[#0F52BA] text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1">
                                    {vehicle.condition}
                                </span>
                                <span className="bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider px-3 py-1">
                                    {vehicle.category}
                                </span>
                                <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 text-xs font-mono font-semibold px-2.5 py-1">
                                    Ref: {vehicle.refId}
                                </span>
                                {vehicle.isNegotiable && (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                                        Price Negotiable
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                                {vehicle.year} {vehicle.brand} {vehicle.model}
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-neutral-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    {vehicle.city ? `${vehicle.city}, ` : ""}{vehicle.district}, Sri Lanka
                                </span>
                                <span>•</span>
                                <span suppressHydrationWarning>
                                    Listed {new Date(vehicle.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                                </span>
                                <span>•</span>
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                                    Verified Listing
                                </span>
                            </div>
                        </div>

                        {/* Interactive Photo Gallery */}
                        <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                            {/* Main Stage Image */}
                            <div className="relative h-[320px] sm:h-[460px] md:h-[520px] w-full bg-neutral-950 overflow-hidden group">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                                    style={{ backgroundImage: `url('${images[activeImageIndex]}')` }}
                                    onClick={() => setIsLightboxOpen(true)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                {/* Photo Counter Pill */}
                                <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1.5 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <span>
                                        {activeImageIndex + 1} / {images.length}
                                    </span>
                                </div>

                                {/* Fullscreen Zoom Trigger */}
                                <button
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    </svg>
                                    <span>Expand</span>
                                </button>

                                {/* Left & Right Image Cycle Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() =>
                                                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
                                            }
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                                            aria-label="Previous image"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                                            aria-label="Next image"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Row */}
                            {images.length > 1 && (
                                <div className="p-3 bg-neutral-100 flex gap-2.5 overflow-x-auto border-t border-neutral-200">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 overflow-hidden transition-all cursor-pointer border-2 ${activeImageIndex === idx
                                                ? "border-[#0F52BA] shadow-md scale-95"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${vehicle.brand} ${vehicle.model} thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lightbox Modal */}
                        {isLightboxOpen && (
                            <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
                                <button
                                    onClick={() => setIsLightboxOpen(false)}
                                    className="absolute top-5 right-5 text-white/80 hover:text-white p-2 text-sm font-bold uppercase tracking-widest cursor-pointer bg-white/10 rounded-full"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                <div className="max-w-6xl max-h-[85vh] w-full flex flex-col items-center justify-center">
                                    <img
                                        src={images[activeImageIndex]}
                                        alt={`${vehicle.brand} ${vehicle.model} full view`}
                                        className="max-h-[75vh] w-auto max-w-full object-contain shadow-2xl"
                                    />
                                    <div className="mt-4 flex items-center justify-between w-full text-white text-xs font-mono">
                                        <span>
                                            {vehicle.year} {vehicle.brand} {vehicle.model} ({vehicle.refId})
                                        </span>
                                        <span>
                                            Image {activeImageIndex + 1} of {images.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Key Specifications List */}
                        <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
                            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-[#0F52BA]" />
                                Key Vehicle Specifications
                            </h2>

                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 border-t border-neutral-100 divide-y md:divide-y-0 divide-neutral-100">
                                {[
                                    { label: "Year", value: vehicle.year },
                                    { label: "Mileage", value: `${vehicle.mileage} km` },
                                    { label: "Transmission", value: vehicle.transmission },
                                    { label: "Fuel Type", value: vehicle.fuelType },
                                    { label: "Engine Capacity", value: vehicle.engineCapacity || "Standard" },
                                    { label: "Condition", value: vehicle.condition },
                                    { label: "District", value: `${vehicle.city ? `${vehicle.city}, ` : ""}${vehicle.district}` },
                                    { label: "Listing ID", value: vehicle.refId, isMono: true },
                                ].map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-center justify-between py-3.5 border-b border-neutral-100 text-sm"
                                    >
                                        <span className="text-neutral-500 font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0F52BA]" />
                                            {item.label}
                                        </span>
                                        <span className={`font-bold text-neutral-900 ${item.isMono ? "font-mono text-[#0F52BA]" : ""}`}>
                                            {item.value}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
                            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-[#0F52BA]" />
                                Seller Description & Highlights
                            </h2>

                            {vehicle.description ? (
                                <div className="text-neutral-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                                    {vehicle.description}
                                </div>
                            ) : (
                                <p className="text-neutral-500 text-sm italic">
                                    No custom description provided by seller. Please contact the seller directly using the details on this page for specific service histories and inspection details.
                                </p>
                            )}

                            {/* Standard Highlights Pill Checklist */}
                            {/* <div className="mt-8 pt-6 border-t border-neutral-100">
                                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider block mb-3">
                                    Equipment & Features Checklist
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-neutral-700">
                                    {[
                                        "Air Conditioning & Climate Control",
                                        "Power Steering & Electric Windows",
                                        "Anti-Lock Braking System (ABS)",
                                        "Dual SRS Safety Airbags",
                                        "Reverse Camera / Parking Assist",
                                        "Factory Alloy Wheels",
                                        "Keyless Entry & Push Start",
                                        "Multifunction Steering Wheel",
                                        "Touchscreen Infotainment System",
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            <span className="truncate">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div> */}
                        </div>

                        {/* Interactive Financial & Lease Calculator */}
                        <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F52BA]">
                                        Instant Finance Estimator
                                    </span>
                                    <h2 className="text-xl font-black text-neutral-900">
                                        Monthly Lease & Loan Calculator
                                    </h2>
                                </div>
                                <span className="text-xs text-neutral-500">
                                    Rates indicative based on current banking standards
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-neutral-50 border border-neutral-200 mb-6">
                                {/* Down Payment */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-neutral-600">Down Payment</span>
                                        <span className="text-[#0F52BA]">{downPaymentPercent}% (LKR {downPaymentAmount.toLocaleString()})</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="60"
                                        step="5"
                                        value={downPaymentPercent}
                                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                                        className="w-full accent-[#0F52BA] cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                                        <span>10%</span>
                                        <span>60%</span>
                                    </div>
                                </div>

                                {/* Loan Duration */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-neutral-600">Loan Tenure</span>
                                        <span className="text-[#0F52BA]">{loanYears} Years ({loanYears * 12} mo)</span>
                                    </div>
                                    <select
                                        value={loanYears}
                                        onChange={(e) => setLoanYears(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-bold focus:outline-none focus:border-[#0F52BA]"
                                    >
                                        <option value={2}>2 Years (24 Months)</option>
                                        <option value={3}>3 Years (36 Months)</option>
                                        <option value={4}>4 Years (48 Months)</option>
                                        <option value={5}>5 Years (60 Months)</option>
                                        <option value={7}>7 Years (84 Months)</option>
                                    </select>
                                </div>

                                {/* Interest Rate */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5">
                                        <span className="text-neutral-600">Annual Interest</span>
                                        <span className="text-[#0F52BA]">{interestRate}% p.a.</span>
                                    </div>
                                    <select
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-bold focus:outline-none focus:border-[#0F52BA]"
                                    >
                                        <option value={10}>10.0% p.a. (Prime Customer)</option>
                                        <option value={11}>11.0% p.a.</option>
                                        <option value={12}>12.0% p.a. (Standard Bank Rate)</option>
                                        <option value={13.5}>13.5% p.a.</option>
                                        <option value={15}>15.0% p.a. (Fast Approval)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Result Display Box */}
                            <div className="bg-[#121418] text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-[#0F52BA]">
                                <div>
                                    <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                                        Estimated Monthly Installment
                                    </span>
                                    <div className="text-2xl sm:text-3xl font-black text-[#87CEEB]">
                                        LKR {monthlyEstimate.toLocaleString()}{" "}
                                        <span className="text-xs text-neutral-400 font-normal">/ month</span>
                                    </div>
                                    <span className="text-[11px] text-neutral-400 block mt-1">
                                        Financing LKR {(vehicle.priceLKR - downPaymentAmount).toLocaleString()} over {loanYears * 12} installments
                                    </span>
                                </div>

                                <Link
                                    href={`/offers?applyRef=${vehicle.refId}&amount=${vehicle.priceLKR - downPaymentAmount}`}
                                    className="px-6 py-3.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-md cursor-pointer text-center"
                                >
                                    Inquire for Financing
                                </Link>
                            </div>
                        </div>

                        {/* Safety & Anti-Fraud Notice */}
                        <div className="bg-amber-50 border border-amber-200 p-5 flex items-start gap-3.5 text-xs text-amber-900">
                            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <div>
                                <strong className="font-bold block mb-0.5">Important Safety Advice for Vehicle Buyers</strong>
                                <span>
                                    Always inspect the vehicle and original registration certificate (CR) in person before making any payments. Never send advance deposits or transfer fees through digital banking before a physical inspection.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Price & Seller Contact Card (4-5 Cols) */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20">
                        {/* Pricing & Direct CTAs Box */}
                        <div className="bg-white border-2 border-neutral-900 p-6 sm:p-8 shadow-xl">
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                                Total Price
                            </span>
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-3xl sm:text-4xl font-black text-[#0F52BA] tracking-tight">
                                    LKR {vehicle.priceLKR.toLocaleString()}
                                </span>
                            </div>

                            {vehicle.isNegotiable && (
                                <span className="inline-block mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 uppercase tracking-wider">
                                    ✓ Price is Negotiable with Seller
                                </span>
                            )}

                            {/* Estimated Lease Badge */}
                            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                                <span>Estimated Lease:</span>
                                <strong className="text-neutral-900 font-extrabold">
                                    ~LKR {monthlyEstimate.toLocaleString()} / mo
                                </strong>
                            </div>

                            {/* Contact Action Buttons */}
                            <div className="mt-6 space-y-3">
                                {/* Direct Call Button with Number Reveal */}
                                {isPhoneRevealed ? (
                                    <a
                                        href={`tel:${vehicle.sellerPhone}`}
                                        className="w-full py-4 bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        <span>Call: {vehicle.sellerPhone}</span>
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsPhoneRevealed(true)}
                                        className="w-full py-4 bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                                    >
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        <span>Reveal Contact Number</span>
                                    </button>
                                )}

                                {/* WhatsApp Button */}
                                {vehicle.hasWhatsApp && (
                                    <a
                                        href={whatsAppHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            if (!pageUrl && typeof window !== "undefined") {
                                                const cleanPhone = (vehicle.sellerPhone || "").replace(/[^0-9]/g, "");
                                                const formattedPhone = cleanPhone.startsWith("0") ? `94${cleanPhone.slice(1)}` : cleanPhone;
                                                const msg = encodeURIComponent(
                                                    `Hello ${vehicle.sellerName || ""}, I am inquiring about your ${vehicle.year} ${vehicle.brand} ${vehicle.model} (Ref ID: ${vehicle.refId}) on Lumi Marketplace.\n\nLink: ${window.location.href}`
                                                );
                                                e.currentTarget.href = `https://wa.me/${formattedPhone}?text=${msg}`;
                                            }
                                        }}
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.164.577 4.195 1.583 5.952l-1.683 6.148 6.31-1.656c1.696.924 3.633 1.456 5.69 1.456 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                                        </svg>
                                        <span>Chat on WhatsApp</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Verified Seller Profile Card */}
                        <div className="bg-white border border-neutral-200 p-6 shadow-sm">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-4">
                                Seller & Verification Profile
                            </h3>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center font-black text-xl shrink-0">
                                    {(vehicle.sellerName || "V").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-base font-black text-neutral-900 truncate">
                                        {vehicle.sellerName || "Verified Dealer"}
                                    </h4>
                                    <span className="text-xs text-neutral-500 block truncate">
                                        Location: {vehicle.district}, Sri Lanka
                                    </span>
                                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>Lumi Verified Member</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Vehicles Recommendation Carousel / Grid */}
                {similarVehicles && similarVehicles.length > 0 && (
                    <div className="mt-16 sm:mt-24 pt-12 border-t border-neutral-200">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F52BA] block mb-1">
                                    More in {vehicle.category}
                                </span>
                                <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                                    Similar Vehicles You May Like
                                </h3>
                            </div>
                            <Link
                                href={`/vehicles?category=${encodeURIComponent(vehicle.category)}`}
                                className="text-xs font-bold uppercase tracking-wider text-[#0F52BA] hover:underline"
                            >
                                View All ({vehicle.category}) →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarVehicles.map((item) => {
                                const simCover =
                                    item.images && item.images.length > 0
                                        ? item.images[0]
                                        : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80";

                                return (
                                    <Link
                                        key={item._id}
                                        href={`/vehicles/${item._id}`}
                                        className="group bg-white border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                                    >
                                        <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-108"
                                                style={{ backgroundImage: `url('${simCover}')` }}
                                            />
                                            <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5">
                                                {item.year}
                                            </span>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-sm font-black text-neutral-900 group-hover:text-[#0F52BA] transition-colors line-clamp-1">
                                                    {item.brand} {item.model}
                                                </h4>
                                                <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                                                    {item.district} • {item.mileage}km • {item.transmission}
                                                </p>
                                            </div>

                                            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                                                <span className="text-sm font-black text-[#0F52BA]">
                                                    LKR {item.priceLKR.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider group-hover:text-neutral-900">
                                                    View Details →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
