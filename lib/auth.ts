import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const AUTH_COOKIE_NAME = ACCESS_TOKEN_COOKIE;

export const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes (in seconds)
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (in seconds)

const JWT_SECRET_STRING =
    process.env.JWT_SECRET || "lumi_default_super_secret_jwt_key_at_least_32_chars";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export interface User {
    _id?: ObjectId;
    name: string;
    email: string;
    passwordHash?: string;
    avatar?: string;
    role: "user" | "admin";
    authProvider: "credentials" | "google";
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSessionPayload {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    avatar?: string;
}

export interface RefreshTokenDocument {
    _id?: ObjectId;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    revokedAt?: Date | null;
}

/**
 * Return list of admin emails configured in environment variables
 */
export function getAdminEmails(): string[] {
    const raw = process.env.ADMIN_EMAILS || "admin@lumi.lk,admin@autovault.com";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Check if a given email is considered an administrator
 */
export function isAdminEmail(email: string): boolean {
    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase().trim());
}

/**
 * Securely hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password against stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Sign a short-lived JWT access token with jose (valid 15 minutes)
 */
export async function signAccessToken(payload: UserSessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(JWT_SECRET);
}

// Backward compatible alias
export const signSessionToken = signAccessToken;

/**
 * Generate a random opaque refresh token and its SHA-256 hash
 */
export function generateRefreshToken() {
    const token = randomBytes(48).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    return { token, hash }; // send token in cookie, store hash in DB
}

/**
 * Hash a plain refresh token string using SHA-256
 */
export function hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Set both Access (15m) and Refresh (7d) HTTP-only cookies on a NextResponse
 */
export function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth", // only sent to auth endpoints
    });
}

/**
 * Clear both Access and Refresh cookies on a NextResponse
 */
export function clearAuthCookies(response: NextResponse) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        maxAge: 0,
    });
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            id: payload.id as string,
            name: payload.name as string,
            email: payload.email as string,
            role: (payload.role as "user" | "admin") || "user",
            avatar: (payload.avatar as string) || undefined,
        };
    } catch {
        return null;
    }
}

/**
 * Retrieve session user from cookies (for Server Components & Route Handlers)
 */
export async function getSessionUser(): Promise<UserSessionPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
        if (!token) return null;
        return await verifySessionToken(token);
    } catch {
        return null;
    }
}
