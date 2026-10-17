import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
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

export async function POST(request: NextRequest) {
    try {
        const rawRefreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

        if (!rawRefreshToken) {
            const response = NextResponse.json(
                { success: false, error: "No refresh token provided." },
                { status: 401 }
            );
            clearAuthCookies(response);
            return response;
        }

        const tokenHash = hashRefreshToken(rawRefreshToken);

        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const refreshTokensCollection = db.collection<RefreshTokenDocument>("refresh_tokens");

        const tokenDoc = await refreshTokensCollection.findOne({ tokenHash });

        if (!tokenDoc) {
            const response = NextResponse.json(
                { success: false, error: "Invalid refresh token." },
                { status: 401 }
            );
            clearAuthCookies(response);
            return response;
        }

        // Reuse detection: If a refresh token that was already revoked/rotated is used again,
        // treat it as theft and revoke all sessions for that user.
        if (tokenDoc.revokedAt) {
            console.warn(
                `[Security Warning] Refresh token reuse detected for userId: ${tokenDoc.userId}. Revoking all sessions.`
            );
            await refreshTokensCollection.updateMany(
                { userId: tokenDoc.userId },
                { $set: { revokedAt: new Date() } }
            );
            const response = NextResponse.json(
                { success: false, error: "Refresh token reuse detected. All sessions revoked." },
                { status: 401 }
            );
            clearAuthCookies(response);
            return response;
        }

        // Check if token has expired
        if (new Date(tokenDoc.expiresAt) < new Date()) {
            await refreshTokensCollection.updateOne(
                { _id: tokenDoc._id },
                { $set: { revokedAt: new Date() } }
            );
            const response = NextResponse.json(
                { success: false, error: "Refresh token has expired. Please sign in again." },
                { status: 401 }
            );
            clearAuthCookies(response);
            return response;
        }

        // Rotate the refresh token: mark the old token as revoked
        await refreshTokensCollection.updateOne(
            { _id: tokenDoc._id },
            { $set: { revokedAt: new Date() } }
        );

        // Verify that the user still exists in DB
        let userObjectId: ObjectId;
        try {
            userObjectId = new ObjectId(tokenDoc.userId);
        } catch {
            const response = NextResponse.json(
                { success: false, error: "Invalid user identifier in token." },
                { status: 401 }
            );
            clearAuthCookies(response);
            return response;
        }

        const user = await db.collection("users").findOne({ _id: userObjectId });
        if (!user) {
            const response = NextResponse.json(
                { success: false, error: "User account no longer exists." },
                { status: 401 }
            );
            clearAuthCookies(response);
            return response;
        }

        // Issue new 15-minute access token
        const sessionPayload: UserSessionPayload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
            avatar: user.avatar,
        };
        const newAccessToken = await signAccessToken(sessionPayload);

        // Issue new rotated refresh token (7 days) and save in DB
        const newRefresh = generateRefreshToken();
        await refreshTokensCollection.insertOne({
            userId: user._id.toString(),
            tokenHash: newRefresh.hash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
            createdAt: new Date(),
            revokedAt: null,
        });

        const response = NextResponse.json(
            {
                success: true,
                message: "Tokens refreshed successfully.",
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
            },
            { status: 200 }
        );

        setAuthCookies(response, newAccessToken, newRefresh.token);
        return response;
    } catch (error) {
        console.error("Token refresh error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error during token refresh." },
            { status: 500 }
        );
    }
}
