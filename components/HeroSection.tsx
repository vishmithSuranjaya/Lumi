"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const carMakes = [
    { id: "all", name: "All Makes", count: 142 },
    { id: "audi", name: "Audi", count: 28 },
    { id: "bmw", name: "BMW", count: 34, selected: true },
    { id: "geely", name: "Geely", count: 12 },
    { id: "genesis", name: "Genesis", count: 8, selected: true },
    { id: "honda", name: "Honda", count: 19 },
    { id: "hyundai", name: "Hyundai", count: 23 },
    { id: "infiniti", name: "Infiniti", count: 7 },
    { id: "mercedes", name: "Mercedes-Benz", count: 41 },
    { id: "porsche", name: "Porsche", count: 15 },
];

const carModels = [
    {
        group: "BMW Models",
        items: [
            { id: "bmw-1", name: "1 Series", selected: true },
            { id: "bmw-3", name: "3 Series", selected: false },
            { id: "bmw-4", name: "4 Series", selected: false },
            { id: "bmw-5gt", name: "5 Series GT", selected: false },
            { id: "bmw-m4", name: "M4 Competition", selected: false },
        ],
    },
    {
        group: "Genesis Models",
        items: [
            { id: "gen-g70", name: "G70 Sport", selected: true },
            { id: "gen-g80", name: "G80", selected: false },
            { id: "gen-gv70", name: "GV70", selected: false },
            { id: "gen-gv80", name: "GV80", selected: false },
        ],
    },
];

