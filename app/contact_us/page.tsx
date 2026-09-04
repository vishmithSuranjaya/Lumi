"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        inquiryType: "Vehicle Purchase & Inspection",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#fbfbfb] text-neutral-900">
            {/* Navigation Bar */}
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full min-h-[440px] sm:min-h-[500px] bg-[#0c0e12] overflow-hidden flex items-center justify-center">
                    {/* Background Visual */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
                        style={{
                            backgroundImage: `url('https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=2000&q=85')`,
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/70 to-[#0c0e12]/90" />
                    </div>

                    {/* Atmospheric Lights */}
                    <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/4 w-96 h-96 bg-[#C8102E]/15 rounded-full blur-3xl" />

                    {/* Hero Content */}
                    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                        {/* Breadcrumbs */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">Contact Us</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                            Get In Touch With <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-white via-neutral-200 to-[#87CEEB] bg-clip-text text-transparent">
                                LUMI Automotive
                            </span>
                        </h1>

                        {/* Tagline */}
                        <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
                            Connect with Sri Lanka&apos;s luxury automotive experts for vehicle sourcing, direct imports, flexible leasing, and VIP concierge assistance.
                        </p>
                    </div>
                </section>

                {/* Main Content Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Left Column: Interactive Contact Form (7 cols) */}
                        <div className="lg:col-span-7">
                            <div className="bg-white border border-neutral-200/90 shadow-xl p-6 sm:p-8 md:p-10">
                                <div className="mb-8 border-b border-neutral-100 pb-5">
                                    <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#C8102E] block mb-1">
                                        Inquiries & Consultations
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-wide">
                                        Send Us a Message
                                    </h2>
                                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                                        Our dedicated automotive advisors will respond within 24 working hours.
                                    </p>
                                </div>

                                {isSubmitted ? (
                                    <div className="p-8 bg-emerald-50 border border-emerald-300 rounded-none text-center space-y-3">
                                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-emerald-900">
                                            Thank You, {formData.fullName || "Valued Client"}!
                                        </h3>
                                        <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                            Your inquiry regarding <strong>{formData.inquiryType}</strong> has been received. Our concierge team will contact you shortly.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsSubmitted(false)}
                                            className="mt-4 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Send Another Message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Full Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:border-[#0F52BA] focus:bg-white focus:outline-none transition-colors"
                                                    placeholder="e.g. Roshan Perera"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:border-[#0F52BA] focus:bg-white focus:outline-none transition-colors"
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Mobile */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                                    Mobile Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:border-[#0F52BA] focus:bg-white focus:outline-none transition-colors"
                                                    placeholder="+94 77 123 4567"
                                                />
                                            </div>

                                            {/* Inquiry Type */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                                    Inquiry Type
                                                </label>
                                                <select
                                                    value={formData.inquiryType}
                                                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:border-[#0F52BA] focus:bg-white focus:outline-none transition-colors"
                                                >
                                                    <option value="Vehicle Purchase & Inspection">Vehicle Purchase & Inspection</option>
                                                    <option value="Direct Vehicle Importation">Direct Vehicle Importation</option>
                                                    <option value="Leasing & Financing Solutions">Leasing & Financing Solutions</option>
                                                    <option value="Trade-In & Valuation">Trade-In & Valuation</option>
                                                    <option value="Commercial Fleets & Heavy Machinery">Commercial Fleets & Heavy Machinery</option>
                                                    <option value="General Inquiries">General Inquiries</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                                                Your Message *
                                            </label>
                                            <textarea
                                                rows={5}
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:border-[#0F52BA] focus:bg-white focus:outline-none transition-colors resize-none"
                                                placeholder="Please describe the vehicle model, specifications, or inquiry details..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-98 cursor-pointer"
                                        >
                                            Submit Inquiry
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Contact Details & Showroom (5 cols) */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Head Office Card */}
                            <div className="bg-white border border-neutral-200/90 shadow-md p-6 sm:p-8">
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F52BA] block mb-2">
                                    Flagship Showroom
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-neutral-900">
                                    LUMI Automotive Experience Center
                                </h3>

                                <div className="mt-6 space-y-4 text-xs sm:text-sm text-neutral-600">
                                    {/* Address */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0F52BA] flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong className="block text-neutral-900 font-bold">Address</strong>
                                            {/* <span>No. 120, Horton Place, Colombo 07, Sri Lanka</span> */}
                                        </div>
                                    </div>

                                    {/* Phone Numbers */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0F52BA] flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong className="block text-neutral-900 font-bold">Hotline & Inquiries</strong>
                                            {/* <span>+94 11 234 5678 / +94 77 123 4567</span> */}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0F52BA] flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong className="block text-neutral-900 font-bold">Email</strong>
                                            {/* <span>concierge@aurra-motors.lk</span> */}
                                        </div>
                                    </div>

                                    {/* Operating Hours */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0F52BA] flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong className="block text-neutral-900 font-bold">Showroom Hours</strong>
                                            <span>Monday - Saturday: 8:30 AM – 7:00 PM</span>
                                            <span className="block text-neutral-400 text-xs">Sunday & Poya: 9:00 AM – 3:00 PM</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Direct WhatsApp Consultation CTA */}
                                <div className="mt-8 pt-6 border-t border-neutral-100">
                                    <a
                                        href="https://wa.me/94771234567"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2.5 shadow-md active:scale-98"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.79 14.07c-.24.68-1.21 1.25-1.68 1.33-.45.08-1.04.11-3.05-.72-2.57-1.07-4.22-3.7-4.35-3.87-.13-.17-1.04-1.38-1.04-2.64 0-1.25.66-1.87.89-2.12.24-.26.52-.32.7-.32.17 0 .35.01.5.01.16.01.38-.06.59.45.22.52.74 1.8.81 1.93.07.13.11.28.02.45-.09.18-.14.28-.27.44-.13.16-.28.35-.4.47-.13.13-.27.27-.12.53.16.26.69 1.14 1.48 1.85 1.02.91 1.88 1.19 2.15 1.32.27.13.43.11.59-.07.16-.18.69-.8 87-1.08.18-.27.37-.23.62-.13.25.09 1.6.75 1.87.89.28.13.46.2.53.31.07.11.07.65-.17 1.33z" />
                                        </svg>
                                        <span>Chat with Concierge on WhatsApp</span>
                                    </a>
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