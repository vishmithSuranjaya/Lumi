import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
    hashPassword,
    signAccessToken,
    generateRefreshToken,
    setAuthCookies,
    REFRESH_TOKEN_MAX_AGE,
    RefreshTokenDocument,
    isAdminEmail,
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

        // 1. Issue 15m access token
        const accessToken = await signAccessToken(sessionPayload);

        // 2. Generate opaque refresh token and store hash in DB
        const refresh = generateRefreshToken();
        const refreshTokensCollection = db.collection<RefreshTokenDocument>("refresh_tokens");
        await refreshTokensCollection.insertOne({
            userId,
            tokenHash: refresh.hash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
            createdAt: new Date(),
            revokedAt: null,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Account created successfully.",
                user: sessionPayload,
            },
            { status: 201 }
        );

        // 3. Set cookies
        setAuthCookies(response, accessToken, refresh.token);

        return response;
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Registration failed. Please try again later." },
            { status: 500 }
        );
    }
}
