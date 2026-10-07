"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Page Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Bar */}
        <div
          className={`relative w-full transition-all duration-200 ${searchFocused ? "ring-2 ring-blue-500/50" : ""
            } rounded-xl bg-gray-100 border border-gray-200`}
        >
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search listings, sellers, VINs, or reference IDs..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-10 pr-12 py-2.5 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white rounded border border-gray-300">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Status Pill, Notifications & Quick Actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4">


        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors focus:outline-hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-gray-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="font-semibold text-sm text-gray-900">Notifications</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 transition-colors cursor-pointer border border-blue-100">
                  <p className="text-xs font-semibold text-gray-800">New Ad Pending Review</p>
                  <p className="text-xs text-gray-500 mt-0.5">2024 Mercedes-Benz AMG GT submitted by John D.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">5 minutes ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="text-xs font-semibold text-gray-800">New Buyer Offer Received</p>
                  <p className="text-xs text-gray-500 mt-0.5">Offer of $68,500 on Porsche Taycan 4S.</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">22 minutes ago</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 text-center">
                <Link
                  href="/admin/advertisements"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                >
                  View All Submissions →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button: New Vehicle */}
        <Link
          href="/post_advertisement"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Post Ad</span>
        </Link>
      </div>
    </header>
  );
}
