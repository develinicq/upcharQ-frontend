import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useHospitalFrontDeskAuthStore from "@/store/useHospitalFrontDeskAuthStore";
import useUIStore from "@/store/useUIStore";

/**
 * ProtectedHospitalFrontDeskRoute - Only accessible to users authenticated via Hospital Front Desk Auth Store.
 */
export const ProtectedHospitalFrontDeskRoute = () => {
    const { token } = useHospitalFrontDeskAuthStore();
    const { isLoggingOut } = useUIStore();

    if (!token) {
        if (isLoggingOut) {
            return <Navigate to="/doc/signin" replace />;
        }
        return <Navigate to="/doc/signin" replace state={{ fromGuard: true, message: "Please sign in to access Hospital Front Desk." }} />;
    }

    return <Outlet />;
};
