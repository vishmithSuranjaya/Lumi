import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
    title: "About Us | AURRA Automotive Sri Lanka",
    description:
        "Learn about AURRA Automotive, Sri Lanka's premier destination for luxury vehicles, high-performance supercars, and bespoke automotive concierge services.",
};

export default function AboutUsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#fbfbfb] text-neutral-900">
            {/* Navigation Bar */}
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px] bg-[#0c0e12] overflow-hidden flex items-center justify-center">
                    {/* Background Visual with Dramatic Dark Gradient */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 opacity-40"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=85')`,
                        }}
                    >
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/60 to-[#0c0e12]/80" />
                        <div className="absolute inset-0 bg-radial from-transparent via-[#0c0e12]/40 to-[#0c0e12]" />
                    </div>

                    {/* Left & Right Decorative Atmospheric Lights */}
                    <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 bg-[#C8102E]/15 rounded-full blur-3xl" />

                    {/* Hero Content */}
                    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                        {/* Breadcrumbs */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">About Us</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                            Sri Lanka&apos;s Premier Destination <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-white via-neutral-200 to-[#87CEEB] bg-clip-text text-transparent">
                                For Automotive Luxury
                            </span>
                        </h1>

                        {/* Tagline */}
                        <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
                            Pioneering automotive excellence, certified pre-owned reliability, and tailored concierge solutions across Sri Lanka since 2010.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/vehicles"
                                className="px-7 py-3.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-900/30 active:scale-95 cursor-pointer"
                            >
                                Explore Our Fleet
                            </Link>
                            <Link
                                href="/contact_us"
                                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md text-xs sm:text-sm font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Key Statistics Ribbon */}
                <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                    <div className="bg-white border border-neutral-200/90 shadow-xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
                        <div className="p-6 sm:p-8 text-center">
                            <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-[#0F52BA]">
                                15+
                            </span>
                            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800 mt-1 block">
                                Years of Heritage
                            </span>
                            <span className="text-[11px] text-neutral-500 font-medium">Trusted Automotive Experience</span>
                        </div>
                        <div className="p-6 sm:p-8 text-center">
                            <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-[#C8102E]">
                                2,500+
                            </span>
                            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800 mt-1 block">
                                Verified Deliveries
                            </span>
                            <span className="text-[11px] text-neutral-500 font-medium">Nationwide Handover</span>
                        </div>
                        <div className="p-6 sm:p-8 text-center">
                            <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-[#0F52BA]">
                                50+
                            </span>
                            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800 mt-1 block">
                                Global Brands
                            </span>
                            <span className="text-[11px] text-neutral-500 font-medium">International Portfolio</span>
                        </div>
                        <div className="p-6 sm:p-8 text-center">
                            <span className="block text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900">
                                99.8%
                            </span>
                            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800 mt-1 block">
                                Client Satisfaction
                            </span>
                            <span className="text-[11px] text-neutral-500 font-medium">Verified Customer Ratings</span>
                        </div>
                    </div>
                </section>

                {/* Our Story & Values Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Story Text (7 cols) */}
                        <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-2.5 h-2.5 bg-[#C8102E]" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8102E]">
                                    Our Story & Philosophy
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                                Committed to Delivering Uncompromising Quality & Bespoke Automotive Care.
                            </h2>
                            <p className="mt-5 text-sm sm:text-base text-neutral-600 leading-relaxed">
                                At AURRA Automotive, we believe purchasing a vehicle is not merely a transaction—it is an investment in lifestyle, performance, and prestige. We curate only the highest-grade verified luxury sedans, sports supercars, rugged SUVs, commercial fleets, and heavy machinery for Sri Lankan motorists and enterprises.
                            </p>
                            <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
                                From transparent multi-point technical inspections to expedited leasing approval and bespoke after-sales warranties, our team provides an unmatched white-glove automotive experience.
                            </p>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-neutral-200/80 shadow-xs">
                                    <h3 className="font-bold text-sm text-neutral-900 mb-1 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F52BA]" />
                                        100% Certified Inspection
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Comprehensive multi-point mechanical, structural, and electronic diagnostic reports.
                                    </p>
                                </div>
                                <div className="p-4 bg-white border border-neutral-200/80 shadow-xs">
                                    <h3 className="font-bold text-sm text-neutral-900 mb-1 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F52BA]" />
                                        Instant Leasing Solutions
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Expedited financing and bespoke leasing packages with leading banking partners.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Showcase (5 cols) */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative h-[380px] sm:h-[440px] bg-neutral-900 overflow-hidden shadow-2xl border border-neutral-200">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80')`,
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#87CEEB] block">
                                        AURRA Showroom
                                    </span>
                                    <span className="text-lg font-black tracking-wide">
                                        Colombo 07, Sri Lanka
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}