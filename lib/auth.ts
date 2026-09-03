import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

export const AUTH_COOKIE_NAME = "lumi_auth_token";

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
 * Sign a JWT session token with jose
 */
export async function signSessionToken(payload: UserSessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
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
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        if (!token) return null;
        return await verifySessionToken(token);
    } catch {
        return null;
    }
}
