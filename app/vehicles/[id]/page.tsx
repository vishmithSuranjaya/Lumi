import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleDetailView from "@/components/VehicleDetailView";
import { VehicleAd } from "@/components/VehicleCatalog";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getVehicleById(id: string): Promise<VehicleAd | null> {
    try {
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        let filter: any;
        if (ObjectId.isValid(id)) {
            filter = {
                $or: [{ _id: new ObjectId(id) }, { refId: id }],
            };
        } else {
            filter = { refId: id };
        }

        const ad = await collection.findOne(filter);
        if (!ad) return null;

        // Asynchronously record an anonymous view count increment
        collection.updateOne({ _id: ad._id }, { $inc: { views: 1 } }).catch(() => {});

        return {
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
        };
    } catch (error) {
        console.error("Error retrieving vehicle details from MongoDB:", error);
        return null;
    }
}

async function getSimilarVehicles(currentId: string, category: string): Promise<VehicleAd[]> {
    try {
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        let excludeFilter: any = {};
        if (ObjectId.isValid(currentId)) {
            excludeFilter = { _id: { $ne: new ObjectId(currentId) } };
        } else {
            excludeFilter = { refId: { $ne: currentId } };
        }

        const rawList = await collection
            .find({
                ...excludeFilter,
                status: { $in: ["approved", "active"] },
                category,
            })
            .sort({ createdAt: -1 })
            .limit(4)
            .toArray();

        return rawList.map((ad: any) => ({
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
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
        return {
            title: "Vehicle Listing Not Found | Lumi Marketplace",
            description: "The requested vehicle advertisement is no longer available or has been sold.",
        };
    }

    return {
        title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} - For Sale in ${vehicle.district} | Lumi`,
        description: `Buy ${vehicle.year} ${vehicle.brand} ${vehicle.model} in ${vehicle.district}, Sri Lanka. Price: LKR ${vehicle.priceLKR.toLocaleString()}. Condition: ${vehicle.condition}. Mileage: ${vehicle.mileage}km. Transmission: ${vehicle.transmission}.`,
        openGraph: {
            title: `${vehicle.year} ${vehicle.brand} ${vehicle.model} | Lumi Automotive`,
            description: `LKR ${vehicle.priceLKR.toLocaleString()} • ${vehicle.district} • ${vehicle.condition}`,
            images: vehicle.images && vehicle.images.length > 0 ? [vehicle.images[0]] : [],
        },
    };
}

export default async function VehicleDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-neutral-900">
                <Navbar />
                <main className="flex-1 flex items-center justify-center py-20 px-4">
                    <div className="max-w-md w-full bg-white border border-neutral-200 p-8 text-center shadow-lg">
                        <div className="w-16 h-16 bg-red-50 text-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-neutral-900">Listing Unavailable</h1>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                            This vehicle advertisement could not be found. It may have been sold, removed by the owner, or the link may be incorrect.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/vehicles"
                                className="px-6 py-3 bg-[#0F52BA] hover:bg-[#0c4399] text-white text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Browse All Vehicles
                            </Link>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const similarVehicles = await getSimilarVehicles(vehicle._id, vehicle.category);

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
            <Navbar />
            <main className="flex-1">
                <VehicleDetailView vehicle={vehicle} similarVehicles={similarVehicles} />
            </main>
            <Footer />
        </div>
    );
}
