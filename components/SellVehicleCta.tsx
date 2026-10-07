"use client";

import React from "react";
import Link from "next/link";

const sellerBenefits = [
  {
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Post in Under 2 Minutes",
    desc: "Simple step-by-step form with high-resolution photo uploads and instant specs.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "100% Free Listing",
    desc: "Zero hidden fees and no middlemen commissions. Keep every rupee of your sale.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Direct Buyer Inquiries",
    desc: "Receive instant phone calls and WhatsApp messages straight from interested buyers.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Smart Market Valuation",
    desc: "Use our price predictor to benchmark current market value and sell even faster.",
  },
];

const stats = [
  { value: "50,000+", label: "Active Monthly Buyers" },
  { value: "7 Days", label: "Average Time to Sell" },
  { value: "0%", label: "Sales Commission" },
];

export default function SellVehicleCta() {
  return (
    <section
      aria-labelledby="sell-vehicle-heading"
      className="relative overflow-hidden bg-[#0c1424] px-6 pb-44 pt-36 text-white md:pb-60 md:pt-48
      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#172544] via-[#0c1424] to-[#080d17]"
    >
      {/* Top Wavy White Cut-out (Blends into section above) */}
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute left-0 top-0 block h-[100px] w-full md:h-[150px] pointer-events-none"
      >
        <path
          fill="#ffffff"
          d="M0 0H1440V20C1340 90 1200 150 1060 110C920 70 800 20 640 60C480 100 360 150 220 110C120 82 50 60 0 70Z"
        />
      </svg>

      {/* Background glow orbs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-red-400 mb-4 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Sell Faster • Zero Commission
          </div>
          <h2
            id="sell-vehicle-heading"
            className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-white"
          >
            Looking to Sell Your Vehicle?
          </h2>
          <span className="mx-auto mt-4 block h-1 w-20 bg-gradient-to-r from-red-600 to-amber-500 rounded-full" />
          <p className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed">
            Reach serious buyers across Sri Lanka. Post your advertisement for free in minutes
            and get contacted directly with no hidden commissions.
          </p>
        </div>

        {/* 2-Column Grid: Benefits + Action Spotlight Card */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          {/* Left Column: 4 Feature Highlights */}
          <div className="grid sm:grid-cols-2 gap-4">
            {sellerBenefits.map((item) => (
              <div
                key={item.title}
                className="group relative rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:bg-white/[0.08] hover:-translate-y-1 shadow-lg"
              >
                <div className="mb-3.5 inline-flex p-2.5 rounded-lg bg-neutral-900/80 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 leading-normal">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: CTA Glass Card */}
          <div className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-neutral-900/80 p-8 sm:p-10 text-center backdrop-blur-xl shadow-2xl">
            {/* Top decorative icon */}
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>

            <h3 className="text-2xl font-black text-white">Post Your Ad Today</h3>
            <p className="mt-2 text-sm text-neutral-300">
              Join thousands of private sellers and certified dealers closing deals faster.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3.5">
              <Link
                href="/post_advertisement"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/40 transition-all hover:bg-red-700 hover:shadow-red-600/60 active:scale-95"
              >
                <span>Post Free Advertisement</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <Link
                href="/price-predictor"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs sm:text-sm font-semibold text-neutral-200 transition-all hover:bg-white/10 hover:text-white"
              >
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Check Vehicle Valuation</span>
              </Link>
            </div>

            {/* Live Stats Row */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-base sm:text-lg font-black text-white">{s.value}</div>
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 font-medium leading-tight mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wavy Cut-out (Blends into #0a0a0a dark Footer) */}
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute bottom-0 left-0 block h-[110px] w-full md:h-[180px] pointer-events-none"
      >
        <path
          fill="#ffffff"
          d="M0 220V120C140 20 300 20 460 90C620 160 760 190 940 120C1100 55 1240 0 1440 40V220Z"
        />
      </svg>
    </section>
  );
}
