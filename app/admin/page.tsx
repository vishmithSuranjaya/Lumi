"use client";

import React, { useState } from "react";
import Link from "next/link";

// Mock data for initial dashboard demonstration & state management
interface AdSubmission {
  id: string;
  vehicle: string;
  year: number;
  make: string;
  model: string;
  price: number;
  seller: string;
  email: string;
  phone: string;
  date: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  category: string;
}

const initialSubmissions: AdSubmission[] = [
  {
    id: "AD-8841",
    vehicle: "2024 Mercedes-Benz AMG GT Coupe",
    year: 2024,
    make: "Mercedes-Benz",
    model: "AMG GT 63",
    price: 185000,
    seller: "Alexander Wright",
    email: "a.wright@example.com",
    phone: "+1 (555) 234-8901",
    date: "10 mins ago",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=80",
    status: "pending",
    category: "Coupe / Sports",
  },
  {
    id: "AD-8840",
    vehicle: "2023 Porsche 911 Carrera 4S",
    year: 2023,
    make: "Porsche",
    model: "911 Carrera 4S",
    price: 142000,
    seller: "Elena Rostova",
    email: "elena.r@example.com",
    phone: "+1 (555) 876-5432",
    date: "45 mins ago",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80",
    status: "pending",
    category: "Sports",
  },
  {
    id: "AD-8839",
    vehicle: "2024 BMW M8 Competition Gran Coupe",
    year: 2024,
    make: "BMW",
    model: "M8 Competition",
    price: 139500,
    seller: "David Chen",
    email: "david.chen@example.com",
    phone: "+1 (555) 345-6789",
    date: "2 hours ago",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=80",
    status: "pending",
    category: "Sedan / Luxury",
  },
  {
    id: "AD-8838",
    vehicle: "2023 Range Rover Autobiography LWB",
    year: 2023,
    make: "Land Rover",
    model: "Range Rover",
    price: 168000,
    seller: "Marcus Vance",
    email: "m.vance@example.com",
    phone: "+1 (555) 901-2345",
    date: "5 hours ago",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=80",
    status: "approved",
    category: "Luxury SUV",
  },
  {
    id: "AD-8837",
    vehicle: "2024 Audi RS e-tron GT",
    year: 2024,
    make: "Audi",
    model: "RS e-tron GT",
    price: 124000,
    seller: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "+1 (555) 432-1098",
    date: "Yesterday",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=300&q=80",
    status: "approved",
    category: "Electric / Performance",
  },
];

