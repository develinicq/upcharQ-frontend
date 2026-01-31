import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useFrontDeskAuthStore from "@/store/useFrontDeskAuthStore";
import useUIStore from "@/store/useUIStore";

/**
 * ProtectedFrontDeskRoute - Only accessible to users authenticated via Front Desk Auth Store.
 * (Users redirected from Doctor SignIn due to non-standard roles)
 */
export const ProtectedFrontDeskRoute = () => {
    const { token } = useFrontDeskAuthStore();
    const { isLoggingOut } = useUIStore();

    if (!token) {
        if (isLoggingOut) {
            return <Navigate to="/doc/signin" replace />;
        }
        return <Navigate to="/doc/signin" replace state={{ fromGuard: true, message: "Please sign in to access Front Desk." }} />;
    }

    return <Outlet />;
};
