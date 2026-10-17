"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    avatar?: string;
    phone?: string;
    authProvider?: "credentials" | "google";
    createdAt?: string | Date;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (userData: AuthUser) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthModalOpen: boolean;
    authModalMode: "signin" | "signup";
    openAuthModal: (mode?: "signin" | "signup") => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => {},
    logout: async () => {},
    refreshUser: async () => {},
    isAuthModalOpen: false,
    authModalMode: "signin",
    openAuthModal: () => {},
    closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
    const router = useRouter();

    const openAuthModal = useCallback((mode: "signin" | "signup" = "signin") => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (data.user) {
                    setUser(data.user);
                    return;
                }
            }

            // Fallback: try explicit /api/auth/refresh
            const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                setUser(refreshData.user || null);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Keep access token alive while user is active on the page (refresh every 10 minutes)
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/auth/refresh", { method: "POST" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                    }
                }
            } catch (err) {
                console.error("Silent token refresh error:", err);
            }
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(interval);
    }, [user]);

    // When tab becomes visible again after being backgrounded, verify/refresh session
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && user) {
                refreshUser();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [user, refreshUser]);

    const login = useCallback((userData: AuthUser) => {
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (err) {
            console.error("Logout request failed:", err);
        } finally {
            setUser(null);
            window.location.href = "/";
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                refreshUser,
                isAuthModalOpen,
                authModalMode,
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}
            <AuthModal />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
