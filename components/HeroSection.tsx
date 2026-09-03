"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    VEHICLE_CATEGORIES,
    SRI_LANKA_DISTRICTS,
    VEHICLE_CONDITIONS,
} from "@/lib/validations/advertisement";

const popularBrands = [
    "Toyota",
    "Suzuki",
    "Honda",
    "Nissan",
    "Mitsubishi",
    "BMW",
    "Mercedes-Benz",
    "Hyundai",
    "Kia",
    "Bajaj",
    "Isuzu",
    "Land Rover",
];

export default function HeroSection() {
    const router = useRouter();

    // State for interactive search filters
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
    const [selectedCondition, setSelectedCondition] = useState("All Conditions");
    const [yearRange, setYearRange] = useState({
        min: 2000,
        max: new Date().getFullYear() + 1,
    });
    // Keep the price filter still (in LKR)
    const [priceRange, setPriceRange] = useState({ min: 500000, max: 100000000 });

    const clearFilters = () => {
        setSelectedCategory("All Categories");
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedDistrict("All Districts");
        setSelectedCondition("All Conditions");
        setYearRange({ min: 2000, max: new Date().getFullYear() + 1 });
        setPriceRange({ min: 500000, max: 100000000 });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (selectedCategory && selectedCategory !== "All Categories") {
            params.set("category", selectedCategory);
        }
        if (selectedBrand.trim()) {
            params.set("brand", selectedBrand.trim());
        }
        if (selectedModel.trim()) {
            params.set("model", selectedModel.trim());
        }
        if (selectedDistrict && selectedDistrict !== "All Districts") {
            params.set("district", selectedDistrict);
        }
        if (selectedCondition && selectedCondition !== "All Conditions") {
            params.set("condition", selectedCondition);
        }
        if (priceRange.max < 100000000) {
            params.set("maxPrice", priceRange.max.toString());
        }
        if (priceRange.min > 500000) {
            params.set("minPrice", priceRange.min.toString());
        }
        if (yearRange.min > 2000) {
            params.set("minYear", yearRange.min.toString());
        }
        if (yearRange.max < new Date().getFullYear() + 1) {
            params.set("maxYear", yearRange.max.toString());
        }

        const queryString = params.toString();
        router.push(`/vehicles${queryString ? `?${queryString}` : ""}`);
    };

    return (
        <section className="relative w-full bg-[#f8f9fa] pb-8 md:pb-20 overflow-hidden">
            {/* Left Social Vertical Bar */}
            <div className="hidden xl:flex fixed left-6 top-1/3 -translate-y-1/2 flex-col items-center gap-6 z-30 pointer-events-auto">
                <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-medium [writing-mode:vertical-rl] rotate-180 select-none">
                    Follow Us
                </span>
                <div className="w-px h-8 bg-neutral-300" />
                <div className="flex flex-col gap-3">
                    {/* Telegram */}
                    <a
                        href="#telegram"
                        aria-label="Telegram"
                        className="w-9 h-9 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#0F52BA] hover:border-[#0F52BA] hover:scale-110 transition-all"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                    </a>
                    {/* Messenger */}
                    <a
                        href="#messenger"
                        aria-label="Messenger"
                        className="w-9 h-9 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#0F52BA] hover:border-[#0F52BA] hover:scale-110 transition-all"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.909 1.455 5.507 3.736 7.159V22l3.435-1.885c.913.253 1.879.391 2.829.391 5.523 0 10-4.145 10-9.248C22 6.145 17.523 2 12 2zm1.06 12.434l-2.61-2.784-5.094 2.784 5.602-5.946 2.673 2.784 5.032-2.784-5.603 5.946z" />
                        </svg>
                    </a>
                    {/* WhatsApp */}
                    <a
                        href="#whatsapp"
                        aria-label="WhatsApp"
                        className="w-9 h-9 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-600 hover:scale-110 transition-all"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.79 14.07c-.24.68-1.21 1.25-1.68 1.33-.45.08-1.04.11-3.05-.72-2.57-1.07-4.22-3.7-4.35-3.87-.13-.17-1.04-1.38-1.04-2.64 0-1.25.66-1.87.89-2.12.24-.26.52-.32.7-.32.17 0 .35.01.5.01.16.01.38-.06.59.45.22.52.74 1.8.81 1.93.07.13.11.28.02.45-.09.18-.14.28-.27.44-.13.16-.28.35-.4.47-.13.13-.27.27-.12.53.16.26.69 1.14 1.48 1.85 1.02.91 1.88 1.19 2.15 1.32.27.13.43.11.59-.07.16-.18.69-.8 87-1.08.18-.27.37-.23.62-.13.25.09 1.6.75 1.87.89.28.13.46.2.53.31.07.11.07.65-.17 1.33z" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Right Social Vertical Bar */}
            <div className="hidden xl:flex fixed right-6 top-1/3 -translate-y-1/2 flex-col items-center gap-8 z-30 pointer-events-auto">
                <a
                    href="#instagram"
                    className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 hover:text-black font-medium [writing-mode:vertical-rl] transition-colors"
                >
                    Instagram
                </a>
                <div className="w-px h-6 bg-neutral-300" />
                <a
                    href="#facebook"
                    className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 hover:text-black font-medium [writing-mode:vertical-rl] transition-colors"
                >
                    Facebook
                </a>
            </div>

            {/* Top Car Banner Showcase */}
            <div className="relative w-full min-h-[440px] sm:min-h-[500px] md:h-[580px] lg:h-[640px] bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 overflow-hidden flex items-center justify-center py-16 md:py-0">
                {/* Background Car Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=2000&q=85')`,
                    }}
                >
                    {/* Subtle warm sunset & dark edge overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
                    <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60" />
                </div>

                {/* Hero Title Overlay */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto md:-mt-28">
                    <span className="inline-block px-4 py-1.5 mb-3 text-xs font-semibold uppercase tracking-widest text-[#87CEEB] bg-black/60 backdrop-blur-md border border-[#87CEEB]/30 rounded-full">
                        Premium Automotive Collection • Sri Lanka
                    </span>
                    <h1 className="p-4 text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-wide drop-shadow-lg leading-tight">
                        Find Your Dream Vehicle
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-neutral-200 max-w-2xl mx-auto drop-shadow font-light leading-relaxed">
                        Discover certified luxury sedans, sports performance coupes, rugged SUVs, commercial fleets, and heavy machinery with comprehensive inspection reports.
                    </p>
                </div>
            </div>

            {/* Searching Criteria / Filter Box */}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-36 md:-mt-52 z-20">
                <div className="bg-white rounded-none shadow-2xl border border-neutral-200/80 overflow-hidden">
                    {/* Red Header Banner */}
                    <div className="bg-[#C8102E] bg-gradient-to-r from-[#B00D26] via-[#C8102E] to-[#D91E3B] px-6 sm:px-8 py-4 sm:py-5 text-white flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-white/80">
                                Search Filters / Criteria
                            </span>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide">
                                Refine Your Vehicle Search
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-semibold tracking-wider text-white/90 hover:text-white underline underline-offset-4 hover:opacity-100 transition-opacity cursor-pointer uppercase"
                        >
                            Clear All Filters
                        </button>
                    </div>

                    {/* Filter Controls Grid */}
                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white">
                        {/* Col 1: Category & Make (4 cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                                    Vehicle Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full py-2.5 px-3 border border-neutral-300 rounded-none bg-white text-sm text-neutral-800 focus:outline-none focus:border-[#C8102E] cursor-pointer"
                                >
                                    <option value="All Categories">All Categories</option>
                                    {VEHICLE_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                                    Brand / Make
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        placeholder="e.g. Toyota, Honda, Suzuki"
                                        className="w-full py-2 px-3 border border-neutral-300 rounded-none bg-white text-sm text-neutral-800 focus:outline-none focus:border-[#C8102E]"
                                    />
                                    {/* Quick Popular Brand Tags */}
                                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                                        {popularBrands.map((b) => (
                                            <button
                                                key={b}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedBrand(
                                                        selectedBrand.toLowerCase() === b.toLowerCase() ? "" : b
                                                    )
                                                }
                                                className={`text-[11px] px-2.5 py-1 font-semibold transition-colors cursor-pointer border ${
                                                    selectedBrand.toLowerCase() === b.toLowerCase()
                                                        ? "bg-[#C8102E] text-white border-[#C8102E]"
                                                        : "bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200"
                                                }`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Col 2: Model & Location (4 cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                                    Model Series / Name
                                </label>
                                <input
                                    type="text"
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    placeholder="e.g. Axio, Prius, Prado, Vezel, Pulsar"
                                    className="w-full py-2.5 px-3 border border-neutral-300 rounded-none bg-white text-sm text-neutral-800 focus:outline-none focus:border-[#C8102E]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                                    District (Sri Lanka)
                                </label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full py-2.5 px-3 border border-neutral-300 rounded-none bg-white text-sm text-neutral-800 focus:outline-none focus:border-[#C8102E] cursor-pointer"
                                >
                                    <option value="All Districts">All Districts (Island-wide)</option>
                                    {SRI_LANKA_DISTRICTS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5">
                                    Condition
                                </label>
                                <select
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                    className="w-full py-2.5 px-3 border border-neutral-300 rounded-none bg-white text-sm text-neutral-800 focus:outline-none focus:border-[#C8102E] cursor-pointer"
                                >
                                    <option value="All Conditions">All Conditions</option>
                                    {VEHICLE_CONDITIONS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Col 3: Price Slider & Year (4 cols) */}
                        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                            {/* Price Slider - KEPT STILL AND FUNCTIONAL */}
                            <div className="flex flex-col justify-between bg-neutral-50/70 p-4 border border-neutral-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Price Range (LKR)
                                    </span>
                                    <span className="text-xs font-black text-[#C8102E]">
                                        {priceRange.max >= 100000000
                                            ? "Any Price"
                                            : `Up to LKR ${(priceRange.max / 1000000).toFixed(1)}M`}
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="500000"
                                        max="100000000"
                                        step="500000"
                                        value={priceRange.max}
                                        onChange={(e) =>
                                            setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                                    <span>LKR 500K</span>
                                    <span className="font-bold text-[#C8102E]">
                                        {priceRange.max >= 100000000
                                            ? "LKR 100M+"
                                            : `LKR ${priceRange.max.toLocaleString()}`}
                                    </span>
                                </div>
                            </div>

                            {/* Manufactured Year Slider */}
                            <div className="flex flex-col justify-between bg-neutral-50/70 p-4 border border-neutral-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Manufactured Year
                                    </span>
                                    <span className="text-xs font-bold text-neutral-800 font-mono">
                                        {yearRange.min} - {yearRange.max}
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="1990"
                                        max={new Date().getFullYear() + 1}
                                        value={yearRange.min}
                                        onChange={(e) =>
                                            setYearRange((prev) => ({ ...prev, min: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                                    <span>Min: {yearRange.min}</span>
                                    <span>Max: {yearRange.max}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="bg-neutral-100/80 px-6 sm:px-8 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-neutral-500 hidden sm:block">
                            Select criteria and click Search to explore all matching verified vehicles.
                        </p>

                        {/* Search Action Button */}
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="w-full sm:w-auto px-10 py-3.5 text-sm font-black tracking-wider text-white bg-neutral-900 hover:bg-[#C8102E] rounded-none transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] sm:ml-auto"
                        >
                            <span>SEARCH VEHICLES</span>
                            <svg className="w-4 h-4 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}