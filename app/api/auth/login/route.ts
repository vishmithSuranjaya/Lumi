import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
    comparePassword,
    signSessionToken,
    isAdminEmail,
    AUTH_COOKIE_NAME,
    User,
} from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required." },
                { status: 400 }
            );
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection<User>("users");

        const user = await usersCollection.findOne({ email: normalizedEmail });
        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // If registered exclusively via Google OAuth and has no password hash
        if (!user.passwordHash) {
            return NextResponse.json(
                {
                    error: "This account was registered using Google Sign-In. Please click 'Continue with Google'.",
                },
                { status: 400 }
            );
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid email or password." },
                { status: 401 }
            );
        }

        // Sync admin role if email matches admin list
        let currentRole = user.role;
        if (isAdminEmail(normalizedEmail) && user.role !== "admin") {
            currentRole = "admin";
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { role: "admin", updatedAt: new Date() } }
            );
        }

        const sessionPayload = {
            id: user._id ? user._id.toString() : "",
            name: user.name,
            email: user.email,
            role: currentRole,
            avatar: user.avatar,
        };

        const token = await signSessionToken(sessionPayload);

        const response = NextResponse.json(
            {
                success: true,
                message: "Signed in successfully.",
                user: sessionPayload,
            },
            { status: 200 }
        );

        response.cookies.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Login failed. Please try again." },
            { status: 500 }
        );
    }
}
