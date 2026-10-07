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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 lg:p-7 animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-gray-900/20 overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Sticky Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/90 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
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
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
                  {ad.brand} {ad.model} ({ad.year})
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                  {ad.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <span className="font-mono font-medium text-gray-700">{ad.refId}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 cursor-pointer"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Live in Catalog
              </span>
            )}
            {ad.status === "pending" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Pending Review
              </span>
            )}
            {ad.status === "sold" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Sold
              </span>
            )}
            {ad.status === "archived" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                Archived
              </span>
            )}
            {ad.status === "rejected" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Rejected
              </span>
            )}

            {/* Close modal X button */}
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
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7 space-y-6 custom-scrollbar bg-white">
          {/* 1. Photo Gallery Section */}
          <div className="space-y-3">
            {images.length > 0 && currentImage ? (
              <div className="space-y-3">
                {/* Main Large Photo Display */}
                <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center group">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center border border-gray-200 transition-all opacity-85 hover:opacity-100 cursor-pointer shadow-lg"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center border border-gray-200 transition-all opacity-85 hover:opacity-100 cursor-pointer shadow-lg"
                      title="Next Image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Photo Counter Pill */}
                  <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold px-3 py-1 rounded-full shadow-md">
                    {activeImageIndex + 1} / {images.length}
                  </div>

                  {/* Open Fullscreen link */}
                  <a
                    href={currentImage}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-lg backdrop-blur-md border border-gray-200 transition-colors text-xs flex items-center gap-1.5 shadow-sm"
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
                            ? "border-blue-600 scale-105 shadow-md shadow-blue-500/20"
                            : "border-gray-200 opacity-60 hover:opacity-100"
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
              <div className="w-full h-48 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Listed Asking Price
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-black text-gray-900 font-mono tracking-tight">
                  LKR {ad.priceLKR?.toLocaleString() || "0"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      ad.isNegotiable
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {ad.isNegotiable ? "Negotiable" : "Fixed Price"}
                  </span>
                  <span className="text-xs text-gray-500 font-sans">
                    ≈ {(ad.priceLKR / 1000000).toFixed(2)} Million LKR
                  </span>
                </div>
              </div>
            </div>

            {/* Location & District */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Location & Territory
              </span>
              <div className="mt-2">
                <div className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{ad.district}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  City / Town: <strong className="text-gray-800">{ad.city || "Not specified"}</strong>
                </p>
              </div>
            </div>

            {/* Condition & Status */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Registration & Status
              </span>
              <div className="mt-2">
                <div className="text-base font-bold text-gray-900">
                  {ad.condition}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Manufacture Year: <strong className="text-gray-800">{ad.year}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 3. Detailed Specifications Grid */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Mileage */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Mileage</span>
                <span className="text-sm font-semibold text-gray-900 font-mono mt-0.5 block">
                  {ad.mileage} km
                </span>
              </div>

              {/* Fuel Type */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Fuel Type</span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                  {ad.fuelType}
                </span>
              </div>

              {/* Transmission */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Transmission</span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                  {ad.transmission}
                </span>
              </div>

              {/* Engine Capacity */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Engine Capacity</span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                  {ad.engineCapacity ? `${ad.engineCapacity} cc` : "Not specified"}
                </span>
              </div>

              {/* Category */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Body / Category</span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block truncate" title={ad.category}>
                  {ad.category}
                </span>
              </div>

              {/* Make / Brand */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Make</span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                  {ad.brand}
                </span>
              </div>

              {/* Model */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Model</span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                  {ad.model}
                </span>
              </div>

              {/* Views Counter */}
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Marketplace Views</span>
                <span className="text-sm font-semibold text-gray-900 font-mono mt-0.5 block">
                  {ad.views || 0} visits
                </span>
              </div>
            </div>
          </div>

          {/* 4. Seller & Contact Details Card */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Seller Contact Information
              </h3>
              {ad.hasWhatsApp && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  WhatsApp Available
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Seller Name */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Seller Name</span>
                <div className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {ad.sellerName ? ad.sellerName.charAt(0).toUpperCase() : "S"}
                  </div>
                  <span className="truncate">{ad.sellerName}</span>
                </div>
              </div>

              {/* Phone Number with Click to Call & Copy */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Primary Phone</span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${ad.sellerPhone}`}
                    className="text-sm font-bold text-gray-900 hover:text-blue-600 font-mono transition-colors"
                  >
                    {ad.sellerPhone}
                  </a>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-[11px] text-gray-600 hover:text-gray-900 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer"
                    >
                      {copiedPhone ? "Copied" : "Copy"}
                    </button>
                    {ad.hasWhatsApp && (
                      <a
                        href={getWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
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
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Email Address</span>
                <a
                  href={`mailto:${ad.sellerEmail}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate block mt-1 underline underline-offset-2"
                  title={ad.sellerEmail}
                >
                  {ad.sellerEmail}
                </a>
              </div>
            </div>
          </div>

          {/* 5. Vehicle Description Section */}
          <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Seller Description
            </h3>
            {ad.description ? (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-gray-200 font-normal">
                {ad.description}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic p-4 bg-white rounded-xl border border-gray-200">
                No custom description was entered by the seller.
              </p>
            )}
          </div>

          {/* 6. Moderation History & Rejection Alert */}
          {ad.status === "rejected" && ad.rejectionReason && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Rejection Reason</span>
              </div>
              <p className="text-xs text-rose-900 font-medium pl-6">
                {ad.rejectionReason}
              </p>
              {ad.reviewedAt && (
                <p className="text-[11px] text-rose-600 pl-6">
                  Reviewed on {new Date(ad.reviewedAt).toLocaleString()} by {ad.reviewedBy || "Staff Admin"}
                </p>
              )}
            </div>
          )}

          {/* 7. Inline Rejection Form Drawer */}
          {showRejectForm && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Confirm Rejection Reason
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-700 font-medium">
                  Select predefined reason:
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-xs text-gray-900 p-2.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 cursor-pointer"
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
                    className="w-full bg-white border border-gray-300 text-xs text-gray-900 p-2.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Confirm & Send Rejection Email"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-gray-500 font-mono">
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
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Live Catalog</span>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="bg-white border border-gray-300 text-xs text-gray-800 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 cursor-pointer font-semibold disabled:opacity-50 shadow-2xs"
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
                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200 hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
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
                  className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-300 hover:border-rose-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  Reject Listing
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
