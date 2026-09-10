"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface AdminAdvertisement {
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
  isNegotiable?: boolean;
  district: string;
  city: string;
  description?: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  hasWhatsApp?: boolean;
  images: string[];
  status: "pending" | "approved" | "rejected" | "active" | "sold" | "archived";
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  views?: number;
  userId?: string | null;
  userEmail?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

interface AdvertisementDetailModalProps {
  isOpen: boolean;
  ad: AdminAdvertisement | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string, reason?: string) => Promise<void> | void;
  onDelete?: (ad: AdminAdvertisement) => void;
}

export default function AdvertisementDetailModal({
  isOpen,
  ad,
  onClose,
  onStatusChange,
  onDelete,
}: AdvertisementDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    "Incomplete or inaccurate vehicle specifications"
  );
  const [customReason, setCustomReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Reset states whenever modal opens or active ad changes
  useEffect(() => {
    setActiveImageIndex(0);
    setCopiedRef(false);
    setCopiedPhone(false);
    setShowRejectForm(false);
    setRejectionReason("Incomplete or inaccurate vehicle specifications");
    setCustomReason("");
    setActionLoading(false);
  }, [ad?._id, isOpen]);

  // Keyboard shortcut listener: ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
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

  if (!isOpen || !ad) return null;

  const images = ad.images && ad.images.length > 0 ? ad.images : [];
  const currentImage = images[activeImageIndex] || null;

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(ad.refId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(ad.sellerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApprove = async () => {
    if (!onStatusChange) return;
    try {
      setActionLoading(true);
      await onStatusChange(ad._id, "approved");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!onStatusChange) return;
    const finalReason =
      rejectionReason === "Other" && customReason.trim()
        ? customReason.trim()
        : rejectionReason;

    try {
      setActionLoading(true);
      await onStatusChange(ad._id, "rejected", finalReason);
      setShowRejectForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatusSelect = async (newStatus: string) => {
    if (!onStatusChange) return;
    if (newStatus === "rejected") {
      setShowRejectForm(true);
      return;
    }
    try {
      setActionLoading(true);
      await onStatusChange(ad._id, newStatus);
    } finally {
      setActionLoading(false);
    }
  };

  // WhatsApp link generator
  const getWhatsAppUrl = () => {
    let clean = ad.sellerPhone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "94" + clean.substring(1);
    } else if (!clean.startsWith("94")) {
      clean = "94" + clean;
    }
    const text = encodeURIComponent(
      `Hello ${ad.sellerName}, this is Lumi Marketplace Administration regarding your listing ${ad.brand} ${ad.model} (${ad.refId}).`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-7 animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Sticky Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-white truncate">
                  {ad.brand} {ad.model} ({ad.year})
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                  {ad.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span className="font-mono text-neutral-300">{ad.refId}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer"
                  title="Copy Reference ID"
                >
                  {copiedRef ? "Copied!" : "Copy"}
                </button>
                <span>•</span>
                <span>Submitted {new Date(ad.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Pill */}
            {(ad.status === "approved" || ad.status === "active") && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Live in Catalog
              </span>
            )}
            {ad.status === "pending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Pending Review
              </span>
            )}
            {ad.status === "sold" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Sold
              </span>
            )}
            {ad.status === "archived" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-700/30 text-neutral-400 border border-neutral-700/50">
                Archived
              </span>
            )}
            {ad.status === "rejected" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Rejected
              </span>
            )}

            {/* Close modal X button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 space-y-6 custom-scrollbar">
          {/* 1. Photo Gallery Section */}
          <div className="space-y-3">
            {images.length > 0 && currentImage ? (
              <div className="space-y-3">
                {/* Main Large Photo Display */}
                <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center group">
                  <img
                    src={currentImage}
                    alt={`${ad.brand} ${ad.model}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Previous Photo Button */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
                      title="Previous Image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Next Photo Button */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-lg"
                      title="Next Image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Photo Counter Pill */}
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold px-3 py-1 rounded-full">
                    {activeImageIndex + 1} / {images.length}
                  </div>

                  {/* Open Fullscreen link */}
                  <a
                    href={currentImage}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white p-2 rounded-lg backdrop-blur-md border border-white/10 transition-colors text-xs flex items-center gap-1.5"
                    title="Open original high-res image"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>Full Size</span>
                  </a>
                </div>

                {/* Thumbnails Strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? "border-blue-500 scale-105 shadow-md shadow-blue-500/30"
                            : "border-neutral-800 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-neutral-950 border border-neutral-800/80 rounded-2xl flex flex-col items-center justify-center text-neutral-500 gap-2">
                <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs font-semibold">No vehicle photos provided by seller</span>
              </div>
            )}
          </div>

          {/* 2. Key Pricing & Core Specs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Box */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Listed Asking Price
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  LKR {ad.priceLKR?.toLocaleString() || "0"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      ad.isNegotiable
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-neutral-800 text-neutral-400 border border-neutral-700/50"
                    }`}
                  >
                    {ad.isNegotiable ? "Negotiable" : "Fixed Price"}
                  </span>
                  <span className="text-xs text-neutral-400 font-sans">
                    ≈ {(ad.priceLKR / 1000000).toFixed(2)} Million LKR
                  </span>
                </div>
              </div>
            </div>

            {/* Location & District */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Location & Territory
              </span>
              <div className="mt-2">
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{ad.district}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  City / Town: <strong className="text-neutral-200">{ad.city || "Not specified"}</strong>
                </p>
              </div>
            </div>

            {/* Condition & Status */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/90 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Registration & Status
              </span>
              <div className="mt-2">
                <div className="text-base font-bold text-white">
                  {ad.condition}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Manufacture Year: <strong className="text-neutral-200">{ad.year}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 3. Detailed Specifications Grid */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Mileage */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mileage</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  {ad.mileage} km
                </span>
              </div>

              {/* Fuel Type */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Fuel Type</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {ad.fuelType}
                </span>
              </div>

              {/* Transmission */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Transmission</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {ad.transmission}
                </span>
              </div>

              {/* Engine Capacity */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Engine Capacity</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {ad.engineCapacity ? `${ad.engineCapacity} cc` : "Not specified"}
                </span>
              </div>

              {/* Category */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Body / Category</span>
                <span className="text-sm font-semibold text-white mt-0.5 block truncate" title={ad.category}>
                  {ad.category}
                </span>
              </div>

              {/* Make / Brand */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Make</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {ad.brand}
                </span>
              </div>

              {/* Model */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Model</span>
                <span className="text-sm font-semibold text-white mt-0.5 block">
                  {ad.model}
                </span>
              </div>

              {/* Views Counter */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Marketplace Views</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  {ad.views || 0} visits
                </span>
              </div>
            </div>
          </div>

          {/* 4. Seller & Contact Details Card */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Seller Contact Information
              </h3>
              {ad.hasWhatsApp && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  WhatsApp Available
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Seller Name */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Seller Name</span>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {ad.sellerName ? ad.sellerName.charAt(0).toUpperCase() : "S"}
                  </div>
                  <span className="truncate">{ad.sellerName}</span>
                </div>
              </div>

              {/* Phone Number with Click to Call & Copy */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Primary Phone</span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${ad.sellerPhone}`}
                    className="text-sm font-bold text-white hover:text-blue-400 font-mono transition-colors"
                  >
                    {ad.sellerPhone}
                  </a>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700/60 cursor-pointer"
                    >
                      {copiedPhone ? "Copied" : "Copy"}
                    </button>
                    {ad.hasWhatsApp && (
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.073-2.18-.543-1.899-.787-3.125-2.735-3.22-2.862-.095-.127-.775-1.031-.775-1.966 0-.935.488-1.396.662-1.587.174-.191.382-.239.51-.239.127 0 .254.002.366.007.119.006.277-.045.433.329.16.386.544 1.328.592 1.425.048.096.08.208.016.335-.064.127-.096.207-.191.319-.096.111-.202.248-.288.333-.096.096-.197.2-.085.392.112.191.498.822 1.07 1.332.737.657 1.359.86 1.551.956.191.096.303.08.415-.048.112-.128.479-.558.607-.75.127-.191.255-.16.431-.095.176.064 1.117.527 1.309.623.191.096.319.144.367.223.048.08.048.463-.096.868z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Email Address</span>
                <a
                  href={`mailto:${ad.sellerEmail}`}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 truncate block mt-1 underline underline-offset-2"
                  title={ad.sellerEmail}
                >
                  {ad.sellerEmail}
                </a>
              </div>
            </div>
          </div>

          {/* 5. Vehicle Description Section */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Seller Description
            </h3>
            {ad.description ? (
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/60 font-normal">
                {ad.description}
              </p>
            ) : (
              <p className="text-xs text-neutral-500 italic p-4 bg-neutral-900/40 rounded-xl border border-neutral-800/40">
                No custom description was entered by the seller.
              </p>
            )}
          </div>

          {/* 6. Moderation History & Rejection Alert */}
          {ad.status === "rejected" && ad.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Rejection Reason</span>
              </div>
              <p className="text-xs text-rose-200 font-medium pl-6">
                {ad.rejectionReason}
              </p>
              {ad.reviewedAt && (
                <p className="text-[11px] text-rose-400/80 pl-6">
                  Reviewed on {new Date(ad.reviewedAt).toLocaleString()} by {ad.reviewedBy || "Staff Admin"}
                </p>
              )}
            </div>
          )}

          {/* 7. Inline Rejection Form Drawer */}
          {showRejectForm && (
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-rose-500/40 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Confirm Rejection Reason
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-neutral-300 font-medium">
                  Select predefined reason:
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Incomplete or inaccurate vehicle specifications">
                    Incomplete or inaccurate vehicle specifications
                  </option>
                  <option value="Blurry, low-quality, or copyrighted photos">
                    Blurry, low-quality, or copyrighted photos
                  </option>
                  <option value="Unrealistic or misleading pricing">
                    Unrealistic or misleading pricing
                  </option>
                  <option value="Invalid seller phone number or contact details">
                    Invalid seller phone number or contact details
                  </option>
                  <option value="Duplicate listing already published">
                    Duplicate listing already published
                  </option>
                  <option value="Violates marketplace terms of service">
                    Violates marketplace terms of service
                  </option>
                  <option value="Other">Other (custom explanation)</option>
                </select>

                {rejectionReason === "Other" && (
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom rejection reason here..."
                    className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white p-2.5 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Confirm & Send Rejection Email"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-neutral-400 font-mono">
            <span>DB ID: {ad._id}</span>
            {ad.updatedAt && (
              <>
                <span>•</span>
                <span>Updated: {new Date(ad.updatedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* Direct Link to public catalog */}
            {(ad.status === "approved" || ad.status === "active") && (
              <Link
                href="/vehicles"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Live Catalog</span>
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            )}

            {/* Quick Status Select Dropdown */}
            {onStatusChange && (
              <select
                value={ad.status}
                onChange={(e) => handleQuickStatusSelect(e.target.value)}
                disabled={actionLoading}
                className="bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer font-semibold disabled:opacity-50"
              >
                <option value="approved">Set Live (Approved)</option>
                <option value="pending">Set Pending</option>
                <option value="sold">Mark as Sold</option>
                <option value="archived">Archive</option>
                <option value="rejected">Reject</option>
              </select>
            )}

            {/* Delete Trigger if provided */}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ad)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-800 transition-colors cursor-pointer"
                title="Permanently delete vehicle"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            {/* Pending State Specific Fast Approval/Reject Buttons */}
            {onStatusChange && ad.status === "pending" && !showRejectForm && (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-rose-500/20 text-neutral-200 hover:text-rose-400 border border-neutral-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Reject Listing
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{actionLoading ? "Approving..." : "Approve & Publish"}</span>
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
