import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection("users");
        const adsCollection = db.collection("advertisements");

        // 1. Fetch all registered users (excluding sensitive passwordHash)
        const rawUsers = await usersCollection
            .find({}, { projection: { passwordHash: 0 } })
            .sort({ createdAt: -1 })
            .toArray();

        // 2. Fetch all ads to correlate listing counts with users
        const allAds = await adsCollection
            .find({}, { projection: { userId: 1, sellerEmail: 1, status: 1 } })
            .toArray();

        // Build quick lookup maps for ads count per user
        const adsCountByUserId: Record<string, number> = {};
        const activeAdsByUserId: Record<string, number> = {};
        const adsCountByEmail: Record<string, number> = {};
        const activeAdsByEmail: Record<string, number> = {};

        for (const ad of allAds) {
            const adUserId = ad.userId ? String(ad.userId) : null;
            const adEmail = ad.sellerEmail ? String(ad.sellerEmail).toLowerCase().trim() : null;
            const isActive = ad.status === "approved" || ad.status === "active";

            if (adUserId) {
                adsCountByUserId[adUserId] = (adsCountByUserId[adUserId] || 0) + 1;
                if (isActive) {
                    activeAdsByUserId[adUserId] = (activeAdsByUserId[adUserId] || 0) + 1;
                }
            }

            if (adEmail) {
                adsCountByEmail[adEmail] = (adsCountByEmail[adEmail] || 0) + 1;
                if (isActive) {
                    activeAdsByEmail[adEmail] = (activeAdsByEmail[adEmail] || 0) + 1;
                }
            }
        }

        // 3. Serialize user objects with correlated seller stats
        const users = rawUsers.map((u: any) => {
            const userIdStr = u._id.toString();
            const userEmail = (u.email || "").toLowerCase().trim();

            const countFromId = adsCountByUserId[userIdStr] || 0;
            const countFromEmail = userEmail ? (adsCountByEmail[userEmail] || 0) : 0;
            const totalAds = Math.max(countFromId, countFromEmail);

            const activeFromId = activeAdsByUserId[userIdStr] || 0;
            const activeFromEmail = userEmail ? (activeAdsByEmail[userEmail] || 0) : 0;
            const totalActive = Math.max(activeFromId, activeFromEmail);

            return {
                _id: userIdStr,
                name: u.name || "Unnamed User",
                email: u.email || "",
                role: u.role || "user",
                avatar: u.avatar || null,
                phone: u.phone || null,
                authProvider: u.authProvider || "credentials",
                createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : null,
                adsCount: totalAds,
                activeAdsCount: totalActive,
                isSeller: totalAds > 0,
            };
        });

        // 4. Calculate high-level KPIs
        const totalUsers = users.length;
        const totalAdmins = users.filter((u) => u.role === "admin").length;
        const totalSellers = users.filter((u) => u.isSeller).length;
        const googleUsers = users.filter((u) => u.authProvider === "google").length;
        const credentialsUsers = totalUsers - googleUsers;

        return NextResponse.json({
            success: true,
            users,
            stats: {
                totalUsers,
                totalAdmins,
                totalSellers,
                googleUsers,
                credentialsUsers,
                totalListings: allAds.length,
            },
        });
    } catch (error: any) {
        console.error("Error fetching admin users:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to load users collection.",
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

        const { id, role } = body;

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Valid User ID is required" },
                { status: 400 }
            );
        }

        if (role !== "admin" && role !== "user") {
            return NextResponse.json(
                { success: false, message: "Role must be 'admin' or 'user'" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection("users");

        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    role,
                    updatedAt: new Date(),
                },
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `User role updated to '${role}'.`,
        });
    } catch (error: any) {
        console.error("Error updating user role:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update user.",
                error: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
