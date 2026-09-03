"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
        }
    };

    return (
        <footer className="w-full bg-[#0a0a0a] text-neutral-300 border-t border-neutral-800">
            {/* Top Newsletter CTA Banner - Hidden on mobile to save screen space */}
            <div className="hidden md:block border-b border-neutral-800/80 bg-neutral-900/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left max-w-xl">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8102E] block mb-1">
                                Exclusive Updates & Offers
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                                Stay Updated with Exclusive Vehicle Arrivals
                            </h3>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-1.5">
                                Subscribe to receive curated luxury vehicle drops and special leasing offers.
                            </p>
                        </div>

                        {/* Newsletter Input Box */}
                        {subscribed ? (
                            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-6 py-3 text-sm font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span>Thank you! You have successfully subscribed to updates.</span>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubscribe}
                                className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full max-w-md"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm text-white placeholder-neutral-500 rounded-none focus:outline-none focus:border-[#0F52BA] transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer whitespace-nowrap"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Brand & About Column (4 cols on desktop, compact on mobile) */}
                    <div className="lg:col-span-4 flex flex-col justify-between">
                        <div>
                            {/* Logo */}
                            <Link href="/" className="inline-block mb-3 md:mb-5">
                                <div className="flex items-center gap-2">

                                </div>
                            </Link>

                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-4 md:mb-6">
                                Sri Lanka&apos;s premier destination for certified luxury vehicles, high-performance sports cars, and bespoke automotive concierge services.
                            </p>

                            {/* Contact Details (Full on desktop, concise on mobile) */}
                            <div className="space-y-2 text-xs text-neutral-400">
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    <span>Colombo 07, Sri Lanka</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0F52BA] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    <span>+94 11 234 5678</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-neutral-800/80">
                            <a
                                href="#facebook"
                                aria-label="Facebook"
                                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#0F52BA] hover:bg-[#0F52BA] transition-all"
                            >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="#instagram"
                                aria-label="Instagram"
                                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-pink-600 hover:bg-pink-600 transition-all"
                            >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="#whatsapp"
                                aria-label="WhatsApp"
                                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-emerald-600 hover:bg-emerald-600 transition-all"
                            >
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.79 14.07c-.24.68-1.21 1.25-1.68 1.33-.45.08-1.04.11-3.05-.72-2.57-1.07-4.22-3.7-4.35-3.87-.13-.17-1.04-1.38-1.04-2.64 0-1.25.66-1.87.89-2.12.24-.26.52-.32.7-.32.17 0 .35.01.5.01.16.01.38-.06.59.45.22.52.74 1.8.81 1.93.07.13.11.28.02.45-.09.18-.14.28-.27.44-.13.16-.28.35-.4.47-.13.13-.27.27-.12.53.16.26.69 1.14 1.48 1.85 1.02.91 1.88 1.19 2.15 1.32.27.13.43.11.59-.07.16-.18.69-.8 87-1.08.18-.27.37-.23.62-.13.25.09 1.6.75 1.87.89.28.13.46.2.53.31.07.11.07.65-.17 1.33z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column (Visible across all devices) */}
                    <div className="lg:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3 md:mb-4">
                            Quick Links
                        </h4>
                        <ul className="grid grid-cols-2 md:grid-cols-1 gap-2 md:space-y-2.5 text-xs sm:text-sm">
                            <li>
                                <Link href="/" className="hover:text-[#0F52BA] transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/vehicles" className="hover:text-[#0F52BA] transition-colors">
                                    Vehicles
                                </Link>
                            </li>
                            <li>
                                <Link href="/offers" className="hover:text-[#0F52BA] transition-colors">
                                    Offers & Deals
                                </Link>
                            </li>
                            <li>
                                <Link href="/about_us" className="hover:text-[#0F52BA] transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact_us" className="hover:text-[#0F52BA] transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Vehicle Categories Column (Hidden on mobile to keep footer compact) */}
                    <div className="hidden md:block lg:col-span-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                            Vehicle Categories
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm">
                            <li>
                                <Link href="/vehicles?category=luxury" className="hover:text-[#0F52BA] transition-colors">
                                    Luxury Executive Sedans
                                </Link>
                            </li>
                            <li>
                                <Link href="/vehicles?category=sports" className="hover:text-[#0F52BA] transition-colors">
                                    Sports & Performance Coupes
                                </Link>
                            </li>
                            <li>
                                <Link href="/vehicles?category=suv" className="hover:text-[#0F52BA] transition-colors">
                                    Premium SUVs & Crossovers
                                </Link>
                            </li>
                            <li>
                                <Link href="/vehicles?category=electric" className="hover:text-[#0F52BA] transition-colors">
                                    Electric & Hybrid Vehicles
                                </Link>
                            </li>
                            <li>
                                <Link href="/vehicles?category=certified" className="hover:text-[#0F52BA] transition-colors">
                                    Certified Pre-Owned Inventory
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services & Support Column (Hidden on mobile to keep footer compact) */}
                    <div className="hidden md:block lg:col-span-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                            Services & Support
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm">
                            <li>
                                <Link href="/offers" className="hover:text-[#0F52BA] transition-colors">
                                    Car Financing & Leasing
                                </Link>
                            </li>
                            <li>
                                <Link href="/about_us" className="hover:text-[#0F52BA] transition-colors">
                                    Vehicle Inspection & Testing
                                </Link>
                            </li>
                            <li>
                                <Link href="/offers" className="hover:text-[#0F52BA] transition-colors">
                                    Warranty & Maintenance Packages
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact_us" className="hover:text-[#0F52BA] transition-colors">
                                    Vehicle Trade-in & Valuation
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact_us" className="hover:text-[#0F52BA] transition-colors">
                                    Customer Care & Concierge
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-neutral-850 bg-[#050505] py-4 md:py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
                    <p>© {new Date().getFullYear()} AURRA Automotive. All rights reserved.</p>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-neutral-300 transition-colors">
                            Terms
                        </Link>
                        <Link href="/sitemap" className="hover:text-neutral-300 transition-colors">
                            Sitemap
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}