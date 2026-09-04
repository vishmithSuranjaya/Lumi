import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
    signSessionToken,
    isAdminEmail,
    AUTH_COOKIE_NAME,
    User,
} from "@/lib/auth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
        return NextResponse.redirect(
            new URL(`/signin?error=${encodeURIComponent(errorParam)}`, request.url)
        );
    }

    if (!code || !stateParam) {
        return NextResponse.redirect(
            new URL("/signin?error=invalid_request", request.url)
        );
    }

    // Decode and verify state
    let targetRedirect = "/";
    try {
        const decodedState = JSON.parse(
            Buffer.from(stateParam, "base64url").toString("utf-8")
        );
        targetRedirect = decodedState.redirect || "/";

        const cookieStore = request.headers.get("cookie") || "";
        const expectedStateMatch = cookieStore.match(/g_oauth_state=([^;]+)/);
        const expectedState = expectedStateMatch ? expectedStateMatch[1] : null;

        if (!expectedState || expectedState !== decodedState.state) {
            console.warn("Google OAuth state mismatch or expired.");
            return NextResponse.redirect(
                new URL("/signin?error=state_mismatch", request.url)
            );
        }
    } catch {
        return NextResponse.redirect(
            new URL("/signin?error=invalid_state", request.url)
        );
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(
            new URL("/signin?error=google_not_configured", request.url)
        );
    }

    try {
        // Exchange code for Google access token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            console.error("Google token exchange error:", errText);
            return NextResponse.redirect(
                new URL("/signin?error=token_exchange_failed", request.url)
            );
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // Fetch User Info from Google
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userRes.ok) {
            return NextResponse.redirect(
                new URL("/signin?error=failed_fetching_profile", request.url)
            );
        }

        const googleUser = await userRes.json();
        const { email, name, picture } = googleUser;

        if (!email) {
            return NextResponse.redirect(
                new URL("/signin?error=email_not_provided_by_google", request.url)
            );
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const client = await clientPromise;
        const db = client.db("myfirstapp");
        const usersCollection = db.collection<User>("users");

        let existingUser = await usersCollection.findOne({ email: normalizedEmail });
        let role: "user" | "admin" = "user";

        if (isAdminEmail(normalizedEmail)) {
            role = "admin";
        } else if (existingUser?.role) {
            role = existingUser.role;
        }

        let userId = "";

        if (existingUser) {
            userId = existingUser._id ? existingUser._id.toString() : "";
            // Update profile with latest name/avatar from Google if needed
            await usersCollection.updateOne(
                { _id: existingUser._id },
                {
                    $set: {
                        name: existingUser.name || name,
                        avatar: picture || existingUser.avatar,
                        role,
                        updatedAt: new Date(),
                    },
                }
            );
        } else {
            const newUser: User = {
                name: name || normalizedEmail.split("@")[0],
                email: normalizedEmail,
                role,
                avatar: picture,
                authProvider: "google",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const insertResult = await usersCollection.insertOne(newUser);
            userId = insertResult.insertedId.toString();
        }

        const sessionPayload = {
            id: userId,
            name: name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            role,
            avatar: picture,
        };

        const sessionToken = await signSessionToken(sessionPayload);

        // Decide where to redirect
        const finalRedirect =
            targetRedirect && targetRedirect !== "/"
                ? targetRedirect
                : role === "admin"
                    ? "/admin"
                    : "/";

        const response = NextResponse.redirect(new URL(finalRedirect, request.url));

        // Set auth session cookie
        response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Clear OAuth state cookie
        response.cookies.set("g_oauth_state", "", {
            httpOnly: true,
            path: "/",
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error("Google OAuth callback error:", error);
        return NextResponse.redirect(
            new URL("/signin?error=oauth_processing_error", request.url)
        );
    }
}
