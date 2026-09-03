"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface AdItem {
    id: number;
    badge: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    alt: string;
}

const advertisements: AdItem[] = [
    {
        id: 1,
        badge: "01.",
        title: "ණය සහ ලීසිං පහසුකම් (FINANCING PROGRAMS)",
        description:
            "අවම ලියකියවිලි සහ කඩිනම් අනුමැතිය සමඟින් ඔබේ සිහින වාහනය පහසු මාසික වාරික ක්‍රමයට ලබාගැනීමට අප සහාය වන්නෙමු. 100% ක් විශ්වාසනීය සේවාව.",
        buttonText: "වැඩි විස්තර (LEARN MORE)",
        buttonLink: "/offers",
        image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1000&q=80",
        alt: "Car financing and key delivery",
    },
    {
        id: 2,
        badge: "02.",
        title: "විශේෂ වට්ටම් සහ වගකීම් සහතිකය (WARRANTY & OFFERS)",
        description:
            "තෝරාගත් සියලුම සුඛෝපභෝගී වාහන සඳහා නොමිලේ පූර්ණ සේවා වාර 3ක් සහ වසර 2ක සම්පූර්ණ එන්ජින් සහ ගියර්බොක්ස් වගකීමක් හිමිවේ.",
        buttonText: "දීමනාව ලබාගන්න (CLAIM OFFER)",
        buttonLink: "/offers",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
        alt: "Luxury vehicle showroom offer",
    },
];

export default function HomeAdSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        console.log("Navigating to next slide");
        setCurrentSlide((prev) => (prev + 1) % advertisements.length);
    };

    const prevSlide = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        console.log("Navigating to previous slide");
        setCurrentSlide((prev) => (prev - 1 + advertisements.length) % advertisements.length);
    };

    // Auto-advance slide every 7 seconds when not hovered
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % advertisements.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [isHovered]);

    const activeAd = advertisements[currentSlide];

    return (
        <section className="w-full bg-white py-12 md:py-16 overflow-hidden select-none">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Slider Wrapper with Left & Right Arrow Controls */}
                <div
                    className="relative flex items-center justify-center"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Left Navigation Arrow */}
                    <button
                        type="button"
                        onClick={prevSlide}
                        className="absolute -left-3 sm:-left-6 md:-left-7 z-30 w-11 h-11 md:w-12 md:h-12 bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer rounded-xs"
                        aria-label="Previous advertisement"
                    >
                        <svg
                            className="w-6 h-6 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    {/* Advertisement Card */}
                    <div
                        key={`slide-${activeAd.id}`}
                        className="w-full bg-white shadow-xl border border-neutral-200/80 rounded-none overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[360px] md:min-h-[380px] animate-in fade-in duration-300"
                    >
                        {/* Left Side: Image */}
                        <div className="md:col-span-6 relative h-64 md:h-full min-h-[260px] bg-neutral-100 overflow-hidden">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform hover:scale-105"
                                style={{ backgroundImage: `url('${activeAd.image}')` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent" />
                            </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="md:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative bg-white">
                            {/* Red Number Badge in Corner */}
                            <div className="absolute top-0 right-0 md:left-0 md:right-auto">
                                <span className="inline-block bg-[#C8102E] text-white text-xs md:text-sm font-extrabold px-4 py-1.5 tracking-wider">
                                    {activeAd.badge}
                                </span>
                            </div>

                            {/* Text Content */}
                            <div className="mt-4 md:mt-6">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-neutral-900 tracking-wide uppercase mb-3 sm:mb-4">
                                    {activeAd.title}
                                </h3>
                                <p className="text-neutral-600 text-xs sm:text-sm md:text-[15px] leading-relaxed">
                                    {activeAd.description}
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <Link
                                    href={activeAd.buttonLink}
                                    className="px-6 py-2.5 bg-[#1e1e1e] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                                >
                                    <span>{activeAd.buttonText}</span>
                                    <svg className="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>

                                {/* Slide Counter */}
                                <span className="text-xs font-mono text-neutral-400 font-semibold">
                                    0{currentSlide + 1} / 0{advertisements.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Navigation Arrow */}
                    <button
                        type="button"
                        onClick={nextSlide}
                        className="absolute -right-3 sm:-right-6 md:-right-7 z-30 w-11 h-11 md:w-12 md:h-12 bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer rounded-xs"
                        aria-label="Next advertisement"
                    >
                        <svg
                            className="w-6 h-6 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* Pagination Dots Indicator */}
                <div className="flex justify-center items-center gap-2.5 mt-6">
                    {advertisements.map((ad, index) => (
                        <button
                            key={ad.id}
                            type="button"
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${currentSlide === index
                                ? "w-8 bg-[#C8102E]"
                                : "w-2.5 bg-neutral-300 hover:bg-neutral-400"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}