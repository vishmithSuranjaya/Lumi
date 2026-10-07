"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import UserDetailModal, { AdminUser } from "@/components/admin/UserDetailModal";

interface UsersStats {
  totalUsers: number;
  totalAdmins: number;
  totalSellers: number;
  googleUsers: number;
  credentialsUsers: number;
  totalListings: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UsersStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalSellers: 0,
    googleUsers: 0,
    credentialsUsers: 0,
    totalListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "sellers" | "admins" | "regular">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "ads" | "name">("newest");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.users)) {
        setUsers(json.users);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle role change (promote/demote)
  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        setSelectedUser((prev) =>
          prev && prev._id === userId ? { ...prev, role: newRole } : prev
        );
        triggerToast(`User role successfully updated to ${newRole.toUpperCase()}.`);
        // Refresh stats
        fetchUsers();
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (err) {
      console.error("Role update error:", err);
      alert("Network error updating user role.");
    }
  };

  // Filter & Sort
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = u.name.toLowerCase().includes(q);
          const matchEmail = u.email.toLowerCase().includes(q);
          const matchPhone = u.phone ? u.phone.includes(q) : false;
          const matchId = u._id.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchId) {
            return false;
          }
        }

        // Category / Role filter
        if (roleFilter === "sellers") return u.isSeller;
        if (roleFilter === "admins") return u.role === "admin";
        if (roleFilter === "regular") return u.role === "user" && !u.isSeller;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "ads") {
          return b.adsCount - a.adsCount;
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [users, searchQuery, roleFilter, sortBy]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-xl border border-gray-700 flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Users & Sellers Directory
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {stats.totalUsers} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Browse registered user accounts, marketplace sellers, and administrator privileges.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-500" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Users */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Users</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Registered
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Total registered accounts in MongoDB</p>
        </div>

        {/* Card 2: Active Sellers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Active Sellers</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{stats.totalSellers}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {stats.totalListings} Listings
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Users with at least 1 vehicle advertisement</p>
        </div>

        {/* Card 3: Administrators */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl group-hover:bg-purple-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">System Admins</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{stats.totalAdmins}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              Full Access
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Can review ads and manage inventory</p>
        </div>

        {/* Card 4: Google Auth Accounts */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden group hover:border-gray-300 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Google OAuth</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-sm">
              G
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{stats.googleUsers}</span>
            <span className="text-xs font-semibold text-gray-500">
              {stats.credentialsUsers} standard
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Verified with Google single sign-on</p>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented Filter Pills */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                roleFilter === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("sellers")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                roleFilter === "sellers" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sellers ({stats.totalSellers})
            </button>
            <button
              onClick={() => setRoleFilter("admins")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                roleFilter === "admins" ? "bg-white text-purple-700 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Admins ({stats.totalAdmins})
            </button>
            <button
              onClick={() => setRoleFilter("regular")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                roleFilter === "regular" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Regular
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="ads">Most Ads Posted</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Fixed height scrollable table container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[580px] h-[580px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-xs border-b border-gray-200 shadow-2xs">
              <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">User Profile</th>
                <th className="py-3.5 px-4 sm:px-6">Email & Auth</th>
                <th className="py-3.5 px-4 sm:px-6">Phone</th>
                <th className="py-3.5 px-4 sm:px-6">Role</th>
                <th className="py-3.5 px-4 sm:px-6">Listings</th>
                <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-gray-200 rounded" />
                          <div className="w-20 h-2.5 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-36 h-3 bg-gray-200 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-24 h-3 bg-gray-200 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-16 h-5 bg-gray-200 rounded-full" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-12 h-5 bg-gray-200 rounded-full" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="w-20 h-3 bg-gray-200 rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="w-16 h-7 bg-gray-200 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-800">No users found</p>
                      <p className="text-xs text-gray-400">
                        {searchQuery
                          ? `No user match for "${searchQuery}". Try a different keyword.`
                          : "There are currently no users in this filter category."}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    {/* User Profile */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3 min-w-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {u.name}
                          </p>
                          <p className="text-[11px] font-mono text-gray-400 truncate">
                            ID: {u._id.substring(0, 10)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Auth Provider */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-900 truncate" title={u.email}>
                          {u.email}
                        </p>
                        {u.authProvider === "google" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Google OAuth
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                            Credentials
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 sm:px-6">
                      {u.phone ? (
                        <span className="text-xs font-mono font-medium text-gray-800">
                          {u.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 sm:px-6">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          User
                        </span>
                      )}
                    </td>

                    {/* Listings / Seller */}
                    <td className="py-3.5 px-4 sm:px-6">
                      {u.isSeller ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>{u.adsCount} ad{u.adsCount === 1 ? "" : "s"}</span>
                          {u.activeAdsCount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              ({u.activeAdsCount} live)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">0 listings</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-gray-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with counter */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50/80 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>
            Showing <strong className="text-gray-900 font-semibold">{filteredUsers.length}</strong> of <strong className="text-gray-900 font-semibold">{users.length}</strong> accounts
          </span>
          <span className="text-[11px] text-gray-400">
            Scroll down to explore all users
          </span>
        </div>
      </div>

      {/* 5. User Details Modal */}
      <UserDetailModal
        isOpen={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onRoleChange={handleRoleChange}
      />
    </div>
  );
}
