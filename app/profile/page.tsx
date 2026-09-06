"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

interface UserAd {
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
    priceLKR: number;
    district: string;
    city: string;
    images: string[];
    status: "pending" | "approved" | "active" | "rejected";
    rejectionReason?: string | null;
    views: number;
    createdAt: string;
}

interface UserStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalViews: number;
}

function ProfilePageContent() {
    const { user, loading: authLoading, logout, refreshUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<"overview" | "ads" | "security">("overview");

    // Profile Edit State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Avatar Upload State
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // User Advertisements State
    const [ads, setAds] = useState<UserAd[]>([]);
    const [adsLoading, setAdsLoading] = useState(true);
    const [stats, setStats] = useState<UserStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalViews: 0,
    });
    const [adToDelete, setAdToDelete] = useState<UserAd | null>(null);
    const [isDeletingAd, setIsDeletingAd] = useState(false);
    const [adFeedback, setAdFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Sync active tab with URL query parameter if present
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "ads" || tab === "security" || tab === "overview") {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const [isSigningOut, setIsSigningOut] = useState(false);

    // Client-side authentication guard
    useEffect(() => {
        if (!authLoading && !user && !isSigningOut) {
            router.push("/signin?redirect=/profile&error=auth_required");
        }
    }, [user, authLoading, router, isSigningOut]);

    // Populate initial profile fields from auth context
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            setAvatar(user.avatar || "");
        }
    }, [user]);

    // Fetch user profile stats and advertisements
    const fetchUserData = async () => {
        if (!user) return;

        try {
            // Fetch stats and latest profile details
            const profileRes = await fetch("/api/user/profile", { cache: "no-store" });
            if (profileRes.ok) {
                const profileJson = await profileRes.json();
                if (profileJson.stats) {
                    setStats(profileJson.stats);
                }
                if (profileJson.user) {
                    setName(profileJson.user.name || "");
                    setPhone(profileJson.user.phone || "");
                    setAvatar(profileJson.user.avatar || "");
                }
            }

            // Fetch user's vehicle advertisements
            setAdsLoading(true);
            const adsRes = await fetch("/api/user/advertisements", { cache: "no-store" });
            if (adsRes.ok) {
                const adsJson = await adsRes.json();
                setAds(adsJson.advertisements || []);
            }
        } catch (error) {
            console.error("Error fetching user profile data:", error);
        } finally {
            setAdsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    // Handle Profile Update
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileFeedback(null);

        if (!name.trim() || name.trim().length < 2) {
            setProfileFeedback({ type: "error", message: "Full Name must be at least 2 characters." });
            return;
        }

        setIsSavingProfile(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim() || null,
                    avatar: avatar.trim() || null,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setProfileFeedback({ type: "success", message: "Profile details updated successfully." });
                await refreshUser();
            } else {
                setProfileFeedback({
                    type: "error",
                    message: data.message || "Failed to update profile. Please try again.",
                });
            }
        } catch (err: any) {
            setProfileFeedback({
                type: "error",
                message: err?.message || "An unexpected error occurred while updating profile.",
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Handle Avatar File Upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Max 5MB, format check
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setProfileFeedback({
                type: "error",
                message: "Invalid image format. Only JPG, PNG, and WebP are allowed for avatars.",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setProfileFeedback({
                type: "error",
                message: "Avatar image cannot exceed 5MB in file size.",
            });
            return;
        }

        setIsUploadingAvatar(true);
        setProfileFeedback(null);

        try {
            const formData = new FormData();
            formData.append("images", file);
            formData.append("folder", "User-Images");

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (uploadRes.ok && uploadData.urls && uploadData.urls.length > 0) {
                const uploadedUrl = uploadData.urls[0];
                setAvatar(uploadedUrl);

                // Auto save the avatar URL to user profile
                const saveRes = await fetch("/api/user/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim() || user?.name,
                        phone: phone.trim() || user?.phone,
                        avatar: uploadedUrl,
                    }),
                });

                if (saveRes.ok) {
                    await refreshUser();
                    setProfileFeedback({
                        type: "success",
                        message: "Avatar uploaded and saved successfully!",
                    });
                }
            } else {
                setProfileFeedback({
                    type: "error",
                    message: uploadData.message || "Failed to upload image. Please try again.",
                });
            }
        } catch (error: any) {
            setProfileFeedback({
                type: "error",
                message: error?.message || "Failed to upload avatar.",
            });
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Handle Password Change
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordFeedback(null);

        if (!currentPassword) {
            setPasswordFeedback({ type: "error", message: "Current password is required." });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordFeedback({ type: "error", message: "New password must be at least 6 characters." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordFeedback({ type: "error", message: "New passwords do not match." });
            return;
        }

        setIsSavingPassword(true);
        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setPasswordFeedback({
                    type: "success",
                    message: "Password changed successfully! You can use your new password next time you sign in.",
                });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordFeedback({
                    type: "error",
                    message: data.message || "Failed to change password. Please verify current password.",
                });
            }
        } catch (err: any) {
            setPasswordFeedback({
                type: "error",
                message: err?.message || "An unexpected error occurred while updating password.",
            });
        } finally {
            setIsSavingPassword(false);
        }
    };

    // Handle Ad Deletion
    const confirmDeleteAd = async () => {
        if (!adToDelete) return;

        setIsDeletingAd(true);
        setAdFeedback(null);

        try {
            const res = await fetch(`/api/user/advertisements?id=${adToDelete._id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setAdFeedback({
                    type: "success",
                    message: `Listing "${adToDelete.brand} ${adToDelete.model}" was successfully removed.`,
                });
                setAds((prev) => prev.filter((ad) => ad._id !== adToDelete._id));
                setStats((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                    pending: adToDelete.status === "pending" ? Math.max(0, prev.pending - 1) : prev.pending,
                    approved: adToDelete.status === "approved" || adToDelete.status === "active" ? Math.max(0, prev.approved - 1) : prev.approved,
                    rejected: adToDelete.status === "rejected" ? Math.max(0, prev.rejected - 1) : prev.rejected,
                }));
                setAdToDelete(null);
            } else {
                setAdFeedback({
                    type: "error",
                    message: data.message || "Failed to remove advertisement.",
                });
            }
        } catch (err: any) {
            setAdFeedback({
                type: "error",
                message: err?.message || "Error deleting advertisement.",
            });
        } finally {
            setIsDeletingAd(false);
        }
    };

    const formatLKR = (amount: number) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString?: string | Date | null) => {
        if (!dateString) return "Recently";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "Recently";
        }
    };

    // If waiting for auth state or redirecting
    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex flex-col justify-between text-white">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-16 h-16 border-4 border-[#0F52BA]/20 border-t-[#0F52BA] rounded-full animate-spin mb-4" />
                    <p className="text-sm font-semibold tracking-widest uppercase text-neutral-400">
                        Verifying LUMI Credentials...
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-between">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Top Luxury Banner / Profile Header */}
                <div className="relative bg-[#0c0e14] text-white border-b border-neutral-800 pt-8 sm:pt-10 pb-8 sm:pb-10 overflow-hidden">
                    {/* Background Glow Accents */}
                    <div className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 bg-[#0F52BA]/20 rounded-full blur-3xl" />
                    <div className="pointer-events-none absolute top-10 right-10 w-80 h-80 bg-[#C8102E]/15 rounded-full blur-3xl" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Breadcrumbs & User Tag */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <span>/</span>
                                <span className="text-[#87CEEB] font-semibold">User Profile</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase text-neutral-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Account Active
                                </span>
                                {user.role === "admin" && (
                                    <Link
                                        href="/admin"
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold tracking-wider uppercase transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Admin Dashboard
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Profile Info Row */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                {/* Avatar with Upload Button */}
                                <div className="relative group">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={user.name}
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-neutral-700 shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#0F52BA] to-[#082a61] text-white flex items-center justify-center font-black text-2xl sm:text-3xl uppercase border-2 border-neutral-700 shadow-xl">
                                            {user.name?.charAt(0) || "U"}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        aria-label="Upload profile photo"
                                        title="Change profile photo"
                                        className="absolute bottom-0 right-0 bg-[#0F52BA] hover:bg-[#0c4399] text-white p-2 rounded-full border border-white/20 shadow-md transition-all active:scale-95 cursor-pointer"
                                    >
                                        {isUploadingAvatar ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl sm:text-3xl font-black tracking-wide uppercase text-white">
                                            {user.name}
                                        </h1>
                                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-[#0F52BA] text-white">
                                            {user.role === "admin" ? "LUMI Admin" : "Verified Member"}
                                        </span>
                                    </div>
                                    <p className="text-neutral-400 text-sm mt-1">{user.email}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-2">
                                        <span>
                                            Joined {formatDate(user.createdAt)}
                                        </span>
                                        {phone && (
                                            <>
                                                <span>•</span>
                                                <span className="text-neutral-300 font-medium">{phone}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span className="capitalize">{user.authProvider || "credentials"} Auth</span>
                                    </div>
                                </div>
                            </div>

                            {/* Top Action Shortcut Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Link
                                    href="/post_advertisement"
                                    className="flex-1 md:flex-initial px-5 py-2.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-md active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Post Advertisement
                                </Link>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsSigningOut(true);
                                        await logout();
                                    }}
                                    className="px-4 py-2.5 bg-white/10 hover:bg-red-600/20 hover:text-red-300 border border-white/20 hover:border-red-500/30 text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats Grid (Personal User Metrics) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-neutral-800/80">
                            <button
                                type="button"
                                onClick={() => setActiveTab("ads")}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 sm:p-4 text-left transition-colors cursor-pointer group"
                            >
                                <p className="text-[11px] font-bold text-neutral-400 group-hover:text-white uppercase tracking-wider">My Total Listings</p>
                                <p className="text-xl sm:text-2xl font-black text-white mt-1">{stats.total}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("ads")}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 sm:p-4 text-left transition-colors cursor-pointer group"
                            >
                                <p className="text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wider">Approved & Live</p>
                                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{stats.approved}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("ads")}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 sm:p-4 text-left transition-colors cursor-pointer group"
                            >
                                <p className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300 uppercase tracking-wider">Under Review</p>
                                <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{stats.pending}</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("ads")}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 sm:p-4 text-left transition-colors cursor-pointer group"
                            >
                                <p className="text-[11px] font-bold text-rose-400 group-hover:text-rose-300 uppercase tracking-wider">Declined / Action</p>
                                <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1">{stats.rejected}</p>
                            </button>
                            <div className="bg-white/5 border border-white/10 p-3 sm:p-4">
                                <p className="text-[11px] font-bold text-[#87CEEB] uppercase tracking-wider">Showroom Views</p>
                                <p className="text-xl sm:text-2xl font-black text-[#87CEEB] mt-1">{stats.totalViews}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
                    {/* Navigation Tabs */}
                    <div className="bg-white border border-neutral-200 shadow-sm flex items-center justify-between overflow-x-auto">
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => setActiveTab("overview")}
                                className={`px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                                    activeTab === "overview"
                                        ? "border-[#0F52BA] text-[#0F52BA] bg-neutral-50/50"
                                        : "border-transparent text-neutral-600 hover:text-neutral-900"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("ads")}
                                className={`px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                                    activeTab === "ads"
                                        ? "border-[#0F52BA] text-[#0F52BA] bg-neutral-50/50"
                                        : "border-transparent text-neutral-600 hover:text-neutral-900"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                My Advertisements
                                <span className="ml-1.5 px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold rounded-full">
                                    {ads.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("security")}
                                className={`px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                                    activeTab === "security"
                                        ? "border-[#0F52BA] text-[#0F52BA] bg-neutral-50/50"
                                        : "border-transparent text-neutral-600 hover:text-neutral-900"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Security & Password
                            </button>
                        </div>
                    </div>

                    {/* Tab Panels */}
                    <div className="mt-8">
                        {/* TAB 1: OVERVIEW & EDIT PROFILE */}
                        {activeTab === "overview" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left 2 cols: Edit Form */}
                                <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
                                    <div className="border-b border-neutral-100 pb-4 mb-6">
                                        <h2 className="text-lg font-black tracking-wide uppercase text-neutral-900">
                                            Edit Profile Details
                                        </h2>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Keep your contact and identity information accurate so vehicle buyers can reach you.
                                        </p>
                                    </div>

                                    {profileFeedback && (
                                        <div
                                            className={`p-4 mb-6 text-xs font-semibold flex items-center gap-2 ${
                                                profileFeedback.type === "success"
                                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                    : "bg-red-50 text-red-800 border border-red-200"
                                            }`}
                                        >
                                            {profileFeedback.type === "success" ? (
                                                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            <span>{profileFeedback.message}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] focus:bg-white transition-colors"
                                                placeholder="e.g. Kasun Perera"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 text-sm text-neutral-500 cursor-not-allowed select-none"
                                                    title="Email address cannot be changed directly."
                                                />
                                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                                    Email is linked to your account credentials.
                                                </span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                                    Contact Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] focus:bg-white transition-colors"
                                                    placeholder="e.g. 077 123 4567"
                                                />
                                                <span className="text-[11px] text-neutral-400 mt-1 block">
                                                    Used to prefill contact details when posting ads.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSavingProfile}
                                                className="px-6 py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                                            >
                                                {isSavingProfile ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Saving Changes...</span>
                                                    </>
                                                ) : (
                                                    <span>Save Profile Changes</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Right 1 col: Account Details & Shortcuts */}
                                <div className="space-y-6">
                                    <div className="bg-white border border-neutral-200 p-6 shadow-sm">
                                        <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 pb-3 border-b border-neutral-100 mb-4">
                                            Account Status
                                        </h3>
                                        <dl className="space-y-3 text-xs">
                                            <div className="flex items-center justify-between">
                                                <dt className="text-neutral-500 font-medium">Account Tier:</dt>
                                                <dd className="font-bold text-neutral-900 capitalize">{user.role}</dd>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <dt className="text-neutral-500 font-medium">Auth Provider:</dt>
                                                <dd className="font-bold text-neutral-900 capitalize">{user.authProvider || "credentials"}</dd>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <dt className="text-neutral-500 font-medium">Member Since:</dt>
                                                <dd className="font-semibold text-neutral-700">{formatDate(user.createdAt)}</dd>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <dt className="text-neutral-500 font-medium">Security Status:</dt>
                                                <dd className="text-emerald-600 font-bold flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Verified
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-gradient-to-br from-neutral-900 to-[#0c0e14] text-white p-6 border border-neutral-800 shadow-sm">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#87CEEB] block mb-1">
                                            LUMI Certified Network
                                        </span>
                                        <h3 className="text-base font-black tracking-wide uppercase">
                                            Sell Your Luxury Vehicle
                                        </h3>
                                        <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                                            Reach verified premium buyers across Sri Lanka. Listing verified vehicles takes less than 2 minutes.
                                        </p>
                                        <Link
                                            href="/post_advertisement"
                                            className="mt-4 w-full py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-center text-xs font-bold uppercase tracking-wider block transition-all shadow-md active:scale-95"
                                        >
                                            Create New Advertisement →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: MY ADVERTISEMENTS */}
                        {activeTab === "ads" && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-6 shadow-sm">
                                    <div>
                                        <h2 className="text-lg font-black tracking-wide uppercase text-neutral-900">
                                            My Vehicle Advertisements
                                        </h2>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Manage your vehicle listings, track view statistics, and monitor admin approval statuses.
                                        </p>
                                    </div>
                                    <Link
                                        href="/post_advertisement"
                                        className="px-5 py-2.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Post New Advertisement
                                    </Link>
                                </div>

                                {adFeedback && (
                                    <div
                                        className={`p-4 text-xs font-semibold flex items-center justify-between gap-2 ${
                                            adFeedback.type === "success"
                                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                : "bg-red-50 text-red-800 border border-red-200"
                                        }`}
                                    >
                                        <span>{adFeedback.message}</span>
                                        <button
                                            type="button"
                                            onClick={() => setAdFeedback(null)}
                                            className="text-neutral-500 hover:text-neutral-900 text-sm font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {adsLoading ? (
                                    <div className="bg-white border border-neutral-200 p-12 text-center">
                                        <div className="w-10 h-10 border-4 border-[#0F52BA]/20 border-t-[#0F52BA] rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                            Loading your listings...
                                        </p>
                                    </div>
                                ) : ads.length === 0 ? (
                                    <div className="bg-white border border-neutral-200 p-12 text-center">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <h3 className="text-base font-black text-neutral-900 uppercase">
                                            No Vehicle Advertisements Yet
                                        </h3>
                                        <p className="text-xs text-neutral-500 max-w-md mx-auto mt-2 mb-6 leading-relaxed">
                                            You haven&apos;t posted any vehicle advertisements under this account. Showcase your car to thousands of potential buyers across Sri Lanka.
                                        </p>
                                        <Link
                                            href="/post_advertisement"
                                            className="px-6 py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-extrabold uppercase tracking-widest transition-all inline-flex items-center gap-2 shadow-md active:scale-95"
                                        >
                                            Post Your First Advertisement
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {ads.map((ad) => {
                                            const isApproved = ad.status === "approved" || ad.status === "active";
                                            const isPending = ad.status === "pending";
                                            const isRejected = ad.status === "rejected";

                                            return (
                                                <div
                                                    key={ad._id}
                                                    className="bg-white border border-neutral-200 hover:border-neutral-300 shadow-sm flex flex-col justify-between transition-all group"
                                                >
                                                    {/* Card Header / Image */}
                                                    <div>
                                                        <div className="relative h-48 bg-neutral-900 overflow-hidden">
                                                            {ad.images && ad.images.length > 0 ? (
                                                                <img
                                                                    src={ad.images[0]}
                                                                    alt={`${ad.brand} ${ad.model}`}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs uppercase font-bold">
                                                                    No Image Available
                                                                </div>
                                                            )}

                                                            {/* Status Badge Overlay */}
                                                            <div className="absolute top-3 left-3">
                                                                {isApproved && (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                                        Live on Showroom
                                                                    </span>
                                                                )}
                                                                {isPending && (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Pending Approval
                                                                    </span>
                                                                )}
                                                                {isRejected && (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        Declined
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Ref ID & Photo Count */}
                                                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-neutral-950/70 backdrop-blur-xs px-2.5 py-1">
                                                                <span className="font-mono">{ad.refId}</span>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    {ad.images?.length || 0} Photos
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Details Content */}
                                                        <div className="p-5">
                                                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                                                {ad.category}
                                                            </div>
                                                            <h3 className="text-base font-black text-neutral-900 uppercase mt-0.5 group-hover:text-[#0F52BA] transition-colors line-clamp-1">
                                                                {ad.year} {ad.brand} {ad.model}
                                                            </h3>

                                                            <div className="text-lg font-black text-[#0F52BA] mt-2">
                                                                {formatLKR(ad.priceLKR)}
                                                            </div>

                                                            {/* Vehicle Specs Chips */}
                                                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
                                                                <div>
                                                                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Location</span>
                                                                    <span className="font-medium truncate block">{ad.city || ad.district}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Mileage</span>
                                                                    <span className="font-medium truncate block">{ad.mileage} km</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Fuel / Gear</span>
                                                                    <span className="font-medium truncate block">{ad.fuelType} • {ad.transmission}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">Showroom Views</span>
                                                                    <span className="font-medium truncate block">{ad.views} views</span>
                                                                </div>
                                                            </div>

                                                            {/* Rejection Reason Notice if rejected */}
                                                            {isRejected && ad.rejectionReason && (
                                                                <div className="mt-4 p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-700">
                                                                    <span className="font-bold block uppercase text-[10px] text-red-800 mb-0.5">Admin Review Feedback:</span>
                                                                    <p>{ad.rejectionReason}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Card Actions Footer */}
                                                    <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
                                                        {isApproved ? (
                                                            <Link
                                                                href="/vehicles"
                                                                className="text-xs font-bold text-[#0F52BA] hover:underline uppercase tracking-wider flex items-center gap-1"
                                                            >
                                                                <span>View In Catalog</span>
                                                                <span>→</span>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-neutral-400 font-medium">
                                                                Posted {formatDate(ad.createdAt)}
                                                            </span>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => setAdToDelete(ad)}
                                                            className="text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: SECURITY & PASSWORD */}
                        {activeTab === "security" && (
                            <div className="max-w-2xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm">
                                <div className="border-b border-neutral-100 pb-4 mb-6">
                                    <h2 className="text-lg font-black tracking-wide uppercase text-neutral-900">
                                        Account Security & Password
                                    </h2>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Update your account credentials to keep your profile and advertisements secure.
                                    </p>
                                </div>

                                {passwordFeedback && (
                                    <div
                                        className={`p-4 mb-6 text-xs font-semibold flex items-center gap-2 ${
                                            passwordFeedback.type === "success"
                                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                : "bg-red-50 text-red-800 border border-red-200"
                                        }`}
                                    >
                                        {passwordFeedback.type === "success" ? (
                                            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        <span>{passwordFeedback.message}</span>
                                    </div>
                                )}

                                {user.authProvider === "google" ? (
                                    <div className="p-6 bg-neutral-50 border border-neutral-200 text-center">
                                        <div className="w-12 h-12 bg-white rounded-full border border-neutral-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                                            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                                        </div>
                                        <h3 className="text-sm font-bold text-neutral-900 uppercase">
                                            Google Account Connected
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto leading-relaxed">
                                            Your account is authenticated via Google OAuth. You don&apos;t need a password for LUMI. You can manage your security settings via your Google Account.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                                Current Password *
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] focus:bg-white transition-colors"
                                                placeholder="Enter your current password"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                                    New Password *
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] focus:bg-white transition-colors"
                                                    placeholder="Minimum 6 characters"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                                    Confirm New Password *
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-[#0F52BA] focus:bg-white transition-colors"
                                                    placeholder="Re-enter new password"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1">
                                            <p className="font-bold text-neutral-800 uppercase tracking-wider text-[10px]">
                                                Password Requirements:
                                            </p>
                                            <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                                                <li>Minimum 6 characters long</li>
                                                <li>Include a combination of letters and numbers for higher strength</li>
                                            </ul>
                                        </div>

                                        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
                                            <button
                                                type="submit"
                                                disabled={isSavingPassword}
                                                className="px-6 py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
                                            >
                                                {isSavingPassword ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Updating Password...</span>
                                                    </>
                                                ) : (
                                                    <span>Change Password</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal: Confirm Advertisement Deletion */}
            {adToDelete && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-neutral-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-neutral-900 uppercase">
                                    Remove Advertisement?
                                </h3>
                                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                                    Are you sure you want to remove your listing for{" "}
                                    <span className="font-bold text-neutral-900">
                                        {adToDelete.year} {adToDelete.brand} {adToDelete.model}
                                    </span>{" "}
                                    ({adToDelete.refId})? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => setAdToDelete(null)}
                                disabled={isDeletingAd}
                                className="px-4 py-2 border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteAd}
                                disabled={isDeletingAd}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                            >
                                {isDeletingAd ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Delete Listing</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#0F52BA]/20 border-t-[#0F52BA] rounded-full animate-spin" />
                </div>
            }
        >
            <ProfilePageContent />
        </Suspense>
    );
}
