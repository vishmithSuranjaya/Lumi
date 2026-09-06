import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Authentication required." },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        const userEmail = session.email?.toLowerCase();
        const userId = session.id;

        const orConditions: Record<string, any>[] = [];
        if (userId) {
            orConditions.push({ userId: userId });
        }
        if (userEmail) {
            const emailRegex = new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            orConditions.push({ sellerEmail: emailRegex });
        }

        if (orConditions.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                advertisements: [],
            });
        }

        const ads = await collection
            .find({ $or: orConditions })
            .sort({ createdAt: -1 })
            .toArray();

        const serialized = ads.map((ad: any) => ({
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
            isNegotiable: Boolean(ad.isNegotiable),
            district: ad.district || "Colombo",
            city: ad.city || "",
            sellerName: ad.sellerName || "",
            sellerPhone: ad.sellerPhone || "",
            sellerEmail: ad.sellerEmail || "",
            images: Array.isArray(ad.images) ? ad.images : [],
            status: ad.status || "pending",
            reviewedAt: ad.reviewedAt ? new Date(ad.reviewedAt).toISOString() : null,
            reviewedBy: ad.reviewedBy || null,
            rejectionReason: ad.rejectionReason || null,
            adminNotes: ad.adminNotes || null,
            views: Number(ad.views) || 0,
            createdAt: ad.createdAt ? new Date(ad.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: ad.updatedAt ? new Date(ad.updatedAt).toISOString() : null,
        }));

        return NextResponse.json({
            success: true,
            count: serialized.length,
            advertisements: serialized,
        });
    } catch (error: any) {
        console.error("Error fetching user advertisements:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Authentication required." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        let adId = searchParams.get("id");

        if (!adId) {
            try {
                const body = await request.json();
                adId = body?.id;
            } catch {
                // Ignore body parse errors if not supplied
            }
        }

        if (!adId || !ObjectId.isValid(adId)) {
            return NextResponse.json(
                { success: false, message: "Valid advertisement ID is required." },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const collection = db.collection("advertisements");

        const targetAd = await collection.findOne({ _id: new ObjectId(adId) });
        if (!targetAd) {
            return NextResponse.json(
                { success: false, message: "Advertisement not found." },
                { status: 404 }
            );
        }

        // Verify ownership (either userId matches or sellerEmail matches)
        const isOwner =
            (targetAd.userId && targetAd.userId === session.id) ||
            (targetAd.sellerEmail && targetAd.sellerEmail.toLowerCase() === session.email.toLowerCase()) ||
            session.role === "admin";

        if (!isOwner) {
            return NextResponse.json(
                { success: false, message: "You do not have permission to delete this advertisement." },
                { status: 403 }
            );
        }

        await collection.deleteOne({ _id: new ObjectId(adId) });

        return NextResponse.json({
            success: true,
            message: "Advertisement removed successfully.",
        });
    } catch (error: any) {
        console.error("Error deleting user advertisement:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