export default function HeroSection() {
    // State for interactive UI sliders & controls
    const [selectedMakes, setSelectedMakes] = useState<string[]>(["bmw", "genesis"]);
    const [selectedModels, setSelectedModels] = useState<string[]>(["bmw-1", "gen-g70"]);
    const [yearRange, setYearRange] = useState({ min: 1991, max: 2024 });
    const [priceRange, setPriceRange] = useState({ min: 1000, max: 90000 });
    const [mileageRange, setMileageRange] = useState({ min: 1900, max: 360000 });
    const [engineVolume, setEngineVolume] = useState({ min: 1.0, max: 5.5 });
    const [seats, setSeats] = useState("All");
    const [powerRange, setPowerRange] = useState({ min: 100, max: 800 });
    const [sortBy, setSortBy] = useState("Recommended");

    const toggleMake = (id: string) => {
        setSelectedMakes((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleModel = (id: string) => {
        setSelectedModels((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setSelectedMakes([]);
        setSelectedModels([]);
        setYearRange({ min: 1991, max: 2024 });
        setPriceRange({ min: 1000, max: 90000 });
        setMileageRange({ min: 1900, max: 360000 });
        setEngineVolume({ min: 1.0, max: 5.5 });
        setSeats("All");
        setPowerRange({ min: 100, max: 800 });
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
            <div className="hidden md:block relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 md:-mt-60 z-20">
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
                        {/* Col 1: Car Make List (3 cols) */}
                        <div className="lg:col-span-3 flex flex-col">
                            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                                Vehicle Make
                            </label>
                            <div className="border border-neutral-200 rounded-sm bg-neutral-50/50 h-56 overflow-y-auto divide-y divide-neutral-100 text-sm">
                                {carMakes.map((make) => {
                                    const isSelected = selectedMakes.includes(make.id);
                                    return (
                                        <button
                                            key={make.id}
                                            type="button"
                                            onClick={() => toggleMake(make.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-100/80 transition-colors cursor-pointer ${
                                                isSelected ? "bg-red-50/60 font-semibold text-neutral-900" : "text-neutral-600"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                                                        isSelected
                                                            ? "border-[#C8102E] bg-white"
                                                            : "border-neutral-300 bg-white"
                                                    }`}
                                                >
                                                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#C8102E]" />}
                                                </span>
                                                <span className={isSelected ? "text-[#C8102E]" : "text-neutral-700"}>
                                                    {make.name}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-neutral-400">({make.count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Col 2: Car Model List (3 cols) */}
                        <div className="lg:col-span-3 flex flex-col">
                            <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                                Model Series
                            </label>
                            <div className="border border-neutral-200 rounded-sm bg-neutral-50/50 h-56 overflow-y-auto text-sm p-1 divide-y divide-neutral-100">
                                {carModels.map((group) => (
                                    <div key={group.group} className="py-1">
                                        <span className="block px-2 py-1 text-[11px] font-bold text-neutral-500 tracking-wide bg-neutral-100/70 uppercase">
                                            {group.group}
                                        </span>
                                        {group.items.map((model) => {
                                            const isSelected = selectedModels.includes(model.id);
                                            return (
                                                <button
                                                    key={model.id}
                                                    type="button"
                                                    onClick={() => toggleModel(model.id)}
                                                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-neutral-100/80 transition-colors cursor-pointer rounded-xs ${
                                                        isSelected ? "bg-red-50/60 font-semibold text-neutral-900" : "text-neutral-600"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                                                                isSelected
                                                                    ? "border-[#C8102E] bg-white"
                                                                    : "border-neutral-300 bg-white"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <span className="w-2 h-2 rounded-full bg-[#C8102E]" />
                                                            )}
                                                        </span>
                                                        <span className={isSelected ? "text-[#C8102E]" : "text-neutral-700"}>
                                                            {model.name}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Col 3 & 4: Numerical Range Sliders & Dropdowns (6 cols) */}
                        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Year Slider */}
                            <div className="flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Manufactured Year
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="1991"
                                        max="2024"
                                        value={yearRange.max}
                                        onChange={(e) =>
                                            setYearRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                                    <span>{yearRange.min}</span>
                                    <span className="font-bold text-neutral-800">{yearRange.max}</span>
                                </div>
                            </div>

                            {/* Price Slider */}
                            <div className="flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Price Range ($ USD)
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="1000"
                                        max="90000"
                                        step="1000"
                                        value={priceRange.max}
                                        onChange={(e) =>
                                            setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                                    <span>${priceRange.min.toLocaleString()}</span>
                                    <span className="font-bold text-[#C8102E]">
                                        ${priceRange.max.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Mileage Slider */}
                            <div className="flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Mileage (km)
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="1900"
                                        max="360000"
                                        step="1000"
                                        value={mileageRange.max}
                                        onChange={(e) =>
                                            setMileageRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-[#C8102E]/30 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                                    <span className="text-[#C8102E] font-semibold">
                                        {mileageRange.min.toLocaleString()} km
                                    </span>
                                    <span className="text-[#C8102E] font-bold">
                                        {mileageRange.max.toLocaleString()} km
                                    </span>
                                </div>
                            </div>

                            {/* Engine Volume Slider */}
                            <div className="flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Engine Volume (L)
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="1.0"
                                        max="5.5"
                                        step="0.1"
                                        value={engineVolume.max}
                                        onChange={(e) =>
                                            setEngineVolume((prev) => ({ ...prev, max: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                                    <span>{engineVolume.min.toFixed(1)} L</span>
                                    <span className="font-bold text-neutral-800">
                                        {engineVolume.max.toFixed(1)} L
                                    </span>
                                </div>
                            </div>

                            {/* Cabin Seats Select */}
                            <div className="flex flex-col justify-between">
                                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                                    Cabin Seating
                                </span>
                                <div className="relative">
                                    <select
                                        value={seats}
                                        onChange={(e) => setSeats(e.target.value)}
                                        className="w-full py-2 px-3 border border-neutral-300 rounded-none bg-white text-sm text-neutral-800 focus:outline-none focus:border-[#C8102E] appearance-none cursor-pointer"
                                    >
                                        <option value="All">All Seating Capacities</option>
                                        <option value="2">2 Seats (Coupe / Roadster)</option>
                                        <option value="4">4 Seats</option>
                                        <option value="5">5 Seats (Sedan / SUV)</option>
                                        <option value="7">7+ Seats (Van / Large SUV)</option>
                                    </select>
                                    <svg
                                        className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>
                            </div>

                            {/* Engine Power Slider */}
                            <div className="flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                                        Engine Power (HP)
                                    </span>
                                </div>
                                <div className="relative py-2">
                                    <input
                                        type="range"
                                        min="100"
                                        max="800"
                                        step="10"
                                        value={powerRange.max}
                                        onChange={(e) =>
                                            setPowerRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                                        }
                                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C8102E]"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-neutral-500 font-mono">
                                    <span>{powerRange.min} hp</span>
                                    <span className="font-bold text-neutral-800">{powerRange.max} hp</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action / Sort Bar */}
                    <div className="bg-neutral-100/80 px-6 sm:px-8 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                                Sort By:
                            </span>
                            <div className="relative min-w-[180px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full py-2 px-3 border border-neutral-300 rounded-none bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:border-neutral-500 appearance-none cursor-pointer"
                                >
                                    <option value="Recommended">Recommended</option>
                                    <option value="PriceLowHigh">Price: Low to High</option>
                                    <option value="PriceHighLow">Price: High to Low</option>
                                    <option value="YearNew">Year: Newest First</option>
                                    <option value="MileageLow">Mileage: Lowest First</option>
                                </select>
                                <svg
                                    className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Action Button */}
                        <Link
                            href="/vehicles"
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold tracking-wider text-white bg-neutral-900 hover:bg-black rounded-none transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                            <span>SEARCH VEHICLES</span>
                            <svg className="w-4 h-4 fill-none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}