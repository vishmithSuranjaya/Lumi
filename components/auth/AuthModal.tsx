"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthModal() {
    const { isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal, login, user } = useAuth();
    const router = useRouter();

    // Form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Reset fields when mode or open state changes
    useEffect(() => {
        setErrorMessage(null);
        setPassword("");
        setConfirmPassword("");
    }, [authModalMode, isAuthModalOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isAuthModalOpen) {
                closeAuthModal();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isAuthModalOpen, closeAuthModal]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isAuthModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isAuthModalOpen]);

    // Automatically close if user becomes authenticated
    useEffect(() => {
        if (user && isAuthModalOpen) {
            closeAuthModal();
        }
    }, [user, isAuthModalOpen, closeAuthModal]);

    if (!isAuthModalOpen) return null;

    const isSignIn = authModalMode === "signin";

    const handleGoogleSignIn = () => {
        const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
        window.location.href = `/api/auth/google?redirect=${encodeURIComponent(currentPath)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (isSignIn) {
            if (!email.trim() || !password) {
                setErrorMessage("Please enter both email and password.");
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim(), password }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setErrorMessage(data.error || "Failed to sign in. Please check your credentials.");
                    setIsLoading(false);
                    return;
                }

                login(data.user);
                closeAuthModal();
                router.refresh();
            } catch {
                setErrorMessage("Network error. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Sign Up Flow
            if (!name.trim()) {
                setErrorMessage("Please enter your full name.");
                return;
            }
            if (!email.trim()) {
                setErrorMessage("Please enter your email address.");
                return;
            }
            if (password.length < 6) {
                setErrorMessage("Password must be at least 6 characters.");
                return;
            }
            if (password !== confirmPassword) {
                setErrorMessage("Passwords do not match.");
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        phone: phone.trim() || undefined,
                        password,
                    }),
                });
                const data = await res.json();

                if (!res.ok) {
                    setErrorMessage(data.error || "Failed to create account.");
                    setIsLoading(false);
                    return;
                }

                login(data.user);
                closeAuthModal();
                router.refresh();
            } catch {
                setErrorMessage("Network error. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur Overlay */}
            <div
                className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={closeAuthModal}
            />

            {/* Modal Tile Card */}
            <div className="relative w-full max-w-md bg-white border border-neutral-200 shadow-2xl rounded-2xl overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200 my-auto">
                {/* Top Accent Strip */}
                <div className="h-1.5 bg-gradient-to-r from-[#0F52BA] via-sky-400 to-[#C8102E]" />

                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black tracking-widest text-neutral-900 uppercase">
                                LUMI<span className="text-[#C8102E]">.</span>
                            </span>
                        </div>

                        {/* Close (X) Button */}
                        <button
                            type="button"
                            onClick={closeAuthModal}
                            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Close modal"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div className="grid grid-cols-2 gap-1 p-1 mt-4 bg-neutral-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => openAuthModal("signin")}
                            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                isSignIn
                                    ? "bg-white text-neutral-900 shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => openAuthModal("signup")}
                            className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                !isSignIn
                                    ? "bg-white text-neutral-900 shadow-xs"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            Register
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 pb-6 pt-1 max-h-[75vh] overflow-y-auto">
                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                            <svg className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Google OAuth Quick Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover:border-neutral-400 active:scale-[0.99] cursor-pointer shadow-xs"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="relative my-4 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200"></div>
                        </div>
                        <span className="relative px-3 bg-white text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                            Or with email
                        </span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        {!isSignIn && (
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Kasun Perera"
                                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs sm:text-sm placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F52BA]/30 focus:border-[#0F52BA] transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs sm:text-sm placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F52BA]/30 focus:border-[#0F52BA] transition-all"
                            />
                        </div>

                        {!isSignIn && (
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+94 77 123 4567"
                                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs sm:text-sm placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F52BA]/30 focus:border-[#0F52BA] transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs sm:text-sm placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F52BA]/30 focus:border-[#0F52BA] transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 focus:outline-hidden cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {!isSignIn && (
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs sm:text-sm placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F52BA]/30 focus:border-[#0F52BA] transition-all"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{isSignIn ? "Signing in..." : "Creating Account..."}</span>
                                </>
                            ) : (
                                <span>{isSignIn ? "Sign In" : "Create Account"}</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
