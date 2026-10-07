"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AnalyticsKPIs {
  liveValuationLKR: number;
  totalValuationLKR: number;
  averagePriceLKR: number;
  totalAdsCount: number;
  liveAdsCount: number;
  pendingAdsCount: number;
  rejectedAdsCount: number;
  soldAdsCount: number;
  archivedAdsCount: number;
  negotiablePercent: number;
  approvalRate: number;
  totalUsers: number;
  sellerCount: number;
  sellerConversionRate: number;
  googleUsers: number;
}

interface BreakdownItem {
  name: string;
  count: number;
  percentage: number;
  valuation?: number;
}

interface PriceTier {
  label: string;
  count: number;
  percentage: number;
}

interface ViewedAd {
  _id: string;
  refId: string;
  title: string;
  priceLKR: number;
  views: number;
  category: string;
  status: string;
  images: string[];
}

interface TopSeller {
  name: string;
  email: string;
  phone: string;
  count: number;
  totalValue: number;
}

interface MonthlyTrendItem {
  month: string;
  submissions: number;
  approved: number;
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"all" | "90d" | "30d" | "7d">("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "sellers" | "exports">("overview");
  const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
  const [categories, setCategories] = useState<BreakdownItem[]>([]);
  const [topBrands, setTopBrands] = useState<BreakdownItem[]>([]);
  const [fuelBreakdown, setFuelBreakdown] = useState<BreakdownItem[]>([]);
  const [transmissionBreakdown, setTransmissionBreakdown] = useState<BreakdownItem[]>([]);
  const [districtHotspots, setDistrictHotspots] = useState<BreakdownItem[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [topRejectionReasons, setTopRejectionReasons] = useState<{ reason: string; count: number }[]>([]);
  const [mostViewedAds, setMostViewedAds] = useState<ViewedAd[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  // Fetch analytics from API
  const fetchAnalytics = async (selectedRange = range) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
      const json = await res.json();
      if (json.success) {
        setKpis(json.kpis);
        setCategories(json.categories || []);
        setTopBrands(json.topBrands || []);
        setFuelBreakdown(json.fuelBreakdown || []);
        setTransmissionBreakdown(json.transmissionBreakdown || []);
        setDistrictHotspots(json.districtHotspots || []);
        setPriceTiers(json.priceTiers || []);
        setTopRejectionReasons(json.topRejectionReasons || []);
        setMostViewedAds(json.mostViewedAds || []);
        setTopSellers(json.topSellers || []);
        setMonthlyTrend(json.monthlyTrend || []);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  // Export CSV Helper
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Full Inventory
  const handleExportInventoryCSV = async () => {
    try {
      setExporting("inventory");
      const res = await fetch("/api/admin/advertisements");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const headers = [
          "Reference ID",
          "Brand",
          "Model",
          "Year",
          "Category",
          "Price (LKR)",
          "Condition",
          "Mileage (km)",
          "Fuel Type",
          "Transmission",
          "District",
          "City",
          "Seller Name",
          "Seller Phone",
          "Seller Email",
          "Status",
          "Views",
          "Created Date",
        ];

        const rows = json.data.map((ad: any) => [
          ad.refId || "",
          ad.brand || "",
          ad.model || "",
          ad.year || "",
          ad.category || "",
          ad.priceLKR || 0,
          ad.condition || "",
          ad.mileage || "",
          ad.fuelType || "",
          ad.transmission || "",
          ad.district || "",
          ad.city || "",
          ad.sellerName || "",
          ad.sellerPhone || "",
          ad.sellerEmail || "",
          ad.status || "",
          ad.views || 0,
          ad.createdAt ? new Date(ad.createdAt).toISOString() : "",
        ]);

        downloadCSV(`lumi_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`, [
          headers,
          ...rows,
        ]);
      }
    } finally {
      setExporting(null);
    }
  };

  // Export Sellers Directory
  const handleExportSellersCSV = async () => {
    try {
      setExporting("sellers");
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.users)) {
        const headers = [
          "User ID",
          "Full Name",
          "Email",
          "Phone",
          "Role",
          "Auth Provider",
          "Total Ads Posted",
          "Live Ads in Catalog",
          "Registered Date",
        ];

        const rows = json.users.map((u: any) => [
          u._id || "",
          u.name || "",
          u.email || "",
          u.phone || "",
          u.role || "",
          u.authProvider || "",
          u.adsCount || 0,
          u.activeAdsCount || 0,
          u.createdAt ? new Date(u.createdAt).toISOString() : "",
        ]);

        downloadCSV(`lumi_sellers_directory_${new Date().toISOString().slice(0, 10)}.csv`, [
          headers,
          ...rows,
        ]);
      }
    } finally {
      setExporting(null);
    }
  };

  const formatLKR = (val: number) => {
    if (val >= 1000000000) {
      return `${(val / 1000000000).toFixed(2)}B`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Analytics & Executive Reports
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Real-time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Live valuation metrics, fleet distributions, buyer demand, and downloadable CSV audits.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time range picker */}
          <div className="flex items-center p-1 bg-white border border-gray-200 rounded-xl shadow-2xs text-xs">
            <button
              onClick={() => setRange("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                range === "all" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setRange("90d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                range === "90d" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                range === "30d" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                range === "7d" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Print Report */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Print or Save PDF report"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="hidden sm:inline">Print Report</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchAnalytics()}
            disabled={loading}
            className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Data"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Live Catalog Valuation */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Live Fleet Valuation</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold font-mono">
              Rs.
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 font-mono">
              {kpis ? formatLKR(kpis.liveValuationLKR) : "—"}
            </span>
            <span className="text-xs font-semibold text-blue-600">LKR</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Avg: <strong className="text-gray-700 font-mono">Rs. {kpis ? formatLKR(kpis.averagePriceLKR) : 0}</strong> per vehicle
          </p>
        </div>

        {/* Card 2: Submissions & Active Inventory */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Inventory Volume</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.totalAdsCount ?? 0}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {kpis?.liveAdsCount ?? 0} Live
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            <span className="text-amber-600 font-semibold">{kpis?.pendingAdsCount ?? 0} pending</span> moderation review
          </p>
        </div>

        {/* Card 3: Quality & Moderation Rate */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-purple-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Approval Rate</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.approvalRate ?? 100}%</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Verified
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            <span className="text-rose-500 font-semibold">{kpis?.rejectedAdsCount ?? 0} rejected</span> flagged submissions
          </p>
        </div>

        {/* Card 4: Seller Conversion */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Seller Base</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{kpis?.sellerCount ?? 0}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {kpis?.sellerConversionRate ?? 0}% Conversion
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Out of <strong className="text-gray-700">{kpis?.totalUsers ?? 0} registered</strong> accounts
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Overview & Insights
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "inventory"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Fleet & Market Breakdown
        </button>
        <button
          onClick={() => setActiveTab("sellers")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "sellers"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Sellers & Demand
        </button>
        <button
          onClick={() => setActiveTab("exports")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "exports"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Export Center (CSV)
        </button>
      </div>

      {/* 4. Tab 1: Overview & Insights */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Grid 1: Category Valuation & Top Brands */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Vehicle Category Share</h3>
                  <p className="text-xs text-gray-400">Distribution across body styles & vehicle types</p>
                </div>
                <span className="text-xs font-semibold text-gray-500">{categories.length} categories</span>
              </div>

              <div className="space-y-3.5 pt-2">
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No category data recorded yet.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-400">Rs. {formatLKR(cat.valuation || 0)}</span>
                          <span className="font-bold text-gray-900 font-mono">{cat.count} ({cat.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Brands */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Top Inventory Brands</h3>
                  <p className="text-xs text-gray-400">Most represented automotive manufacturers</p>
                </div>
                <span className="text-xs font-semibold text-gray-500">Top {topBrands.length} makes</span>
              </div>

              <div className="space-y-3.5 pt-2">
                {topBrands.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No brand records found.</p>
                ) : (
                  topBrands.map((b, idx) => (
                    <div key={b.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-[10px] font-mono text-gray-400">#{idx + 1}</span>
                          <span className="font-semibold text-gray-800">{b.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 font-mono">{b.count} units ({b.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(b.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Grid 2: Submission Velocity & Quality Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Submission Trend */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Monthly Submission Velocity</h3>
                <p className="text-xs text-gray-400">Inventory flow over the last 6 months</p>
              </div>

              <div className="space-y-3 pt-2">
                {monthlyTrend.map((m) => {
                  const maxSubmissions = Math.max(...monthlyTrend.map((t) => t.submissions), 1);
                  const barWidth = Math.round((m.submissions / maxSubmissions) * 100);

                  return (
                    <div key={m.month} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">{m.month}</span>
                        <span className="font-bold text-gray-900 font-mono">
                          {m.submissions} submitted ({m.approved} approved)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality & Moderation Reasons */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Moderation Quality Flags</h3>
                  <p className="text-xs text-gray-400">Top reasons listings were rejected</p>
                </div>
                <span className="text-xs font-semibold text-rose-600">
                  {kpis?.rejectedAdsCount ?? 0} total rejected
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {topRejectionReasons.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No rejected listings recorded.</p>
                ) : (
                  topRejectionReasons.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-gray-800 font-medium truncate">{item.reason}</span>
                      <span className="font-bold text-rose-700 font-mono shrink-0">
                        {item.count} flagged
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Fleet & Market Breakdown */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fuel Type Split */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Fuel Type Breakdown</h3>
              <div className="space-y-3">
                {fuelBreakdown.map((f) => (
                  <div key={f.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{f.name}</span>
                      <span className="font-bold text-gray-900 font-mono">{f.count} ({f.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(f.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transmission Split */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Transmission Types</h3>
              <div className="space-y-3">
                {transmissionBreakdown.map((t) => (
                  <div key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{t.name}</span>
                      <span className="font-bold text-gray-900 font-mono">{t.count} ({t.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(t.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Tiers */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Budget Bracket Tiers</h3>
              <div className="space-y-3">
                {priceTiers.map((p) => (
                  <div key={p.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{p.label}</span>
                      <span className="font-bold text-gray-900 font-mono">{p.count} ({p.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${Math.min(p.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* District Hotspots */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Geographic Hotspots (Sri Lankan Districts)</h3>
                <p className="text-xs text-gray-400">Inventory concentration across provinces and territories</p>
              </div>
              <span className="text-xs font-semibold text-gray-500">Top {districtHotspots.length} districts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {districtHotspots.map((d) => (
                <div key={d.name} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{d.name}</span>
                    <span className="text-xs font-mono font-bold text-blue-600">{d.count} ads</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Valuation: Rs. {formatLKR(d.valuation || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Sellers & Buyer Demand */}
      {activeTab === "sellers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Viewed Vehicles */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Most Viewed Vehicles</h3>
                  <p className="text-xs text-gray-400">Top vehicles attracting high buyer engagement</p>
                </div>
                <span className="text-xs font-semibold text-blue-600">Buyer Traffic</span>
              </div>

              <div className="space-y-3 pt-2">
                {mostViewedAds.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No view metrics recorded yet.</p>
                ) : (
                  mostViewedAds.map((ad, idx) => (
                    <div
                      key={ad._id}
                      className="p-3 rounded-xl bg-gray-50/80 border border-gray-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-xs font-mono font-bold text-gray-400">#{idx + 1}</span>
                        {ad.images && ad.images[0] ? (
                          <img
                            src={ad.images[0]}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs shrink-0">
                            🚗
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{ad.title}</p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {ad.refId} • Rs. {ad.priceLKR.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{ad.views} visits</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Sellers Leaderboard */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Top Sellers Leaderboard</h3>
                  <p className="text-xs text-gray-400">Users with highest active marketplace submissions</p>
                </div>
                <Link
                  href="/admin/users"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Manage Users →
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                {topSellers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No seller accounts recorded.</p>
                ) : (
                  topSellers.map((seller, idx) => (
                    <div
                      key={seller.email}
                      className="p-3 rounded-xl bg-gray-50/80 border border-gray-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-xs font-mono font-bold text-gray-400">#{idx + 1}</span>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                          {seller.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{seller.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{seller.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono block">
                          {seller.count} ads
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                          Rs. {formatLKR(seller.totalValue)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Export Center */}
      {activeTab === "exports" && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Executive Data Export Center</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Generate and download structured CSV reports for accounting, auditing, and dealer inventory management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inventory CSV Card */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Vehicle Inventory Catalog</h4>
                  <p className="text-xs text-gray-500">Full vehicle records, pricing, and moderation states</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Includes Brand, Model, Year, VIN/RefID, Asking Price (LKR), Fuel Type, Transmission, District, Mileage, and Seller Contact.
              </p>
              <button
                type="button"
                disabled={Boolean(exporting)}
                onClick={handleExportInventoryCSV}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
              >
                {exporting === "inventory" ? "Generating CSV..." : "Download Inventory Catalog (.csv)"}
              </button>
            </div>

            {/* Sellers CSV Card */}
            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Registered Sellers Directory</h4>
                  <p className="text-xs text-gray-500">Contact roster of all users and active sellers</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Includes Full Name, Verified Email Address, Phone Number, Account Role, Registration Timestamp, and Ad Count.
              </p>
              <button
                type="button"
                disabled={Boolean(exporting)}
                onClick={handleExportSellersCSV}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {exporting === "sellers" ? "Generating CSV..." : "Download Sellers Directory (.csv)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
