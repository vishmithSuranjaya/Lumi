import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleCatalog, { VehicleAd } from "@/components/VehicleCatalog";
import clientPromise from "@/lib/mongodb";

// Server-Side Rendering (SSR)
export const dynamic = "force-dynamic";

async function getVehicles(): Promise<VehicleAd[]> {
    try {
        const client = await clientPromise;
        const db = client.db("myfirstapp");

        const rawAds = await db
            .collection("advertisements")
            .find({ status: { $in: ["approved", "active"] } })
            .sort({ createdAt: -1 })
            .toArray();

        // Serialize MongoDB ObjectIds and Dates for client component compatibility
        return rawAds.map((ad: any) => ({
            _id: ad._id.toString(),
            refId: ad.refId || `LUMI-${ad._id.toString().substring(0, 6)}`,
            category: ad.category || "Cars & Sedans",
            brand: ad.brand || "",
            model: ad.model || "",
            year: Number(ad.year) || new Date().getFullYear(),
            condition: ad.condition || "Registered (Used)",
            mileage: ad.mileage || "N/A",
            fuelType: ad.fuelType || "Petrol",
            transmission: ad.transmission || "Automatic",
            engineCapacity: ad.engineCapacity || "",
            priceLKR: Number(ad.priceLKR) || 0,
            isNegotiable: Boolean(ad.isNegotiable),
            district: ad.district || "Colombo",
            city: ad.city || "",
            description: ad.description || "",
            sellerName: ad.sellerName || "Verified Seller",
            sellerPhone: ad.sellerPhone || "",
            sellerEmail: ad.sellerEmail || "",
            hasWhatsApp: Boolean(ad.hasWhatsApp),
            images: Array.isArray(ad.images) ? ad.images : [],
            createdAt: ad.createdAt instanceof Date ? ad.createdAt.toISOString() : new Date().toISOString(),
        }));
    } catch (error) {
        console.error("Error retrieving vehicle advertisements from MongoDB:", error);
        return [];
    }
}

export default async function VehiclesPage({
    searchParams,
}: {
    searchParams?: Promise<{
        category?: string;
        brand?: string;
        model?: string;
        district?: string;
        condition?: string;
        fuelType?: string;
        transmission?: string;
        minPrice?: string;
        maxPrice?: string;
        minYear?: string;
        maxYear?: string;
        q?: string;
        sort?: string;
    }>;
}) {
    const params = searchParams ? await searchParams : {};
    const vehicles = await getVehicles();

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-neutral-900">
            {/* Navigation Bar */}
            <Navbar />

            <main className="flex-1">
                {/* Hero / Header Section */}
                <section className="relative w-full bg-[#0e1014] text-white py-14 sm:py-16 overflow-hidden border-b border-neutral-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Breadcrumbs */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-[0.25em] text-white bg-white/10 backdrop-blur-md border border-white/15 rounded-full">
                            <Link href="/" className="hover:text-[#87CEEB] transition-colors">
                                Home
                            </Link>
                            <span className="text-neutral-500">/</span>
                            <span className="text-[#87CEEB]">Vehicle Inventory</span>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                                    Exclusive Vehicle Collection
                                </h1>
                                <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl">
                                    Verified automobiles, commercial vehicles, and equipment available for immediate purchase across Sri Lanka.
                                </p>
                            </div>

                            <Link
                                href="/post_advertisement"
                                className="px-6 py-3.5 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap self-start md:self-auto shadow-md"
                            >
                                + Post an Advertisement
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Catalog Section with Interactive Client Component */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <VehicleCatalog
                        initialVehicles={vehicles}
                        initialCategory={params?.category}
                        initialParams={params}
                    />

                    {/* Assistance Banner */}
                    <div className="mt-16 bg-[#121418] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-[#C8102E]">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8102E] block mb-1">
                                Custom Vehicle Sourcing
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black">
                                Looking for a Specific Make, Model, or Machinery?
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
                                Our VIP concierge team directly sources vehicles and equipment across Sri Lanka and imports with full inspection guarantees.
                            </p>
                        </div>
                        <Link
                            href="/contact_us"
                            className="px-8 py-4 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all whitespace-nowrap shadow-lg active:scale-95 cursor-pointer"
                        >
                            Contact Sourcing Team
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
