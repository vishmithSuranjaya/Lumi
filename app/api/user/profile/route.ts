import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { deleteImageByUrl } from "@/lib/imagekit";

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Authentication required." },
                { status: 401 }
            );
        }

        if (session.role === "admin") {
            return NextResponse.json(
                { success: false, message: "Admin accounts do not have a user profile." },
                { status: 403 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");

        let dbUser = null;
        if (session.id && ObjectId.isValid(session.id)) {
            dbUser = await db.collection("users").findOne({ _id: new ObjectId(session.id) });
        } else if (session.email) {
            dbUser = await db.collection("users").findOne({ email: session.email.toLowerCase() });
        }

        if (!dbUser) {
            return NextResponse.json(
                { success: false, message: "User account not found." },
                { status: 404 }
            );
        }

        // Fetch advertisement statistics for this user
        const adsCollection = db.collection("advertisements");
        const userEmail = dbUser.email?.toLowerCase();
        const userIdStr = dbUser._id.toString();

        const emailRegex = userEmail
            ? new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
            : null;

        const orFilters: Record<string, any>[] = [{ userId: userIdStr }];
        if (emailRegex) {
            orFilters.push({ sellerEmail: emailRegex });
        }

        const userAds = await adsCollection
            .find({
                $or: orFilters,
            })
            .toArray();

        const stats = {
            total: userAds.length,
            pending: userAds.filter((ad) => ad.status === "pending").length,
            approved: userAds.filter((ad) => ad.status === "approved" || ad.status === "active").length,
            rejected: userAds.filter((ad) => ad.status === "rejected").length,
            totalViews: userAds.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0),
        };

        return NextResponse.json({
            success: true,
            user: {
                id: dbUser._id.toString(),
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role || "user",
                avatar: dbUser.avatar || null,
                phone: dbUser.phone || null,
                authProvider: dbUser.authProvider || "credentials",
                createdAt: dbUser.createdAt || null,
                updatedAt: dbUser.updatedAt || null,
            },
            stats,
        });
    } catch (error: any) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Authentication required." },
                { status: 401 }
            );
        }

        if (session.role === "admin") {
            return NextResponse.json(
                { success: false, message: "Admin accounts do not have a user profile." },
                { status: 403 }
            );
        }

        let body: any;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON payload." },
                { status: 400 }
            );
        }

        const { name, phone, avatar } = body;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json(
                { success: false, message: "Name must be at least 2 characters long." },
                { status: 400 }
            );
        }

        if (name.trim().length > 60) {
            return NextResponse.json(
                { success: false, message: "Name cannot exceed 60 characters." },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection("users");

        const updateFields: Record<string, any> = {
            name: name.trim(),
            updatedAt: new Date(),
        };

        if (phone !== undefined) {
            updateFields.phone = phone ? String(phone).trim() : null;
        }

        if (avatar !== undefined) {
            updateFields.avatar = avatar ? String(avatar).trim() : null;
        }

        let userFilter: Record<string, any>;
        if (session.id && ObjectId.isValid(session.id)) {
            userFilter = { _id: new ObjectId(session.id) };
        } else {
            userFilter = { email: session.email.toLowerCase() };
        }

        const existingUser = await usersCollection.findOne(userFilter);
        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "User account not found." },
                { status: 404 }
            );
        }

        // If avatar is being changed or removed, delete the old avatar from ImageKit
        if (
            updateFields.avatar !== undefined &&
            existingUser.avatar &&
            existingUser.avatar !== updateFields.avatar
        ) {
            try {
                await deleteImageByUrl(existingUser.avatar);
            } catch (delErr) {
                console.error("Error deleting old profile avatar:", delErr);
            }
        }

        await usersCollection.updateOne(userFilter, {
            $set: updateFields,
        });

        const updatedUser = await usersCollection.findOne(userFilter);

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: updatedUser?._id.toString(),
                name: updatedUser?.name,
                email: updatedUser?.email,
                role: updatedUser?.role || "user",
                avatar: updatedUser?.avatar || null,
                phone: updatedUser?.phone || null,
                authProvider: updatedUser?.authProvider || "credentials",
                createdAt: updatedUser?.createdAt || null,
            },
        });
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
