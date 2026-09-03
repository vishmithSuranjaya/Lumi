"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OffersPage() {
    const [email, setEmail] = useState("");
    const [notified, setNotified] = useState(false);

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setNotified(true);
            setEmail("");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-neutral-900">
            {/* Navigation Bar */}
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full min-h-[420px] sm:min-h-[480px] bg-[#0c0e12] overflow-hidden flex items-center justify-center">
                    {/* Background Visual with Dramatic Dark Gradient */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85')`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/70 to-[#0c0e12]/90" />
                    </div>

                    {/* Atmospheric Ambient Glows */}
                    <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 bg-[#C8102E]/20 rounded-full blur-3xl" />

                    {/* Hero Content */}
                    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        {/* Breadcrumbs */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">Special Offers</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                            Exclusive Deals & <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-white via-neutral-200 to-[#87CEEB] bg-clip-text text-transparent">
                                Seasonal Promotions
                            </span>
                        </h1>

                        {/* Tagline */}
                        <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
                            Discover limited-time financing rates, warranty upgrades, and special seasonal promotions on certified luxury vehicles.
                        </p>
                    </div>
                </section>

                {/* Under Construction Content Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="bg-white border border-neutral-200/90 shadow-xl p-8 sm:p-14 text-center relative overflow-hidden">
                        {/* Top Red Accent Strip */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F52BA] via-[#C8102E] to-[#0F52BA]" />

                        {/* Construction Animated Badge & Icon */}
                        <div className="w-20 h-20 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs">
                            <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5v1.409l4.28 4.28" />
                            </svg>
                        </div>

                        {/* Status Label */}
                        <span className="inline-block px-3.5 py-1 mb-3 text-xs font-black uppercase tracking-widest text-[#C8102E] bg-red-50 border border-red-200">
                            Page Under Construction
                        </span>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                            Exciting Offers Are Coming Soon
                        </h2>

                        <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
                            We are currently curating new exclusive seasonal offers, zero-downpayment leasing programs, and complimentary warranty packages. Please check back few days.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
