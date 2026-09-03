"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Vehicle {
    id: number;
    title: string;
    subtitle: string;
    category: string;
    priceUSD: string;
    priceLKR: string;
    year: number;
    mileage: string;
    transmission: string;
    fuel: string;
    engine: string;
    power: string;
    badge: string;
    badgeColor: string;
    image: string;
    featured: boolean;
}

const sampleVehicles: Vehicle[] = [
    {
        id: 1,
        title: "Mercedes-AMG G63 BiTurbo",
        subtitle: "Obsidian Black Metallic • Night Package",
        category: "SUV",
        priceUSD: "$245,000",
        priceLKR: "LKR 78,500,000",
        year: 2024,
        mileage: "4,200 km",
        transmission: "9G-Tronic Auto",
        fuel: "Petrol",
        engine: "4.0L V8 BiTurbo",
        power: "577 HP",
        badge: "Certified Luxury",
        badgeColor: "bg-[#0F52BA]",
        image: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=900&q=80",
        featured: true,
    },
    {
        id: 2,
        title: "Porsche 911 Carrera S (992)",
        subtitle: "Guards Red • Sport Chrono Package",
        category: "Sports",
        priceUSD: "$175,000",
        priceLKR: "LKR 56,000,000",
        year: 2023,
        mileage: "8,500 km",
        transmission: "8-Speed PDK",
        fuel: "Petrol",
        engine: "3.0L Twin-Turbo Flat-6",
        power: "443 HP",
        badge: "Verified Inspection",
        badgeColor: "bg-[#C8102E]",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
        featured: true,
    },
    {
        id: 3,
        title: "Land Rover Defender 110 X-Dynamic",
        subtitle: "Santorini Black • Air Suspension & Off-Road Pack",
        category: "SUV",
        priceUSD: "$148,000",
        priceLKR: "LKR 47,500,000",
        year: 2024,
        mileage: "2,100 km",
        transmission: "8-Speed AWD",
        fuel: "Mild Hybrid / Petrol",
        engine: "3.0L Turbocharged I6",
        power: "395 HP",
        badge: "Under Warranty",
        badgeColor: "bg-emerald-700",
        image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=900&q=80",
        featured: false,
    },
    {
        id: 4,
        title: "BMW M4 Competition M xDrive",
        subtitle: "Isle of Man Green • Carbon Ceramic Brakes",
        category: "Coupe",
        priceUSD: "$138,000",
        priceLKR: "LKR 44,200,000",
        year: 2024,
        mileage: "3,400 km",
        transmission: "8-Speed M Steptronic",
        fuel: "Petrol",
        engine: "3.0L M TwinPower Turbo I6",
        power: "503 HP",
        badge: "Special Leasing Rate",
        badgeColor: "bg-amber-600",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
        featured: false,
    },
];

const categories = ["All Vehicles", "SUV", "Sports", "Coupe", "Sedan", "Commercial"];

export default function VehiclesPage() {
    const [selectedCategory, setSelectedCategory] = useState("All Vehicles");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredVehicles = sampleVehicles.filter((vehicle) => {
        const matchesCategory =
            selectedCategory === "All Vehicles" || vehicle.category === selectedCategory;
        const matchesSearch =
            vehicle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-neutral-900">
            {/* Navigation Bar */}
            <Navbar />

            <main className="flex-1">
                {/* Hero / Header Section */}
                <section className="relative w-full bg-[#0e1014] text-white py-14 sm:py-16 overflow-hidden border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">Vehicle Inventory</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                                    Exclusive Vehicle Collection
                                </h1>
                                <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
                                    Verified luxury automobiles, certified sports coupes, and high-performance SUVs available for immediate handover in Sri Lanka.
                                </p>
                            </div>

                            {/* Search Box */}
                            <div className="w-full md:w-80">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search make or model..."
                                        className="w-full bg-[#1b1f24] border border-neutral-700 px-4 py-3 pl-10 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#0F52BA] transition-colors"
                                    />
                                    <svg
                                        className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-[#0F52BA] text-white shadow-md"
                                            : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-neutral-700/60"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vehicle Grid Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
                        <span className="text-xs sm:text-sm font-bold text-neutral-600 uppercase tracking-wider">
                            Showing <strong className="text-neutral-900 font-extrabold">{filteredVehicles.length}</strong> Premium Vehicles
                        </span>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
                            <select className="bg-white border border-neutral-300 text-xs font-semibold px-3 py-2 text-neutral-800 focus:outline-none focus:border-[#0F52BA]">
                                <option value="featured">Featured First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="year-desc">Year: Newest First</option>
                            </select>
                        </div>
                    </div>

                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {filteredVehicles.map((car) => (
                            <div
                                key={car.id}
                                className="group bg-white border border-neutral-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                            >
                                <div>
                                    {/* Image Container with Badges */}
                                    <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-neutral-100">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108"
                                            style={{ backgroundImage: `url('${car.image}')` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                        {/* Status Badge */}
                                        <span className={`absolute top-3 left-3 ${car.badgeColor} text-white text-[11px] font-extrabold px-3 py-1 uppercase tracking-wider shadow-sm`}>
                                            {car.badge}
                                        </span>

                                        {/* Year Badge */}
                                        <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1">
                                            {car.year}
                                        </span>

                                        {/* Category Tag on bottom left */}
                                        <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-0.5 uppercase tracking-wider">
                                            {car.category}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <h3 className="text-base font-black text-neutral-900 group-hover:text-[#0F52BA] transition-colors leading-snug">
                                            {car.title}
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                                            {car.subtitle}
                                        </p>

                                        {/* Price Box */}
                                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-baseline justify-between">
                                            <div>
                                                <span className="text-lg font-black text-neutral-900">
                                                    {car.priceUSD}
                                                </span>
                                                <span className="block text-[11px] font-semibold text-neutral-500">
                                                    ≈ {car.priceLKR}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold text-[#0F52BA] uppercase tracking-wider">
                                                Negotiable
                                            </span>
                                        </div>

                                        {/* Key Specs Grid */}
                                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 bg-neutral-50 p-3 border border-neutral-100">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{car.mileage}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                                </svg>
                                                <span>{car.power}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                                </svg>
                                                <span>{car.transmission}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                                </svg>
                                                <span>{car.fuel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
                                    <Link
                                        href={`/contact_us?inquire=${car.id}`}
                                        className="py-2.5 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider text-center transition-all active:scale-95 cursor-pointer"
                                    >
                                        Inquire
                                    </Link>
                                    <Link
                                        href={`/contact_us?testdrive=${car.id}`}
                                        className="py-2.5 px-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        Test Drive
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Assistance Banner */}
                    <div className="mt-16 bg-[#121418] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-[#C8102E]">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8102E] block mb-1">
                                Custom Vehicle Sourcing
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black">
                                Looking for a Specific Make, Model, or Machinery?
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
                                Our VIP concierge team directly imports vehicles and equipment from Japan, the UK, and Europe with full inspection guarantees.
                            </p>
                        </div>
                        <Link
                            href="/contact_us"
                            className="px-8 py-4 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all whitespace-nowrap shadow-lg active:scale-95 cursor-pointer"
                        >
                            Request Direct Import
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
