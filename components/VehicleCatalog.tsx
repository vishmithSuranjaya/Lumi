"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { VEHICLE_CATEGORIES } from "@/lib/validations/advertisement";

export interface VehicleAd {
    _id: string;
    refId: string;
    category: string;
    brand: string;
    model: string;
    year: number;
    condition: string;
    mileage: string;
    fuelType: string;
    transmission: string;
    engineCapacity?: string;
    priceLKR: number;
    isNegotiable: boolean;
    district: string;
    city: string;
    description?: string;
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string;
    hasWhatsApp: boolean;
    images: string[];
    createdAt: string;
}

interface VehicleCatalogProps {
    initialVehicles: VehicleAd[];
    initialCategory?: string;
}

export default function VehicleCatalog({ initialVehicles, initialCategory }: VehicleCatalogProps) {
    const [selectedCategory, setSelectedCategory] = useState(
        initialCategory && VEHICLE_CATEGORIES.includes(initialCategory as any)
            ? initialCategory
            : "All Vehicles"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const categories = useMemo(() => ["All Vehicles", ...VEHICLE_CATEGORIES], []);

    // Filter and Sort Vehicles
    const filteredVehicles = useMemo(() => {
        return initialVehicles
            .filter((vehicle) => {
                const matchesCategory =
                    selectedCategory === "All Vehicles" || vehicle.category === selectedCategory;

                const searchLower = searchTerm.trim().toLowerCase();
                const matchesSearch =
                    !searchLower ||
                    vehicle.brand.toLowerCase().includes(searchLower) ||
                    vehicle.model.toLowerCase().includes(searchLower) ||
                    vehicle.district.toLowerCase().includes(searchLower) ||
                    vehicle.city.toLowerCase().includes(searchLower) ||
                    vehicle.refId.toLowerCase().includes(searchLower);

                return matchesCategory && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "price-asc") return a.priceLKR - b.priceLKR;
                if (sortBy === "price-desc") return b.priceLKR - a.priceLKR;
                if (sortBy === "year-desc") return b.year - a.year;
                // Default: newest first
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [initialVehicles, selectedCategory, searchTerm, sortBy]);

    // Format phone for WhatsApp link (e.g. 0771234567 -> 94771234567)
    const getWhatsAppUrl = (phone: string, refId: string, vehicleTitle: string) => {
        let clean = phone.replace(/[^0-9]/g, "");
        if (clean.startsWith("0")) {
            clean = "94" + clean.substring(1);
        } else if (!clean.startsWith("94")) {
            clean = "94" + clean;
        }
        const text = encodeURIComponent(
            `Hello, I am inquiring about your advertisement on LUMI: ${vehicleTitle} (Ref: ${refId}). Is it still available?`
        );
        return `https://wa.me/${clean}?text=${text}`;
    };

    return (
        <div>
            {/* Search & Category Filter Section */}
            <div className="bg-[#12151b] text-white p-6 sm:p-8 rounded-none border border-neutral-800 shadow-xl mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search make, model, city, district..."
                            className="w-full bg-[#1c212a] border border-neutral-700 px-4 py-3 pl-11 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[#0F52BA] transition-colors"
                        />
                        <svg
                            className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#1c212a] border border-neutral-700 text-xs font-semibold px-3 py-2.5 text-white focus:outline-none focus:border-[#0F52BA] cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="year-desc">Year: Newest First</option>
                        </select>
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat
                                ? "bg-[#0F52BA] text-white shadow-md"
                                : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-neutral-700/60"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Counter Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
                <span className="text-xs sm:text-sm font-bold text-neutral-600 uppercase tracking-wider">
                    Showing <strong className="text-neutral-900 font-extrabold">{filteredVehicles.length}</strong> of{" "}
                    {initialVehicles.length} Advertisements
                </span>

                {(selectedCategory !== "All Vehicles" || searchTerm) && (
                    <button
                        onClick={() => {
                            setSelectedCategory("All Vehicles");
                            setSearchTerm("");
                        }}
                        className="text-xs font-bold text-[#0F52BA] hover:underline cursor-pointer"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Empty State */}
            {filteredVehicles.length === 0 ? (
                <div className="bg-white border border-neutral-200/90 p-12 sm:p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900">No Vehicles Found</h3>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md mx-auto">
                        No advertisements matched your search or category filter. Try changing your search keywords or resetting filters.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                        <button
                            onClick={() => {
                                setSelectedCategory("All Vehicles");
                                setSearchTerm("");
                            }}
                            className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                        <Link
                            href="/post_advertisement"
                            className="px-6 py-2.5 bg-[#0F52BA] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0c4399] transition-all cursor-pointer"
                        >
                            Post an Ad
                        </Link>
                    </div>
                </div>
            ) : (
                /* Vehicles Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {filteredVehicles.map((vehicle) => {
                        const coverImage =
                            vehicle.images && vehicle.images.length > 0
                                ? vehicle.images[0]
                                : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80";

                        return (
                            <div
                                key={vehicle._id}
                                className="group bg-white border border-neutral-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                            >
                                <div>
                                    {/* Image Container with Badges */}
                                    <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-neutral-100">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108"
                                            style={{ backgroundImage: `url('${coverImage}')` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                        {/* Condition Badge */}
                                        <span className="absolute top-3 left-3 bg-[#0F52BA] text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider shadow-sm">
                                            {vehicle.condition.includes("Brand New")
                                                ? "Brand New"
                                                : vehicle.condition.includes("Reconditioned")
                                                    ? "Reconditioned"
                                                    : "Registered"}
                                        </span>

                                        {/* Year Badge */}
                                        <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1">
                                            {vehicle.year}
                                        </span>

                                        {/* Category Tag on bottom left */}
                                        <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-0.5 uppercase tracking-wider">
                                            {vehicle.category}
                                        </span>

                                        {/* Photo Count Tag on bottom right */}
                                        {vehicle.images && vehicle.images.length > 1 && (
                                            <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                                {vehicle.images.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <h3 className="text-base font-black text-neutral-900 group-hover:text-[#0F52BA] transition-colors leading-snug">
                                            {vehicle.brand} {vehicle.model}
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                                            {vehicle.district}, {vehicle.city} • {vehicle.mileage}km
                                        </p>

                                        {/* Price Box */}
                                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-baseline justify-between">
                                            <div>
                                                <span className="text-lg font-black text-[#0F52BA]">
                                                    LKR {vehicle.priceLKR.toLocaleString()}
                                                </span>
                                            </div>
                                            {vehicle.isNegotiable && (
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                                    Negotiable
                                                </span>
                                            )}
                                        </div>

                                        {/* Key Specs Grid */}
                                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-neutral-600 bg-neutral-50 p-3 border border-neutral-100">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="truncate">{vehicle.mileage}km</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                                </svg>
                                                <span className="truncate">{vehicle.engineCapacity || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                                </svg>
                                                <span className="truncate">{vehicle.transmission}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <svg className="w-3.5 h-3.5 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                                </svg>
                                                <span className="truncate">{vehicle.fuelType}</span>
                                            </div>
                                        </div>

                                        {/* Seller & Ref Tag */}
                                        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                                            <span className="text-neutral-500 font-medium truncate">
                                                Seller: <strong className="text-neutral-800">{vehicle.sellerName}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
                                    <a
                                        href={`tel:${vehicle.sellerPhone}`}
                                        className="py-2.5 px-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider text-center transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        Call
                                    </a>

                                    {vehicle.hasWhatsApp ? (
                                        <a
                                            href={getWhatsAppUrl(
                                                vehicle.sellerPhone,
                                                vehicle.refId,
                                                `${vehicle.brand} ${vehicle.model}`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            WhatsApp
                                        </a>
                                    ) : (
                                        <Link
                                            href={`/contact_us?inquire=${vehicle.refId}`}
                                            className="py-2.5 px-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider text-center transition-all shadow-sm active:scale-95 cursor-pointer"
                                        >
                                            Inquire
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
