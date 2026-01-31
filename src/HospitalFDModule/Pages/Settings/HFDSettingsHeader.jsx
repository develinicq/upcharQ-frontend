import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AvatarCircle from "../../../components/AvatarCircle";
import { hospital as coverImg } from "../../../../public/index.js";
import useHospitalFrontDeskAuthStore from "../../../store/useHospitalFrontDeskAuthStore";
import useClinicStore from "../../../store/settings/useClinicStore";

export default function HFDSettingsHeader({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useHospitalFrontDeskAuthStore();
    const { clinic } = useClinicStore();

    const tabs = [
        { key: "clinics", label: "Clinic Details", path: "/hfd/settings/clinics" },
        { key: "consultation", label: "Consultation Details", path: "/hfd/settings/consultation" },
        { key: "staff-permissions", label: "Staff Permissions", path: "/hfd/settings/staff-permissions" },
    ];

    const activeTab = useMemo(() => {
        const p = location.pathname;
        if (p.endsWith("/settings/clinics")) return "clinics";
        if (p.endsWith("/settings/consultation")) return "consultation";
        if (p.endsWith("/settings/staff-permissions")) return "staff-permissions";
        return "";
    }, [location.pathname]);

    const displayName = clinic?.name || user?.name || "HFD Staff";

    return (
        <div className="-mx-6">
            {/* Top banner + centered avatar */}
            <div className="relative">
                <img src={coverImg} alt="cover" className="w-full h-40 object-cover" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="rounded-full ring-4 ring-white shadow-md">
                        <AvatarCircle
                            name={displayName}
                            size="l"
                            color="blue"
                            className="w-24 h-24 text-3xl"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border-b border-secondary-grey100">
                <div className="px-6 pt-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center mx-auto">
                            <div className="text-lg font-medium text-gray-900">{displayName}</div>
                            <div className="text-green-600 text-sm">Active</div>
                        </div>
                    </div>
                    <nav className="flex items-center gap-6 overflow-x-auto text-sm">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => navigate(t.path)}
                                className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${activeTab === t.key
                                        ? "text-blue-primary250 border-blue-primary250"
                                        : "border-transparent text-secondary-grey300 hover:text-secondary-grey400"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
