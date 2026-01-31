import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useSuperAdminAuthStore from "@/store/useSuperAdminAuthStore";
import useUIStore from "@/store/useUIStore";

/**
 * ProtectedAdminRoute - Only accessible to authenticated SuperAdmins.
 * Redirects to the sign-in page (/) if the token is missing.
 */
export const ProtectedAdminRoute = () => {
    const { token } = useSuperAdminAuthStore();
    const { isLoggingOut } = useUIStore();

    if (!token) {
        // If logging out intentionally, do NOT pass state that triggers the toast
        if (isLoggingOut) {
            return <Navigate to="/" replace />;
        }
        // Otherwise pass local state to the login page so it can show a toast
        return <Navigate to="/" replace state={{ fromGuard: true }} />;
    }

    return <Outlet />;
};

/**
 * PublicAdminRoute - For public-facing routes like Sign-In.
 * Redirects to the dashboard if a SuperAdmin is already logged in.
 */
export const PublicAdminRoute = ({ children }) => {
    const { token } = useSuperAdminAuthStore();

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return children ? children : <Outlet />;
};
