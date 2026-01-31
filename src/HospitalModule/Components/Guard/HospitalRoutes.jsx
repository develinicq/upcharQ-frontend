import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useHospitalAuthStore from "@/store/useHospitalAuthStore";
import useAuthStore from "@/store/useAuthStore";
import useUIStore from "@/store/useUIStore";
import useDoctorAuthStore from "@/store/useDoctorAuthStore";

/**
 * ProtectedHospitalRoute - Only accessible to users with HOSPITAL_ADMIN role.
 */
export const ProtectedHospitalRoute = () => {
    const { token, roleNames } = useHospitalAuthStore();
    const { isLoggingOut } = useUIStore();

    if (!token) {
        if (isLoggingOut) {
            return <Navigate to="/hospital/signin" replace />;
        }
        return <Navigate to="/hospital/signin" replace state={{ fromGuard: true }} />;
    }

    // Role check
    if (!roleNames.includes("HOSPITAL_ADMIN")) {
        return <Navigate to="/hospital/signin" replace state={{ fromGuard: true, message: "HOSPITAL_ADMIN role required" }} />;
    }

    return <Outlet />;
};

/**
 * ProtectedDoctorRoute - Only accessible to users with DOCTOR role.
 * Checked against hospital store (for dual-role users) or doc store (single-role).
 */
export const ProtectedDoctorRoute = () => {
    const hAuth = useHospitalAuthStore();
    const dAuth = useDoctorAuthStore();
    const { isLoggingOut } = useUIStore();

    const hToken = hAuth.token;
    const hRoles = hAuth.roleNames || [];

    // Check Hospital Dual Role: Must have both HOSPITAL_ADMIN and DOCTOR
    const isDualRole = hToken && hRoles.includes("HOSPITAL_ADMIN") && hRoles.includes("DOCTOR");

    // Check Single Doctor Role: Authenticated via Doctor Store
    const isSingleDoc = dAuth.token;

    console.log("ProtectedDoctorRoute Check:", { hToken: !!hToken, hRoles, dToken: !!dAuth.token, isDualRole, isSingleDoc });

    if (!isDualRole && !isSingleDoc) {
        if (hToken && hRoles.includes("HOSPITAL_ADMIN") && !hRoles.includes("DOCTOR")) {
            // If logged in as Hospital Admin but NO doctor role, redirect to doctor sign-in
            console.log("ProtectedDoctorRoute: Hospital-only admin trying to access doctor routes, redirecting to /doc/signin");
            return <Navigate to="/doc/signin" replace state={{ fromGuard: true, message: "Please sign in with a doctor account" }} />;
        }

        // Not authenticated at all or wrong role
        if (isLoggingOut) {
            return <Navigate to="/doc/signin" replace />;
        }
        console.log("ProtectedDoctorRoute: Redirecting to /doc/signin");
        return <Navigate to="/doc/signin" replace state={{ fromGuard: true }} />;
    }

    return <Outlet />;
};

/**
 * PublicHospitalRoute - For public-facing hospital routes like Sign-In.
 */
export const PublicHospitalRoute = ({ children }) => {
    const { token } = useHospitalAuthStore();

    if (token) {
        return <Navigate to="/hospital" replace />;
    }

    return children ? children : <Outlet />;
};

/**
 * PublicDoctorRoute - For public-facing doctor routes like Sign-In.
 */
export const PublicDoctorRoute = ({ children }) => {
    const dAuth = useDoctorAuthStore();
    const hAuth = useHospitalAuthStore();

    const isSingleDoc = !!dAuth.token;

    const hToken = hAuth.token;
    const hRoles = hAuth.roleNames || [];
    // If logged in as Hospital Admin AND Doctor, block doctor signin
    const isDualRole = hToken && hRoles.includes("HOSPITAL_ADMIN") && hRoles.includes("DOCTOR");

    console.log("PublicDoctorRoute Check:", { hToken: !!hToken, hRoles, isSingleDoc, isDualRole });

    // If either scenario is active, redirect to doctor dashboard
    if (isSingleDoc || isDualRole) {
        console.log("PublicDoctorRoute: Already authenticated. Redirecting to /doc");
        return <Navigate to="/doc" replace />;
    }

    // Allow access if no token OR if only Hospital Admin (allowing them to sign in as diff doctor)
    return children ? children : <Outlet />;
};
