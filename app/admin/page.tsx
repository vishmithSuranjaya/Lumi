"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface VehicleSubmission {
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
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  images: string[];
  status: "pending" | "approved" | "rejected" | "active";
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface StatsSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalValuationLKR: number;
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<VehicleSubmission[]>([]);
  const [stats, setStats] = useState<StatsSummary>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalValuationLKR: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Reject Modal State
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    adId: string | null;
    vehicleTitle: string;
    reason: string;
  }>({
    isOpen: false,
    adId: null,
    vehicleTitle: "",
    reason: "Incomplete or inaccurate vehicle specifications",
  });

  // Fetch real advertisements from the Admin API
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/advertisements");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubmissions(json.data);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (error) {
      console.error("Failed to load advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Show temporary toast message
  const triggerToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  // Perform approve or reject action
  const handleUpdateStatus = async (
    id: string,
    newStatus: "approved" | "rejected",
    reason?: string
  ) => {
    // Optimistic UI update
    setSubmissions((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              status: newStatus,
              rejectionReason: newStatus === "rejected" ? reason || "Rejected by admin" : null,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "LUMI Staff Admin",
            }
          : item
      )
    );

    try {
      const response = await fetch("/api/admin/advertisements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          rejectionReason: reason,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        triggerToast(
          newStatus === "approved"
            ? "Vehicle advertisement approved and published live!"
            : "Vehicle advertisement rejected."
        );
        // Refresh stats
        fetchSubmissions();
      } else {
        alert(resData.message || "Failed to update status");
        fetchSubmissions();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      fetchSubmissions();
    }
  };

  const openRejectModal = (ad: VehicleSubmission) => {
    setRejectModal({
      isOpen: true,
      adId: ad._id,
      vehicleTitle: `${ad.brand} ${ad.model} (${ad.year})`,
      reason: "Incomplete or inaccurate vehicle specifications",
    });
  };

  const confirmReject = () => {
    if (!rejectModal.adId) return;
    handleUpdateStatus(rejectModal.adId, "rejected", rejectModal.reason);
    setRejectModal({ isOpen: false, adId: null, vehicleTitle: "", reason: "" });
  };

  const filteredSubmissions = submissions.filter((item) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "approved") return item.status === "approved" || item.status === "active";
    return item.status === filterStatus;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold tracking-wide">{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-neutral-400 hover:text-white ml-2 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Advertisement Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live Approval Queue
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Review user-submitted vehicle advertisements before they are published to the public marketplace.
          </p>
        </div>

        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : "text-neutral-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Pending Ad Queue */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Pending Review</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">{stats.pending}</span>
            {stats.pending > 0 ? (
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 animate-pulse">
                Action Required
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-400">Queue Cleared</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Requires admin approval to go live</p>
        </div>

        {/* Card 2: Total Live Fleet */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Live in Catalog</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">{stats.approved}</span>
            <span className="text-xs font-semibold text-emerald-400">Approved & Active</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Visible to all marketplace buyers</p>
        </div>

        {/* Card 3: Rejected Listings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Rejected Listings</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">{stats.rejected}</span>
            <span className="text-xs font-semibold text-rose-400">Flagged</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Violated rules or invalid information</p>
        </div>

        {/* Card 4: Inventory Valuation */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Live Inventory Value</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-mono">
              Rs.
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats.totalValuationLKR >= 1000000000
                ? `${(stats.totalValuationLKR / 1000000000).toFixed(2)}B`
                : `${(stats.totalValuationLKR / 1000000).toFixed(1)}M`}
            </span>
            <span className="text-xs font-semibold text-blue-400">LKR</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Combined value of approved vehicles</p>
        </div>
      </div>

      {/* 3. Primary Moderation Queue Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header with Filters */}
        <div className="p-5 sm:p-6 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Advertisement Submissions
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {filteredSubmissions.length} listings
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Review vehicle specifications, seller contact, verify price, and approve or reject publication.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            {(["pending", "all", "approved", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === tab
                    ? tab === "pending"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-blue-600 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab === "pending" ? `Pending (${pendingCount})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 text-center text-neutral-400 text-sm">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading advertisements from database...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-sm">
            <p className="font-semibold text-neutral-300">No advertisements found in this queue.</p>
            <p className="text-xs text-neutral-500 mt-1">
              {filterStatus === "pending"
                ? "All caught up! There are no submissions awaiting admin review."
                : "No listings match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 bg-neutral-950/50 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-6">Vehicle & Spec</th>
                  <th className="py-3.5 px-6">Seller Contact</th>
                  <th className="py-3.5 px-6">Listed Price</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm">
                {filteredSubmissions.map((ad) => {
                  return (
                    <tr key={ad._id} className="hover:bg-neutral-800/40 transition-colors group">
                      {/* Vehicle Spec */}
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {ad.brand} {ad.model}
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-neutral-300 font-bold">{ad.refId}</span>
                            <span>•</span>
                            <span>{ad.year}</span>
                            <span>•</span>
                            <span>{ad.condition}</span>
                          </div>
                        </div>
                      </td>

                      {/* Seller Contact */}
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-neutral-200">{ad.sellerName}</div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{ad.sellerPhone}</span>
                          <span>•</span>
                          <span>{ad.district}</span>
                        </div>
                      </td>

                      {/* Listed Price */}
                      <td className="py-4 px-6 font-semibold text-white font-mono">
                        LKR {ad.priceLKR.toLocaleString()}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {ad.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Pending Approval
                          </span>
                        )}
                        {(ad.status === "approved" || ad.status === "active") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Live in Catalog
                          </span>
                        )}
                        {ad.status === "rejected" && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              Rejected
                            </span>
                            {ad.rejectionReason && (
                              <p className="text-[10px] text-neutral-400 mt-1 max-w-[160px] truncate" title={ad.rejectionReason}>
                                {ad.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ad.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(ad._id, "approved")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(ad)}
                                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-300 text-xs font-bold border border-neutral-700 transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : ad.status === "approved" || ad.status === "active" ? (
                            <button
                              onClick={() => openRejectModal(ad)}
                              className="text-xs text-neutral-400 hover:text-rose-400 underline underline-offset-2 cursor-pointer font-medium"
                            >
                              Revoke / Reject
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(ad._id, "approved")}
                              className="text-xs text-neutral-400 hover:text-emerald-400 underline underline-offset-2 cursor-pointer font-medium"
                            >
                              Approve Listing
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between text-xs text-neutral-400">
          <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
          <Link
            href="/vehicles"
            target="_blank"
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <span>View Public Vehicle Inventory</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 4. Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white text-base">Reject Advertisement</h3>
              <button
                onClick={() => setRejectModal({ isOpen: false, adId: null, vehicleTitle: "", reason: "" })}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-neutral-400 mb-1">Target vehicle:</p>
              <p className="font-semibold text-white text-sm">{rejectModal.vehicleTitle}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Reason for Rejection
              </label>
              <select
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="w-full bg-neutral-950 border border-neutral-700 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-rose-500 cursor-pointer"
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
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, adId: null, vehicleTitle: "", reason: "" })}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
