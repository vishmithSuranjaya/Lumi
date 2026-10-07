"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar: string | null;
  phone: string | null;
  authProvider: "credentials" | "google";
  createdAt: string;
  updatedAt: string | null;
  adsCount: number;
  activeAdsCount: number;
  isSeller: boolean;
}

interface UserDetailModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onRoleChange?: (id: string, newRole: "admin" | "user") => Promise<void> | void;
}

export default function UserDetailModal({
  isOpen,
  user,
  onClose,
  onRoleChange,
}: UserDetailModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Reset copy feedback
  useEffect(() => {
    setCopiedId(false);
    setCopiedEmail(false);
    setCopiedPhone(false);
    setUpdatingRole(false);
  }, [user?._id, isOpen]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleCopy = async (
    text: string,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleToggleRole = async () => {
    if (!onRoleChange) return;
    const nextRole = user.role === "admin" ? "user" : "admin";
    try {
      setUpdatingRole(true);
      await onRoleChange(user._id, nextRole);
    } finally {
      setUpdatingRole(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 lg:p-7 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl shadow-gray-900/20 overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
                User Profile & Activity
              </h2>
              <p className="text-xs text-gray-400">Account overview and seller status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar bg-white">
          {/* Main Profile Info Card */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-500/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {user.role === "admin" && (
                  <span
                    title="Administrator"
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                  >
                    ★
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                  {user.role === "admin" ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Administrator
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      Standard User
                    </span>
                  )}
                  {user.isSeller && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Vehicle Seller
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>ID:</span>
                  <span className="font-mono text-gray-700 font-medium">{user._id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(user._id, setCopiedId)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium underline cursor-pointer"
                  >
                    {copiedId ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick action to promote / demote */}
            {onRoleChange && (
              <button
                type="button"
                disabled={updatingRole}
                onClick={handleToggleRole}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 shadow-2xs ${
                  user.role === "admin"
                    ? "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                }`}
              >
                {updatingRole
                  ? "Updating..."
                  : user.role === "admin"
                  ? "Demote to User"
                  : "Promote to Admin"}
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Email Address</span>
              <div className="mt-1 flex items-center justify-between gap-2">
                <a
                  href={`mailto:${user.email}`}
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate underline underline-offset-2"
                >
                  {user.email}
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(user.email, setCopiedEmail)}
                  className="text-[11px] text-gray-600 hover:text-gray-900 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer"
                >
                  {copiedEmail ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Phone Number</span>
              <div className="mt-1 flex items-center justify-between gap-2">
                {user.phone ? (
                  <>
                    <a
                      href={`tel:${user.phone}`}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 font-mono"
                    >
                      {user.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(user.phone!, setCopiedPhone)}
                      className="text-[11px] text-gray-600 hover:text-gray-900 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer"
                    >
                      {copiedPhone ? "Copied" : "Copy"}
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not provided</span>
                )}
              </div>
            </div>

            {/* Authentication Method */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Authentication Provider</span>
              <div className="mt-1 flex items-center gap-2">
                {user.authProvider === "google" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                    Google OAuth
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Email & Password
                  </span>
                )}
              </div>
            </div>

            {/* Registration Date */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Member Since</span>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Marketplace Seller Activity */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Vehicle Listings Activity
              </h4>
              <span className="text-xs font-semibold text-gray-500">
                {user.adsCount} Total Ad{user.adsCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">
                  All Submitted Ads
                </span>
                <span className="text-xl font-extrabold text-blue-900 font-mono mt-0.5 block">
                  {user.adsCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                  Live in Catalog
                </span>
                <span className="text-xl font-extrabold text-emerald-900 font-mono mt-0.5 block">
                  {user.activeAdsCount}
                </span>
              </div>
            </div>

            {user.adsCount > 0 ? (
              <div className="pt-2">
                <Link
                  href={`/admin/vehicles?search=${encodeURIComponent(user.email)}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>Filter this seller's vehicles in fleet inventory →</span>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                This user has not submitted any vehicle advertisements yet.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/90 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
