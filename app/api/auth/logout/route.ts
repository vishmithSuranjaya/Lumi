import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
    REFRESH_TOKEN_COOKIE,
    clearAuthCookies,
    hashRefreshToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const rawRefreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

        if (rawRefreshToken) {
            const tokenHash = hashRefreshToken(rawRefreshToken);
            const client = await clientPromise;
            const db = client.db("myfirstapp");
            // Delete the refresh token record from database to revoke session
            await db.collection("refresh_tokens").deleteOne({ tokenHash });
        }
    } catch (err) {
        console.error("Error during logout refresh token deletion:", err);
    }

    const response = NextResponse.json(
        { success: true, message: "Signed out successfully." },
        { status: 200 }
    );

    // Clear access and refresh token cookies
    clearAuthCookies(response);

    return response;
}
