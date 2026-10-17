import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
    getSessionUser,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_MAX_AGE,
    RefreshTokenDocument,
    UserSessionPayload,
    clearAuthCookies,
    generateRefreshToken,
    hashRefreshToken,
    setAuthCookies,
    signAccessToken,
} from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSessionUser();
        const client = await clientPromise;
        const db = client.db("myfirstapp");

        // 1. If access token is still valid, return user
        if (session) {
            let dbUser = null;
            if (session.id && ObjectId.isValid(session.id)) {
                dbUser = await db.collection("users").findOne({ _id: new ObjectId(session.id) });
            } else if (session.email) {
                dbUser = await db.collection("users").findOne({ email: session.email.toLowerCase() });
            }

            if (!dbUser) {
                return NextResponse.json({ user: session }, { status: 200 });
            }

            return NextResponse.json({
                user: {
                    id: dbUser._id.toString(),
                    name: dbUser.name,
                    email: dbUser.email,
                    role: dbUser.role || "user",
                    avatar: dbUser.avatar,
                    phone: dbUser.phone,
                    authProvider: dbUser.authProvider || "credentials",
                    createdAt: dbUser.createdAt,
                },
            });
        }

        // 2. Access token is expired/missing - attempt silent refresh using refresh_token cookie
        const cookieStore = await cookies();
        const rawRefreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

        if (!rawRefreshToken) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const tokenHash = hashRefreshToken(rawRefreshToken);
        const refreshTokensCollection = db.collection<RefreshTokenDocument>("refresh_tokens");
        const tokenDoc = await refreshTokensCollection.findOne({ tokenHash });

        if (!tokenDoc) {
            const res = NextResponse.json({ user: null }, { status: 200 });
            clearAuthCookies(res);
            return res;
        }

        // Reuse detection
        if (tokenDoc.revokedAt) {
            await refreshTokensCollection.updateMany(
                { userId: tokenDoc.userId },
                { $set: { revokedAt: new Date() } }
            );
            const res = NextResponse.json({ user: null }, { status: 200 });
            clearAuthCookies(res);
            return res;
        }

        // Expiry check
        if (new Date(tokenDoc.expiresAt) < new Date()) {
            await refreshTokensCollection.updateOne(
                { _id: tokenDoc._id },
                { $set: { revokedAt: new Date() } }
            );
            const res = NextResponse.json({ user: null }, { status: 200 });
            clearAuthCookies(res);
            return res;
        }

        // Rotate token
        await refreshTokensCollection.updateOne(
            { _id: tokenDoc._id },
            { $set: { revokedAt: new Date() } }
        );

        const user = await db.collection("users").findOne({ _id: new ObjectId(tokenDoc.userId) });
        if (!user) {
            const res = NextResponse.json({ user: null }, { status: 200 });
            clearAuthCookies(res);
            return res;
        }

        const sessionPayload: UserSessionPayload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
            avatar: user.avatar,
        };

        const newAccessToken = await signAccessToken(sessionPayload);
        const newRefresh = generateRefreshToken();

        await refreshTokensCollection.insertOne({
            userId: user._id.toString(),
            tokenHash: newRefresh.hash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
            createdAt: new Date(),
            revokedAt: null,
        });

        const response = NextResponse.json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || "user",
                avatar: user.avatar,
                phone: user.phone,
                authProvider: user.authProvider || "credentials",
                createdAt: user.createdAt,
            },
        });

        setAuthCookies(response, newAccessToken, newRefresh.token);
        return response;
    } catch (error) {
        console.error("Fetch me session error:", error);
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
