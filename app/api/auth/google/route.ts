import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const redirectParam = searchParams.get("redirect") || "/";

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
        // Not configured yet
        return NextResponse.redirect(
            new URL("/signin?error=google_not_configured", request.url)
        );
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Generate random state for CSRF protection
    const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const statePayload = JSON.stringify({ state: stateValue, redirect: redirectParam });
    const encodedState = Buffer.from(statePayload).toString("base64url");

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "online");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set("state", encodedState);

    const response = NextResponse.redirect(googleAuthUrl.toString());

    // Save state in cookie to verify upon callback
    response.cookies.set("g_oauth_state", stateValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
    });

    return response;
}
