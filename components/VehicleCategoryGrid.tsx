"use client";

import React from "react";
import Link from "next/link";
import { VEHICLE_CATEGORIES } from "@/lib/validations/advertisement";

// Custom tailored SVG icons for each specific vehicle and equipment category
function CategoryIcon({ category }: { category: string }) {
    switch (category) {
        case "Cars & Sedans":
            return (
                <img
                    src="/category/sedan.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "SUVs & 4x4":
            return (
                <img
                    src="/category/suv.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "Sports & Luxury Coupes":
            return (
                <img
                    src="/category/sport_car.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "Motorcycles & Scooters":
            return (
                <img
                    src="/category/bike.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "Three-Wheelers (Tuk-Tuk)":
            return (
                <img
                    src="/category/three_wheeler.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "Lorries & Commercial Trucks":
            return (
                <img
                    src="/category/lorry.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "Buses & Vans":
            return (
                <img
                    src="/category/bus.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        case "Tractors & Heavy Machinery":
            return (
                <img
                    src="/category/heavy_machinery.png"
                    alt="Cars & Sedans"
                    className="max-h-24 max-w-[130px] sm:max-h-28 sm:max-w-[150px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
            );

        default:
            return (
                <svg className="w-12 h-12 sm:w-14 sm:h-14 text-neutral-700 group-hover:scale-105 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H6.5c-.8 0-1.5.4-1.9 1.1L2.3 12.3c-.2.4-.3.9-.3 1.4V16c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                </svg>
            );
    }
}

// Optional subtitle or short description for each category
const categoryTaglines: Record<string, string> = {
    "Cars & Sedans": "Family & Executive",
    "SUVs & 4x4": "Off-Road & Adventure",
    "Sports & Luxury Coupes": "High-Performance",
    "Motorcycles & Scooters": "Two-Wheeler Mobility",
    "Three-Wheelers (Tuk-Tuk)": "City Commuter",
    "Lorries & Commercial Trucks": "Heavy Haul & Cargo",
    "Buses & Vans": "Group & Passenger",
    "Tractors & Heavy Machinery": "Agri & Construction",
};

export default function VehicleCategoryGrid() {
    return (
        <section className="w-full bg-white py-12 sm:py-16 border-b border-neutral-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-2">
                            <span className="w-2.5 h-2.5 bg-[#0F52BA]" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F52BA]">
                                Automotive Marketplace
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
                            Browse by Vehicle Category
                        </h2>
                        <p className="text-neutral-500 text-xs sm:text-sm mt-1">
                            Find the exact vehicle or machinery type suited to your lifestyle and business needs.
                        </p>
                    </div>

                    <Link
                        href="/vehicles"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F52BA] hover:text-[#0c4399] transition-colors group self-start sm:self-auto cursor-pointer"
                    >
                        <span>View All Vehicles</span>
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>

                {/* 8 Category Cards Grid - 2 Rows (4 Columns on tablet/desktop) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {VEHICLE_CATEGORIES.map((category) => (
                        <Link
                            key={category}
                            href={`/vehicles?category=${encodeURIComponent(category)}`}
                            className="group bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 p-5 sm:p-6 flex flex-col items-center text-center justify-between min-h-[180px] sm:min-h-[205px] cursor-pointer"
                        >
                            {/* Icon / Image Container - Transparent, no gray background or hover color change */}
                            <div className="w-full h-24 sm:h-28 flex items-center justify-center mb-3">
                                <CategoryIcon category={category} />
                            </div>

                            {/* Titles */}
                            <div className="w-full">
                                <h3 className="text-sm sm:text-[15px] font-black text-neutral-900 line-clamp-2 leading-snug">
                                    {category}
                                </h3>
                                <span className="text-xs text-neutral-400 font-medium block mt-1 line-clamp-1">
                                    {categoryTaglines[category] || "Browse"}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
