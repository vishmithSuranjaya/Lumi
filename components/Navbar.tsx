"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
    { name: "Home", href: "/", subtitle: "Main Overview & Catalog" },
    { name: "Vehicles", href: "/vehicles", subtitle: "Certified Fleet Inventory" },
    { name: "Offers", href: "/offers", subtitle: "Seasonal Deals & Leasing" },
    { name: "About Us", href: "/about_us", subtitle: "Heritage & Philosophy" },
    { name: "Contact Us", href: "/contact_us", subtitle: "Showroom & Inquiries" },
];

export default function Navbar() {
    const { user, loading: authLoading, logout, openAuthModal } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close user dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
    }, [pathname]);


    // Trigger Left-to-Right loading bar animation on route change or initial render
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [pathname]);

    // Prevent body scroll when full-screen mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileMenuOpen]);

    return (
        <>
            {/* Top Loading Progress Beam (Loads Left to Right) */}
            {isLoading && (
                <div className="fixed top-0 left-0 right-0 z-50 h-1 pointer-events-none overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0F52BA] via-[#87CEEB] to-[#C8102E] animate-loading-bar shadow-[0_0_12px_rgba(15,82,186,0.8)]" />
                </div>
            )}

            {/* Main Full-Width Header */}
            <header className="w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 sticky top-0 z-40 shadow-xs transition-all">
                <div className="w-full px-4 sm:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo Section */}
                        <div className="flex-shrink-0">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2 group"
                            >
                                <span className="text-xl sm:text-2xl font-black tracking-widest text-neutral-900 uppercase">
                                    LUMI<span className="text-[#C8102E]">.</span>
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`text-[15px] font-semibold transition-all relative py-1 group ${
                                            isActive
                                                ? "text-[#0F52BA]"
                                                : "text-neutral-700 hover:text-[#0F52BA]"
                                        }`}
                                    >
                                        <span>{link.name}</span>
                                        {/* Underline Indicator */}
                                        <span
                                            className={`absolute bottom-0 left-0 h-0.5 bg-[#0F52BA] transition-all duration-300 ${
                                                isActive ? "w-full" : "w-0 group-hover:w-full"
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop Right Action Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {authLoading ? (
                                <div className="w-20 h-9 bg-neutral-100 animate-pulse"></div>
                            ) : user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="flex items-center gap-2.5 px-3 py-1.5 border border-neutral-200 hover:border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-7 h-7 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-[#0F52BA] text-white flex items-center justify-center font-bold text-xs uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="text-left flex flex-col">
                                            <span className="text-xs font-bold text-neutral-800 leading-tight max-w-[120px] truncate">
                                                {user.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                                                {user.role === "admin" ? (
                                                    <span className="text-purple-600 font-bold">Admin</span>
                                                ) : (
                                                    "Member"
                                                )}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Desktop User Dropdown */}
                                    {userDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-60 bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in">
                                            <div className="px-4 py-2 border-b border-neutral-100">
                                                <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                                                <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                                            </div>

                                            {user.role === "admin" && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}

                                            <Link
                                                href="/post_advertisement"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span>Post an Advertisement</span>
                                            </Link>

                                            <div className="border-t border-neutral-100 my-1"></div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUserDropdownOpen(false);
                                                    logout();
                                                }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openAuthModal("signin")}
                                    className="px-5 sm:px-6 py-2.5 text-sm font-semibold text-white bg-[#0F52BA] border border-[#0F52BA] rounded-none hover:bg-[#0c4399] hover:border-[#0c4399] transition-all inline-flex items-center justify-center shadow-xs whitespace-nowrap active:scale-95 cursor-pointer"
                                >
                                    Sign in
                                </button>
                            )}

                            <Link
                                href="/post_advertisement"
                                className="px-5 sm:px-6 py-2.5 text-sm font-semibold text-[#0F52BA] bg-white border border-[#0F52BA] rounded-none hover:bg-[#0F52BA] hover:text-white transition-all inline-flex items-center justify-center whitespace-nowrap active:scale-95 cursor-pointer"
                            >
                                Post an Advertisement
                            </Link>
                        </div>

                        {/* Mobile Hamburger & Quick Action */}
                        <div className="flex md:hidden items-center gap-2.5">
                            {authLoading ? null : user ? (
                                <Link
                                    href={user.role === "admin" ? "/admin" : "#"}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-[#0F52BA] text-white flex items-center justify-center text-[10px]">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="max-w-[70px] truncate">{user.name.split(" ")[0]}</span>
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openAuthModal("signin")}
                                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F52BA] hover:bg-[#0c4399] transition-colors cursor-pointer"
                                >
                                    Sign in
                                </button>
                            )}

                            {/* Hamburger Trigger Button */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="w-10 h-10 text-neutral-900 hover:text-[#0F52BA] border border-neutral-300 flex items-center justify-center transition-colors cursor-pointer bg-white"
                                aria-label="Open full screen navigation menu"
                            >
                                <svg className="w-6 h-6 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* FULL SCREEN Mobile Menu (Loads & Slides In from Left to Right) */}
            <div
                className={`fixed inset-0 z-50 bg-[#0c0e12] text-white flex flex-col justify-between transition-transform duration-500 ease-out transform md:hidden ${
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Background Glow Accents */}
                <div className="pointer-events-none absolute -top-32 left-0 w-80 h-80 bg-[#0F52BA]/25 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 right-0 w-80 h-80 bg-[#C8102E]/20 rounded-full blur-3xl" />

                {/* Top Header Row inside Fullscreen Menu */}
                <div className="relative z-10 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-neutral-800">
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2"
                    >
                        <span className="text-2xl font-black tracking-widest text-white uppercase">
                            LUMI<span className="text-[#C8102E]">.</span>
                        </span>
                    </Link>

                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-11 h-11 border border-neutral-700 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Close navigation menu"
                    >
                        <svg className="w-6 h-6 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Full Screen Menu Links */}
                <div className="relative z-10 px-6 sm:px-8 py-8 flex-1 overflow-y-auto flex flex-col justify-center space-y-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#87CEEB] block mb-2">
                        Navigation Menu
                    </span>

                    {navLinks.map((link, idx) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`group flex items-center justify-between py-3 border-b border-neutral-800/80 transition-all ${
                                    isActive ? "text-[#87CEEB]" : "text-neutral-200 hover:text-white"
                                }`}
                                style={{ transitionDelay: `${idx * 50}ms` }}
                            >
                                <div>
                                    <span className="text-2xl sm:text-3xl font-black tracking-wide block uppercase group-hover:translate-x-2 transition-transform">
                                        {link.name}
                                    </span>
                                    <span className="text-xs text-neutral-400 font-normal">
                                        {link.subtitle}
                                    </span>
                                </div>
                                <svg
                                    className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${
                                        isActive ? "text-[#87CEEB]" : "text-neutral-500"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2.2"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Full Screen Actions & Contact Bar */}
                <div className="relative z-10 px-6 sm:px-8 py-6 border-t border-neutral-800 bg-neutral-950/60 space-y-4">
                    {user ? (
                        <div className="p-3 bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-[#0F52BA] text-white flex items-center justify-center font-bold text-sm">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-bold text-white truncate max-w-[150px]">{user.name}</p>
                                    <p className="text-[10px] text-neutral-400 truncate max-w-[150px]">{user.email}</p>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-sm">
                                {user.role}
                            </span>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/post_advertisement"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-3.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-center text-xs font-bold uppercase tracking-wider transition-all block shadow-md"
                        >
                            Post an Advertisement
                        </Link>
                        {user ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    logout();
                                }}
                                className="w-full py-3.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-center text-xs font-bold uppercase tracking-wider transition-all block cursor-pointer"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    openAuthModal("signin");
                                }}
                                className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-center text-xs font-bold uppercase tracking-wider transition-all block cursor-pointer"
                            >
                                Sign in
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
                        <span>Showroom: Colombo 07, Sri Lanka</span>
                        <span>Hotline: +94 11 234 5678</span>
                    </div>
                </div>
            </div>
        </>
    );
}