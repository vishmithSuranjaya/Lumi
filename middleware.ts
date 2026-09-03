import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "lumi_auth_token";
const JWT_SECRET_STRING =
    process.env.JWT_SECRET || "lumi_default_super_secret_jwt_key_at_least_32_chars";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    let session: { id?: string; role?: string; email?: string } | null = null;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            session = payload as { id?: string; role?: string; email?: string };
        } catch {
            session = null;
        }
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isAuthPage = pathname === "/signin" || pathname === "/signup";

    // Protect Admin routes
    if (isAdminRoute) {
        if (!session) {
            const redirectUrl = new URL("/signin", request.url);
            redirectUrl.searchParams.set("redirect", pathname);
            redirectUrl.searchParams.set("error", "auth_required");
            return NextResponse.redirect(redirectUrl);
        }

        if (session.role !== "admin") {
            // Logged in, but not an admin
            const forbiddenUrl = new URL("/", request.url);
            forbiddenUrl.searchParams.set("error", "unauthorized_admin");
            return NextResponse.redirect(forbiddenUrl);
        }
    }

    // Redirect already authenticated users away from signin/signup
    if (isAuthPage && session) {
        const redirectParam = request.nextUrl.searchParams.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
            return NextResponse.redirect(new URL(redirectParam, request.url));
        }
        if (session.role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/signin", "/signup"],
};
