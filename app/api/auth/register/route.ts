import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
    hashPassword,
    signSessionToken,
    isAdminEmail,
    AUTH_COOKIE_NAME,
    User,
} from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password, phone } = body;

        // Validation
        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return NextResponse.json(
                { error: "Full name must be at least 2 characters long." },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long." },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection<User>("users");

        // Ensure unique index on email
        await usersCollection.createIndex({ email: 1 }, { unique: true }).catch(() => {
            // Index might already exist
        });

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: normalizedEmail });
        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email address already exists." },
                { status: 409 }
            );
        }

        // Determine role (admin if matching configured admin emails)
        const role = isAdminEmail(normalizedEmail) ? "admin" : "user";
        const passwordHash = await hashPassword(password);

        const newUser: User = {
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role,
            authProvider: "credentials",
            phone: phone ? String(phone).trim() : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);
        const userId = result.insertedId.toString();

        const sessionPayload = {
            id: userId,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
        };

        const token = await signSessionToken(sessionPayload);

        const response = NextResponse.json(
            {
                success: true,
                message: "Account created successfully.",
                user: sessionPayload,
            },
            { status: 201 }
        );

        // Set secure HTTP-only cookie
        response.cookies.set(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed. Please try again later." },
            { status: 500 }
        );
    }
}