const recentInquiries = [
  {
    id: "INQ-104",
    buyer: "Michael Scott",
    vehicle: "2024 Mercedes-Benz AMG GT",
    offeredPrice: "$180,000",
    status: "New Offer",
    time: "15 mins ago",
    note: "Cash buyer, ready for immediate inspection and wire transfer.",
  },
  {
    id: "INQ-103",
    buyer: "Jessica Alba",
    vehicle: "2023 Porsche 911 Carrera 4S",
    offeredPrice: "$138,000",
    status: "Test Drive Request",
    time: "1 hour ago",
    note: "Requested weekend test drive appointment in Downtown showroom.",
  },
  {
    id: "INQ-102",
    buyer: "Robert Thorne",
    vehicle: "2024 BMW M8 Competition",
    offeredPrice: "$135,000",
    status: "Lease Inquiry",
    time: "3 hours ago",
    note: "Inquiring about 36-month corporate lease terms with 20% down.",
  },
];

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<AdSubmission[]>(initialSubmissions);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [activeTimeframe, setActiveTimeframe] = useState("Last 30 Days");

  const handleAction = (id: string, newStatus: "approved" | "rejected") => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const filteredSubmissions = submissions.filter((item) => {
    if (filterStatus === "all") return true;
    return item.status === filterStatus;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header & Live Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Control
            </span>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time showroom overview, advertisement queue moderation, and inventory health.
          </p>
        </div>

        {/* Timeframe selector & Export */}
        <div className="flex items-center gap-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-1 flex text-xs font-medium">
            {["7 Days", "Last 30 Days", "This Year"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTimeframe(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTimeframe === tab
                    ? "bg-neutral-800 text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition-colors">
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Fleet */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Total Live Fleet</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">142</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +8.4%
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Across 18 global certified brands</p>
        </div>

        {/* Card 2: Pending Ad Queue */}
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
            <span className="text-3xl font-extrabold text-white">{pendingCount}</span>
            {pendingCount > 0 ? (
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 animate-pulse">
                Needs Action
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-400">All Cleared</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Average review time: 18 mins</p>
        </div>

        {/* Card 3: Inquiries & Offers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Customer Leads</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">38</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +19.2%
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">5 high-value buyout offers</p>
        </div>

        {/* Card 4: Inventory Valuation */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-lg relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">Inventory Valuation</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">$4.85M</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +14.0%
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">Average unit: $128,400</p>
        </div>
      </div>

      {/* 3. Primary Section: Ad Submissions & Approval Queue Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header with Filters */}
        <div className="p-5 sm:p-6 border-b border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Advertisement Moderation Queue
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {filteredSubmissions.length} listings
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Review seller postings before publishing them to the public vehicle catalog.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  filterStatus === tab
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-950/50 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-6">Vehicle & Spec</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Seller Contact</th>
                <th className="py-3.5 px-6">Listed Price</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-sm">
              {filteredSubmissions.map((ad) => (
                <tr key={ad.id} className="hover:bg-neutral-800/40 transition-colors group">
                  {/* Vehicle Spec */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700/50">
                        {/* Fallback image */}
                        <img
                          src={ad.image}
                          alt={ad.vehicle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {ad.vehicle}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-neutral-400">{ad.id}</span>
                          <span>•</span>
                          <span>{ad.date}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-6 text-neutral-300 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/50 font-medium">
                      {ad.category}
                    </span>
                  </td>

                  {/* Seller Contact */}
                  <td className="py-4 px-6">
                    <div className="text-sm font-medium text-neutral-200">{ad.seller}</div>
                    <div className="text-xs text-neutral-400">{ad.email}</div>
                  </td>

                  {/* Listed Price */}
                  <td className="py-4 px-6 font-semibold text-white font-mono">
                    ${ad.price.toLocaleString()}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6">
                    {ad.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Pending Review
                      </span>
                    )}
                    {ad.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Live in Catalog
                      </span>
                    )}
                    {ad.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Rejected / Flagged
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ad.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(ad.id, "approved")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all hover:scale-105 active:scale-95"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(ad.id, "rejected")}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-300 text-xs font-semibold border border-neutral-700 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAction(ad.id, ad.status === "approved" ? "rejected" : "approved")}
                          className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-2"
                        >
                          Change Status
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between text-xs text-neutral-400">
          <span>Showing {filteredSubmissions.length} of {submissions.length} submissions</span>
          <Link
            href="/admin/vehicles"
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>Open Comprehensive Fleet Manager</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 4. Secondary Grid: Fleet Breakdown & Recent Customer Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3): Fleet Category Breakdown */}
        <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Fleet Composition</h3>
              <span className="text-xs text-neutral-400">By Vehicle Type</span>
            </div>

            <div className="space-y-4">
              {[
                { type: "Luxury Sedans", count: 52, percentage: 37, color: "bg-blue-500" },
                { type: "Performance & Sports", count: 38, percentage: 27, color: "bg-indigo-500" },
                { type: "SUVs & All-Terrain", count: 34, percentage: 24, color: "bg-sky-500" },
                { type: "Electric & Hybrids", count: 18, percentage: 12, color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 font-medium">{item.type}</span>
                    <span className="text-neutral-400 font-mono">
                      {item.count} units ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Market Demand Trend</span>
            <span className="text-emerald-400 font-medium">High SUV & EV Growth</span>
          </div>
        </div>

        {/* Right Column (2/3): Recent Inquiries & Offers */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Recent Inquiries & Offers</h3>
              <p className="text-xs text-neutral-400">Direct buyer negotiations and showroom requests</p>
            </div>
            <Link
              href="/admin/offers"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All ({recentInquiries.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {recentInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{inq.buyer}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      {inq.status}
                    </span>
                    <span className="text-[11px] text-neutral-400">• {inq.time}</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Target: <span className="text-white font-medium">{inq.vehicle}</span> — Bid:{" "}
                    <span className="text-emerald-400 font-mono font-semibold">{inq.offeredPrice}</span>
                  </p>
                  <p className="text-xs text-neutral-400 italic">"{inq.note}"</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-xs transition-all">
                    Respond
                  </button>
                  <button className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Quick Administrative Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: "Manage Fleet", desc: "Add, edit, or archive vehicle listings", href: "/admin/vehicles", icon: "🚗" },
          { title: "Review Inquiries", desc: "Handle buyer price bids & test drives", href: "/admin/offers", icon: "💬" },
          { title: "User Directory", desc: "Manage registered buyers & dealers", href: "/admin/users", icon: "👥" },
          { title: "System Settings", desc: "Site metadata, currencies & fees", href: "/admin/settings", icon: "⚙️" },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">
              {action.icon}
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
              {action.title}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{action.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
