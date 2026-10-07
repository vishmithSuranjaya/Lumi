"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { VEHICLE_CATEGORIES, SRI_LANKA_DISTRICTS } from "@/lib/validations/advertisement";
import AdvertisementDetailModal, { AdminAdvertisement } from "@/components/admin/AdvertisementDetailModal";

export type FleetVehicle = AdminAdvertisement;

export default function AdminVehicleFleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Pop-up Modal State
  const [selectedDetailVehicle, setSelectedDetailVehicle] = useState<FleetVehicle | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    vehicle: FleetVehicle | null;
  }>({
    isOpen: false,
    vehicle: null,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/advertisements?status=all");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVehicles(json.data);
      }
    } catch (err) {
      console.error("Failed to load vehicle fleet:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Update status (e.g. approved, sold, archived, rejected)
  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic UI update
    setVehicles((prev) =>
      prev.map((v) => (v._id === id ? { ...v, status: newStatus as any } : v))
    );

    setSelectedDetailVehicle((prev) =>
      prev && prev._id === id ? { ...prev, status: newStatus as any } : prev
    );

    try {
      const res = await fetch("/api/admin/advertisements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Vehicle status changed to '${newStatus}'`);
        fetchFleet();
      } else {
        alert(data.message || "Failed to change status");
        fetchFleet();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      fetchFleet();
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async () => {
    if (!deleteModal.vehicle) return;
    const targetId = deleteModal.vehicle._id;

    // Optimistic remove
    setVehicles((prev) => prev.filter((v) => v._id !== targetId));
    setDeleteModal({ isOpen: false, vehicle: null });

    try {
      const res = await fetch(`/api/admin/advertisements?id=${targetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Vehicle listing permanently deleted from fleet");
      } else {
        alert(data.message || "Failed to delete vehicle");
        fetchFleet();
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      fetchFleet();
    }
  };

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = `${item.brand} ${item.model}`.toLowerCase().includes(q);
          const matchRef = item.refId?.toLowerCase().includes(q);
          const matchSeller = item.sellerName?.toLowerCase().includes(q);
          const matchDistrict = item.district?.toLowerCase().includes(q);
          if (!matchTitle && !matchRef && !matchSeller && !matchDistrict) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== "all") {
          if (selectedStatus === "live") {
            if (item.status !== "approved" && item.status !== "active") return false;
          } else if (item.status !== selectedStatus) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
          return false;
        }

        // District filter
        if (selectedDistrict !== "all" && item.district !== selectedDistrict) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-desc") return (b.priceLKR || 0) - (a.priceLKR || 0);
        if (sortBy === "price-asc") return (a.priceLKR || 0) - (b.priceLKR || 0);
        if (sortBy === "year-desc") return (b.year || 0) - (a.year || 0);
        if (sortBy === "year-asc") return (a.year || 0) - (b.year || 0);
        // Default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [vehicles, searchQuery, selectedStatus, selectedCategory, selectedDistrict, sortBy]);

  // Statistics
  const liveCount = vehicles.filter((v) => v.status === "approved" || v.status === "active").length;
  const pendingCount = vehicles.filter((v) => v.status === "pending").length;
  const soldCount = vehicles.filter((v) => v.status === "sold").length;
  const totalFleetValuation = vehicles
    .filter((v) => v.status === "approved" || v.status === "active")
    .reduce((sum, v) => sum + (Number(v.priceLKR) || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-200 text-gray-800 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Vehicle Fleet Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              Total: {vehicles.length} Units
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Complete inventory catalog controls, listing status moderation, and vehicle portfolio valuation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchFleet}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : "text-gray-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <Link
            href="/post_advertisement"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Post New Vehicle</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Units */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Registered</span>
            <span className="text-blue-500 font-mono text-sm">🚗</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{vehicles.length}</span>
            <span className="text-xs text-gray-400">Total Listings</span>
          </div>
        </div>

        {/* Live in Catalog */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Live in Catalog</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{liveCount}</span>
            <span className="text-xs font-semibold text-emerald-600">Active</span>
          </div>
        </div>

        {/* Total Active Valuation */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Live Fleet Value</span>
            <span className="text-emerald-600 font-mono font-bold text-xs">LKR</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
              {totalFleetValuation >= 1000000000
                ? `${(totalFleetValuation / 1000000000).toFixed(2)}B`
                : `${(totalFleetValuation / 1000000).toFixed(1)}M`}
            </span>
            <span className="text-xs text-gray-400 font-semibold">LKR</span>
          </div>
        </div>

        {/* Under Review / Sold */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Pending & Sold</span>
            <span className="text-amber-500 font-mono text-sm">⏳</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <span className="text-2xl font-extrabold text-amber-500">{pendingCount}</span>
              <span className="text-[11px] text-gray-400 block">Pending</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-2xl font-extrabold text-indigo-500">{soldCount}</span>
              <span className="text-[11px] text-gray-400 block">Sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by brand, model, ref ID, seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="live">Live in Catalog</option>
              <option value="pending">Pending Approval</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {VEHICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">Recently Listed</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Reset */}
        {(searchQuery || selectedStatus !== "all" || selectedCategory !== "all" || selectedDistrict !== "all") && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
            <span className="text-gray-400">
              Showing <strong className="text-gray-900">{filteredVehicles.length}</strong> matching vehicles
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
                setSelectedCategory("all");
                setSelectedDistrict("all");
              }}
              className="text-blue-600 hover:text-blue-500 font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Vehicles Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-gray-400 text-sm">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading vehicle fleet inventory...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <p className="font-semibold text-gray-600 text-base">No vehicles found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search criteria or post a new vehicle to the fleet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6">Vehicle</th>
                  <th className="py-3.5 px-6">Transmission / Fuel</th>
                  <th className="py-3.5 px-6">Seller Contact</th>
                  <th className="py-3.5 px-6">Listed Price</th>
                  <th className="py-3.5 px-6">Catalog Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredVehicles.map((vehicle) => {
                  return (
                    <tr key={vehicle._id} className="hover:bg-gray-50 transition-colors group">
                      {/* Vehicle Spec with Thumbnail & Click to View */}
                      <td className="py-4 px-6">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setSelectedDetailVehicle(vehicle)}
                          title="Click to view full vehicle details"
                        >
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative group-hover:border-blue-400 transition-colors">
                              <img
                                src={vehicle.images[0]}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {vehicle.images.length > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[9px] font-mono text-white px-1 rounded">
                                  +{vehicle.images.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                              <span className="text-gray-600 font-bold">{vehicle.refId}</span>
                              <span>•</span>
                              <span>{vehicle.year}</span>
                              <span>•</span>
                              <span className="font-sans">{vehicle.condition}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Transmission & Fuel */}
                      <td className="py-4 px-6 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                            {vehicle.transmission}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                            {vehicle.fuelType}
                          </span>
                        </div>
                      </td>

                      {/* Seller Contact */}
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-gray-700">{vehicle.sellerName}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{vehicle.sellerPhone}</span>
                          <span>•</span>
                          <span>{vehicle.district}</span>
                        </div>
                      </td>

                      {/* Listed Price */}
                      <td className="py-4 px-6 font-bold text-gray-900 font-mono">
                        LKR {vehicle.priceLKR?.toLocaleString() || "0"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {(vehicle.status === "approved" || vehicle.status === "active") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Live in Catalog
                          </span>
                        )}
                        {vehicle.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Pending Review
                          </span>
                        )}
                        {vehicle.status === "sold" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Sold
                          </span>
                        )}
                        {vehicle.status === "archived" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            Archived
                          </span>
                        )}
                        {vehicle.status === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailVehicle(vehicle)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold border border-gray-200 transition-all cursor-pointer shadow-xs hover:border-blue-300"
                            title="Open full vehicle details in pop-up"
                          >
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          {/* Quick Status Select */}
                          <select
                            value={vehicle.status}
                            onChange={(e) => handleStatusChange(vehicle._id, e.target.value)}
                            className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-xs text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                          >
                            <option value="approved">Set Live</option>
                            <option value="sold">Mark as Sold</option>
                            <option value="archived">Archive</option>
                            <option value="pending">Set Pending</option>
                            <option value="rejected">Reject</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, vehicle })}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete listing"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong className="text-gray-900">{filteredVehicles.length}</strong> of{" "}
            <strong className="text-gray-900">{vehicles.length}</strong> total fleet entries
          </span>
          <Link
            href="/vehicles"
            target="_blank"
            className="text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1"
          >
            <span>Open Public Vehicle Catalog</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 5. Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.vehicle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Delete Vehicle Listing</h3>
              <button
                onClick={() => setDeleteModal({ isOpen: false, vehicle: null })}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to permanently delete this listing from the database? This action cannot be undone.
            </p>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <div className="text-xs text-gray-400 font-mono font-bold">
                {deleteModal.vehicle.refId}
              </div>
              <div className="text-sm font-bold text-gray-900">
                {deleteModal.vehicle.brand} {deleteModal.vehicle.model} ({deleteModal.vehicle.year})
              </div>
              <div className="text-xs text-gray-400">
                Seller: {deleteModal.vehicle.sellerName} • LKR {deleteModal.vehicle.priceLKR?.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, vehicle: null })}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVehicle}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Separate Advertisement Detail Pop-up Modal */}
      <AdvertisementDetailModal
        isOpen={Boolean(selectedDetailVehicle)}
        ad={selectedDetailVehicle}
        onClose={() => setSelectedDetailVehicle(null)}
        onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus)}
        onDelete={(v) => {
          setSelectedDetailVehicle(null);
          setDeleteModal({ isOpen: true, vehicle: v });
        }}
      />
    </div>
  );
}
