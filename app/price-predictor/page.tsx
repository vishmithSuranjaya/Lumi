"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface MetadataResponse {
    brands: string[];
    gears: string[];
    fuel_types: string[];
    leasing: string[];
    conditions: string[];
    accuracy: string;
    model_name: string;
    dataset_size: string;
}

export default function PricePredictorPage() {
    const [metadata, setMetadata] = useState<MetadataResponse>({
        brands: [
            "TOYOTA", "HONDA", "SUZUKI", "NISSAN", "MITSUBISHI",
            "HYUNDAI", "KIA", "MAZDA", "MERCEDES-BENZ", "BMW",
            "DAIHATSU", "AUDI", "MICRO", "SUBARU", "TATA", "PEUGEOT",
            "LAND-ROVER", "FORD", "RENAULT", "CHERY"
        ],
        gears: ["Automatic", "Manual"],
        fuel_types: ["Petrol", "Diesel", "Hybrid", "Electric"],
        leasing: ["No Leasing", "Ongoing Lease"],
        conditions: ["USED", "NEW"],
        accuracy: "90.1%",
        model_name: "Random Forest Regressor",
        dataset_size: "9,700+ Sri Lankan vehicle records"
    });

    const [formData, setFormData] = useState({
        brand: "",
        model_name: "",
        yom: 2020,
        engine_cc: 1500,
        gear: "Automatic",
        fuel_type: "Petrol",
        mileage_km: 55000,
        leasing: "No Leasing",
        condition: "Used",
        air_condition: true,
        power_steering: true,
        power_mirror: true,
        power_window: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [predictedLakhs, setPredictedLakhs] = useState<number | null>(null);
    const [predictedLkr, setPredictedLkr] = useState<number | null>(null);
    const [modelAccuracy, setModelAccuracy] = useState<string>("90.1%");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Hydrate options and health from microservice
    useEffect(() => {
        async function fetchMetadata() {
            try {
                const res = await fetch("/api/predict");
                if (res.ok) {
                    const data = await res.json();
                    setMetadata((prev) => ({ ...prev, ...data }));
                    if (data.accuracy) setModelAccuracy(data.accuracy);
                    if (data.brands?.length > 0 && !data.brands.includes(formData.brand)) {
                        setFormData((prev) => ({ ...prev, brand: data.brands[0] }));
                    }
                }
            } catch (err) {
                console.warn("Using default vehicle metadata:", err);
            }
        }
        fetchMetadata();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        if (errorMessage) setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Unable to calculate vehicle valuation.");
            }

            setPredictedLakhs(data.predicted_price_lakhs);
            setPredictedLkr(data.predicted_price_lkr);
            if (data.accuracy) setModelAccuracy(data.accuracy);

            // Smooth scroll to valuation result
            setTimeout(() => {
                const target = document.getElementById("valuation-result");
                target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);

        } catch (err: any) {
            setErrorMessage(err.message || "A network or server error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-neutral-900 font-sans">
            <Navbar />

            <main className="flex-1">
                {/* Hero Header matching Vehicles & Post Ad pages */}
                <section className="relative w-full bg-[#0e1014] text-white py-12 sm:py-16 border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">AI Valuation Engine</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                                    Vehicle Price Predictor
                                </h1>
                                <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
                                    Instant, unbiased market valuations based on machine learning analysis of 9,700+ verified Sri Lankan vehicle records.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-700/80 px-4 py-3 rounded-none">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <div>
                                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-bold">
                                        Model Accuracy
                                    </span>
                                    <span className="text-sm font-black text-white">
                                        R² Score: {modelAccuracy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Vehicle Identity */}
                        <div className="bg-white border border-neutral-200/90 shadow-xs p-6 sm:p-8">
                            <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                        01
                                    </span>
                                    <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                        Vehicle Identity & Core Specs
                                    </h2>
                                </div>
                                <span className="text-xs text-neutral-400 font-semibold">* Required fields</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {/* Brand */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Make / Brand *
                                    </label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    >
                                        {metadata.brands.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Model */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Vehicle Model
                                    </label>
                                    <input
                                        type="text"
                                        name="model_name"
                                        value={formData.model_name}
                                        onChange={handleChange}
                                        placeholder="e.g. COROLLA, ALLION, CIVIC"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors uppercase"
                                    />
                                </div>

                                {/* Year of Manufacture */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Year of Manufacture *
                                    </label>
                                    <input
                                        type="number"
                                        name="yom"
                                        min="1980"
                                        max="2026"
                                        value={formData.yom}
                                        onChange={handleChange}
                                        placeholder="e.g. 2018"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    />
                                </div>

                                {/* Engine Capacity */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Engine Capacity (cc) *
                                    </label>
                                    <input
                                        type="number"
                                        name="engine_cc"
                                        min="100"
                                        max="10000"
                                        value={formData.engine_cc}
                                        onChange={handleChange}
                                        placeholder="e.g. 1500"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    />
                                </div>

                                {/* Transmission */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Transmission *
                                    </label>
                                    <select
                                        name="gear"
                                        value={formData.gear}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    >
                                        {metadata.gears.map((g) => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fuel Type */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Fuel Type *
                                    </label>
                                    <select
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    >
                                        {metadata.fuel_types.map((f) => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mileage */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Mileage (km) *
                                    </label>
                                    <input
                                        type="number"
                                        name="mileage_km"
                                        min="0"
                                        step="1000"
                                        value={formData.mileage_km}
                                        onChange={handleChange}
                                        placeholder="e.g. 55000"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Condition & Financial Status */}
                        <div className="bg-white border border-neutral-200/90 shadow-xs p-6 sm:p-8">
                            <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                        02
                                    </span>
                                    <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                        Condition & Financial Status
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Condition */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Vehicle Condition *
                                    </label>
                                    <select
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    >
                                        <option value="USED">Registered / Used</option>
                                        <option value="NEW">Brand New / Unregistered</option>
                                    </select>
                                </div>

                                {/* Leasing */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Leasing Status *
                                    </label>
                                    <select
                                        name="leasing"
                                        value={formData.leasing}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                        required
                                    >
                                        <option value="No Leasing">No Outstanding Lease</option>
                                        <option value="Ongoing Lease">Ongoing Lease / Remaining</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Installed Features */}
                        <div className="bg-white border border-neutral-200/90 shadow-xs p-6 sm:p-8">
                            <div className="border-b border-neutral-100 pb-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 bg-[#0F52BA] text-white font-black text-xs flex items-center justify-center">
                                        03
                                    </span>
                                    <h2 className="text-base sm:text-lg font-black text-neutral-900 uppercase tracking-wide">
                                        Equipment & Comfort Features
                                    </h2>
                                </div>
                                <span className="text-xs text-neutral-400 font-semibold">Select applicable</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: "air_condition", label: "Air Conditioning" },
                                    { id: "power_steering", label: "Power Steering" },
                                    { id: "power_mirror", label: "Power Mirrors" },
                                    { id: "power_window", label: "Power Windows" },
                                ].map((item) => {
                                    const isChecked = Boolean((formData as any)[item.id]);
                                    return (
                                        <label
                                            key={item.id}
                                            className={`flex items-center justify-between p-4 border transition-all cursor-pointer select-none ${isChecked
                                                ? "bg-neutral-50 border-neutral-900 text-neutral-950 font-bold"
                                                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                                                }`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                            <input
                                                type="checkbox"
                                                name={item.id}
                                                checked={isChecked}
                                                onChange={handleChange}
                                                className="w-4 h-4 accent-[#0F52BA] cursor-pointer"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Error Alert */}
                        {errorMessage && (
                            <div className="bg-red-50 border-l-4 border-red-600 p-4 shadow-sm flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-bold text-red-900">Valuation Error</h4>
                                    <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit CTA */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto px-10 py-4 bg-[#0F52BA] hover:bg-[#0c4399] disabled:bg-neutral-400 text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        <span>Evaluating Market Records...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate Estimated Market Price</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        brand: "TOYOTA",
                                        model_name: "COROLLA",
                                        yom: 2018,
                                        engine_cc: 1500,
                                        gear: "Automatic",
                                        fuel_type: "Petrol",
                                        mileage_km: 55000,
                                        leasing: "No Leasing",
                                        condition: "USED",
                                        air_condition: true,
                                        power_steering: true,
                                        power_mirror: true,
                                        power_window: true,
                                    });
                                    setPredictedLakhs(null);
                                    setPredictedLkr(null);
                                    setErrorMessage(null);
                                }}
                                className="w-full sm:w-auto px-6 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                            >
                                Reset Fields
                            </button>
                        </div>
                    </form>

                    {/* Result Card: Crisp, Clean Monochrome + Blue Signature */}
                    {predictedLakhs !== null && (
                        <div
                            id="valuation-result"
                            className="mt-12 bg-white border border-neutral-300 shadow-md p-8 sm:p-10 border-t-4 border-t-[#0F52BA]"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F52BA] block mb-1">
                                        Valuation Complete • AI Model Prediction
                                    </span>
                                    <h3 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase">
                                        Estimated Fair Market Value
                                    </h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Based on real-time comparative sales across Sri Lankan automotive platforms.
                                    </p>
                                </div>

                                <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3.5 py-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-neutral-700">
                                        Model Reliability: {modelAccuracy}
                                    </span>
                                </div>
                            </div>

                            {/* Huge Numeric Valuation */}
                            <div className="py-8 flex flex-col sm:flex-row items-baseline gap-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-neutral-950">
                                        {predictedLakhs.toFixed(2)}
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-bold text-neutral-600">
                                        Lakhs
                                    </span>
                                </div>

                                {predictedLkr && (
                                    <span className="text-base sm:text-lg font-semibold text-neutral-500 sm:ml-4">
                                        (approx. <strong className="text-neutral-900 font-bold">Rs. {predictedLkr.toLocaleString()} LKR</strong>)
                                    </span>
                                )}
                            </div>

                            {/* Summary Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-100">
                                <div className="bg-neutral-50 border border-neutral-200 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                                        Vehicle
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900">
                                        {formData.brand} {formData.model_name ? formData.model_name.toUpperCase() : ""} ({formData.yom})
                                    </span>
                                </div>
                                <div className="bg-neutral-50 border border-neutral-200 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                                        Engine & Fuel
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900">
                                        {formData.engine_cc}cc • {formData.fuel_type}
                                    </span>
                                </div>
                                <div className="bg-neutral-50 border border-neutral-200 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                                        Transmission
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900">
                                        {formData.gear}
                                    </span>
                                </div>
                                <div className="bg-neutral-50 border border-neutral-200 p-3">
                                    <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold block">
                                        Odometer
                                    </span>
                                    <span className="text-sm font-bold text-neutral-900">
                                        {Number(formData.mileage_km).toLocaleString()} km
                                    </span>
                                </div>
                            </div>

                            {/* Call to Actions */}
                            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center gap-4">
                                <Link
                                    href="/post_advertisement"
                                    className="px-6 py-3.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                                >
                                    List Vehicle for Sale at this Price
                                </Link>
                                <Link
                                    href={`/vehicles?brand=${encodeURIComponent(formData.brand)}`}
                                    className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    Browse Matching {formData.brand} Listings
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Bottom Assistance Banner (Standard LUMI brand element) */}
                    <div className="mt-14 bg-[#121418] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-[#C8102E]">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8102E] block mb-1">
                                Certified Valuations & Inspections
                            </span>
                            <h3 className="text-lg sm:text-xl font-black uppercase">
                                Need an Official Valuation Certificate for Bank Leasing?
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
                                LUMI vehicle inspectors can examine the physical condition, engine health, and paperwork to produce certified inspection dossiers.
                            </p>
                        </div>
                        <Link
                            href="/contact_us"
                            className="px-8 py-4 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
                        >
                            Request Inspection
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
