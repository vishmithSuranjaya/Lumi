import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSessionUser, comparePassword, hashPassword } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function PUT(request: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json(
                { success: false, message: "Authentication required." },
                { status: 401 }
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

        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || typeof currentPassword !== "string") {
            return NextResponse.json(
                { success: false, message: "Current password is required." },
                { status: 400 }
            );
        }

        if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
            return NextResponse.json(
                { success: false, message: "New password must be at least 6 characters long." },
                { status: 400 }
            );
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, message: "New password and confirmation do not match." },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection("users");

        let userFilter: Record<string, any>;
        if (session.id && ObjectId.isValid(session.id)) {
            userFilter = { _id: new ObjectId(session.id) };
        } else {
            userFilter = { email: session.email.toLowerCase() };
        }

        const user = await usersCollection.findOne(userFilter);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User account not found." },
                { status: 404 }
            );
        }

        if (!user.passwordHash) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This account was registered using Google OAuth and does not use a password.",
                },
                { status: 400 }
            );
        }

        const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            return NextResponse.json(
                { success: false, message: "The current password you entered is incorrect." },
                { status: 400 }
            );
        }

        const newHash = await hashPassword(newPassword);
        await usersCollection.updateOne(userFilter, {
            $set: {
                passwordHash: newHash,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error: any) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
