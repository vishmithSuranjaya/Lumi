import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { sendAdApprovedEmail, sendAdRejectedEmail } from "@/lib/email";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "all";

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        // Build filter
        let filter: Record<string, any> = {};
        if (status === "pending") {
            filter = { status: "pending" };
        } else if (status === "approved") {
            filter = { status: { $in: ["approved", "active"] } };
        } else if (status === "rejected") {
            filter = { status: "rejected" };
        }

        const rawAds = await collection
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        // Calculate system statistics across all ads
        const allAds = await collection.find({}).toArray();
        const pendingCount = allAds.filter((a) => a.status === "pending").length;
        const approvedCount = allAds.filter((a) => a.status === "approved" || a.status === "active").length;
        const rejectedCount = allAds.filter((a) => a.status === "rejected").length;
        const totalValuationLKR = allAds
            .filter((a) => a.status === "approved" || a.status === "active")
            .reduce((acc, curr) => acc + (Number(curr.priceLKR) || 0), 0);

        const serializedAds = rawAds.map((ad: any) => ({
            _id: ad._id.toString(),
            refId: ad.refId || `LUMI-${ad._id.toString().substring(0, 6)}`,
            category: ad.category || "Cars & Sedans",
            brand: ad.brand || "",
            model: ad.model || "",
            year: Number(ad.year) || new Date().getFullYear(),
            condition: ad.condition || "Registered (Used)",
            mileage: ad.mileage || "0",
            fuelType: ad.fuelType || "Petrol",
            transmission: ad.transmission || "Automatic",
            priceLKR: Number(ad.priceLKR) || 0,
            district: ad.district || "Colombo",
            city: ad.city || "",
            sellerName: ad.sellerName || "Verified Seller",
            sellerPhone: ad.sellerPhone || "",
            sellerEmail: ad.sellerEmail || "",
            images: Array.isArray(ad.images) ? ad.images : [],
            status: ad.status || "pending",
            reviewedAt: ad.reviewedAt ? new Date(ad.reviewedAt).toISOString() : null,
            reviewedBy: ad.reviewedBy || null,
            rejectionReason: ad.rejectionReason || null,
            createdAt: ad.createdAt instanceof Date ? ad.createdAt.toISOString() : new Date().toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data: serializedAds,
            stats: {
                total: allAds.length,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                totalValuationLKR,
            },
        });
    } catch (error: any) {
        console.error("Error retrieving admin advertisements:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve advertisements for admin dashboard.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON payload" },
                { status: 400 }
            );
        }

        const { id, status, rejectionReason, adminNotes } = body;

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { success: false, message: "Advertisement ID is required" },
                { status: 400 }
            );
        }

        const validStatuses = ["approved", "rejected", "pending", "sold", "archived"];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: "Status must be 'approved', 'rejected', 'pending', 'sold', or 'archived'" },
                { status: 400 }
            );
        }

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid MongoDB ObjectId" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        const updateFields: Record<string, any> = {
            status,
            reviewedAt: new Date(),
            reviewedBy: "LUMI Staff Admin",
            updatedAt: new Date(),
        };

        if (status === "rejected") {
            updateFields.rejectionReason = rejectionReason?.trim() || "Does not meet listing standards";
        } else if (status === "approved") {
            updateFields.rejectionReason = null;
        }

        if (typeof adminNotes === "string") {
            updateFields.adminNotes = adminNotes.trim();
        }

        const existingAd = await collection.findOne({ _id: new ObjectId(id) });

        if (!existingAd) {
            return NextResponse.json(
                { success: false, message: "Advertisement not found" },
                { status: 404 }
            );
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        // Send automated email notifications asynchronously
        if (status === "approved" && existingAd.sellerEmail) {
            const vehicleTitle = `${existingAd.brand || ""} ${existingAd.model || ""} (${existingAd.year || ""})`.trim();
            const refId = existingAd.refId || `LUMI-${id.substring(0, 6).toUpperCase()}`;

            sendAdApprovedEmail({
                sellerName: existingAd.sellerName || "Valued Seller",
                sellerEmail: existingAd.sellerEmail,
                vehicleTitle: vehicleTitle || "Vehicle Listing",
                refId,
                priceLKR: Number(existingAd.priceLKR) || 0,
            }).catch((err) => {
                console.error("Async approval email error:", err);
            });
        } else if (status === "rejected" && existingAd.sellerEmail) {
            const vehicleTitle = `${existingAd.brand || ""} ${existingAd.model || ""} (${existingAd.year || ""})`.trim();
            const refId = existingAd.refId || `LUMI-${id.substring(0, 6).toUpperCase()}`;

            sendAdRejectedEmail({
                sellerName: existingAd.sellerName || "Valued Seller",
                sellerEmail: existingAd.sellerEmail,
                vehicleTitle: vehicleTitle || "Vehicle Listing",
                refId,
                rejectionReason: updateFields.rejectionReason,
            }).catch((err) => {
                console.error("Async rejection email error:", err);
            });
        }

        return NextResponse.json({
            success: true,
            message: `Advertisement status successfully changed to '${status}'.`,
        });
    } catch (error: any) {
        console.error("Error updating advertisement status:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update advertisement status.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Valid advertisement ID is required" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const result = await db.collection("advertisements").deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { success: false, message: "Advertisement not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Advertisement deleted permanently.",
        });
    } catch (error: any) {
        console.error("Error deleting advertisement:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete advertisement.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
