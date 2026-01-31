import React, { useState, useEffect } from "react";
import {
    Eye,
    Crown,
    ClipboardList,
    ChevronDown
} from "lucide-react";
import { pencil } from "../../../../../public/index.js";
import InviteStaffDrawer from "../Drawers/InviteStaffDrawer.jsx";
import RoleDrawerShared from "../Drawers/RoleDrawer.jsx";
import { fetchAllRoles } from "../../../../services/rbac/roleService";
import { createRole } from "../../../../services/rbac/roleService";
import { fetchAllPermissions } from "../../../../services/rbac/permissionService";
import useDoctorAuthStore from "../../../../store/useDoctorAuthStore";
import useStaffStore from "../../../../store/useStaffStore";

// Inline components from Doc_settings (or could be further extracted)
const TabBtn = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={
            `px-[6px] py-1 text-[16px] md:text-sm rounded-md  transition-colors ` +
            (active
                ? "text-blue-primary250 border-[0.5px] border-blue-primary150 bg-blue-primary50"
                : "text-secondary-grey300 hover:bg-[#F9FAFB] hover:text-[#424242]")
        }
        aria-selected={active}
        role="tab"
    >
        {label}
    </button>
);

const InfoBanner = () => (
    <div className="flex items-start gap-2 border rounded-md px-3 py-2 bg-[#F6FAFF] border-[#D8E7FF] text-[#3A6EEA]">
        <img src="/i-icon.png" alt="info" className="w-4 h-4 mt-0.5" />
        <p className="text-[12px] leading-5">
            Staff will receive an email invitation to create their account and set
            up Secure Account
        </p>
    </div>
);

const Field = ({ label, required, children }) => (
    <label className="block">
        <span className="text-[12px] text-[#424242] font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </span>
        <div className="mt-1">{children}</div>
    </label>
);

const TextInput = (props) => (
    <input
        {...props}
        className={
            "w-full h-9 px-3 rounded-md border outline-none text-sm placeholder:text-[#9AA1A9] " +
            "border-[#E6E6E6] focus:border-[#BFD3FF] focus:ring-2 focus:ring-[#EAF2FF]"
        }
    />
);

const Select = ({ children, ...props }) => (
    <div className="relative">
        <select
            {...props}
            className={
                "w-full h-9 pr-8 pl-3 rounded-md border outline-none text-sm appearance-none " +
                "border-[#E6E6E6] focus:border-[#BFD3FF] focus:ring-2 focus:ring-[#EAF2FF]"
            }
        >
            {children}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
        </span>
    </div>
);

const CardSVG = ({ color = "#FDE68A" }) => (
    <svg viewBox="0 0 60 74" xmlns="http://www.w3.org/2000/svg">
        <rect
            x="0"
            y="0"
            rx="8"
            ry="8"
            width="60"
            height="74"
            fill="#F7FAFF"
            stroke="#D7DDF8"
        />
        <circle cx="30" cy="22" r="10" fill={color} />
        <rect x="18" y="38" width="24" height="4" rx="2" fill="#9DB8FF" />
        <rect x="14" y="46" width="32" height="4" rx="2" fill="#C7D2FE" />
        <rect x="14" y="54" width="32" height="4" rx="2" fill="#E0E7FF" />
    </svg>
);

const AvatarCarousel = () => {
    const [active, setActive] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setActive((a) => (a + 1) % 3), 2600);
        return () => clearInterval(id);
    }, []);
    const colors = ["#FECACA", "#FDE68A", "#BFDBFE"];
    const positions = (i) => {
        const rel = (i - active + 3) % 3;
        if (rel === 0) return { pos: "center" };
        if (rel === 1) return { pos: "right" };
        return { pos: "left" };
    };
    const styleFor = (pos) => {
        switch (pos) {
            case "center":
                return {
                    left: "50%",
                    transform: "translate(-50%, -50%) scale(1)",
                    zIndex: 30,
                };
            case "left":
                return {
                    left: "30%",
                    transform: "translate(-50%, -50%) scale(0.88)",
                    zIndex: 20,
                };
            case "right":
                return {
                    left: "70%",
                    transform: "translate(-50%, -50%) scale(0.88)",
                    zIndex: 20,
                };
            default:
                return {};
        }
    };
    return (
        <div className="relative w-[520px] max-w-[90vw] h-[180px]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 bg-[#EAF2FF] rounded-full" />
            {[0, 1, 2].map((i) => {
                const { pos } = positions(i);
                const center = pos === "center";
                return (
                    <div
                        key={i}
                        className={
                            "absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out drop-shadow-sm rounded-lg bg-white ring-1 " +
                            (center ? "ring-[#BFD3FF]" : "ring-[#E6ECFF]")
                        }
                        style={{
                            width: center ? 140 : 108,
                            height: center ? 172 : 134,
                            ...styleFor(pos),
                        }}
                    >
                        <CardSVG color={colors[i]} />
                    </div>
                );
            })}
        </div>
    );
};

const StaffRow = ({ data }) => (
    <div
        className="border-[0.5px] flex flex-col gap-2 border-secondary-grey100 rounded-lg bg-white p-3 "
        style={{ borderWidth: "0.5px", width: "280px", minHeight: "228px" }}
    >
        <div className="flex items-start gap-2">
            <div className="w-12 h-12 rounded-full grid place-items-center text-blue-primary250 bg-blue-primary50 border-[0.5px] border-blue-primary150">
                <span className="text-[20px]">
                    {data.name?.[0]?.toUpperCase() || "U"}
                </span>
            </div>
            <div className="flex-1 ">
                <div className="text-[16px] font-semibold text-secondary-grey400">
                    {data.name}
                </div>
                <div className="text-[12px] text-secondary-grey300">{data.position}</div>
            </div>
        </div>

        <div className="text-[14px] text-secondary-grey300">
            <div className="flex justify-between py-1">
                <span className="">Role:</span>
                <span className="text-right font-medium ">
                    {data.role}
                </span>
            </div>
            <div className="flex justify-between py-1">
                <span>Contact Number:</span>
                <span className="text-right font-medium ">
                    {data.phone || "-"}
                </span>
            </div>
            <div className="flex justify-between py-1">
                <span>Last Active:</span>
                <span className="text-right ">-</span>
            </div>
            <div className="flex justify-between py-1">
                <span>Joined:</span>
                <span className="text-right font-medium ">
                    {data.joined || "-"}
                </span>
            </div>
        </div>

        <div className="flex border-t pt-2 items-center gap-2">
            <button className="h-8 py-1 px-[6px] rounded-md border text-[12px] text-[#424242] hover:bg-gray-50 inline-flex items-center gap-1">
                <Eye size={14} /> View
            </button>
            <button className="h-8 py-1 px-[6px] rounded-md border text-[12px] text-[#424242] hover:bg-gray-50 inline-flex items-center gap-1">
                <img src={pencil} alt="Edit" className="w-5" /> Edit
            </button>
            <div className="w-[0.5px] h-6 ml-1 bg-secondary-grey100"></div>
            <div className="ml-auto flex text-warning2-400 items-center bg-warning2-50 rounded-md">
                <button className="h-8 px-3 rounded-l-md text-[12px] ">
                    Inactive
                </button>

                <button className="h-5 px-2 mr-1 rounded-r-md py-1">
                    <ChevronDown size={14} />
                </button>
            </div>
        </div>
    </div>
);

const RoleCard = ({ role }) => {
    const Icon = role.icon === "crown" ? Crown : ClipboardList;
    return (
        <div
            className="border border-[#E2E2E2] rounded-lg bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            style={{ borderWidth: "0.5px", width: "280px", minHeight: "180px" }}
        >
            <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full grid place-items-center text-[#2F66F6] bg-white border border-[#DDE6FF]">
                    <Icon size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-[15px] font-semibold text-secondary-grey400 leading-tight">
                        {role.name}
                    </div>
                    <div className="text-[12px] text-secondary-grey300">{role.subtitle}</div>
                </div>
            </div>
            <div className="mt-2 flex flex-col gap-2 text-[13px] text-secondary-grey300">
                <div className="flex justify-between py-">
                    <span>Staff Member:</span>
                    <span className="font-medium ">
                        {role.staffCount}
                    </span>
                </div>
                <div className="flex justify-between py-">
                    <span>Total Permissions:</span>
                    <span className="font-medium ">
                        {role.permissions}
                    </span>
                </div>
                <div className="flex justify-between py- border-b pb-2">
                    <span>Creation Date:</span>
                    <span className="font-medium ">{role.created}</span>
                </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="h-7 rounded-md border text-[12px]  hover:bg-gray-50 inline-flex items-center justify-center gap-1">
                    <Eye size={14} /> View
                </button>
                <button className="h-7 rounded-md border text-[12px]  hover:bg-gray-50 inline-flex items-center justify-center gap-1">
                    <img src={pencil} alt="Edit" className="w-[14px] h-[14px]" /> Edit
                </button>
            </div>
        </div>
    );
};

const RoleDrawerInline = ({ open, onClose, onCreate }) => {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    // selection map by permission id => boolean
    const [checked, setChecked] = useState({});
    const [closing, setClosing] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const {
        permissions: grouped,
        loadingPermissions: loading,
        fetchPermissions
    } = useStaffStore();

    // fetch permissions when drawer opens
    useEffect(() => {
        if (open) {
            fetchPermissions();
        }
    }, [open, fetchPermissions]);

    useEffect(() => {
        if (open) {
            setChecked({});
        }
    }, [open]);

    if (!open && !closing) return null;
    const requestClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose?.();
        }, 220);
    };

    const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));
    const groupAll = (moduleName, value) => {
        const up = { ...checked };
        const items = grouped[moduleName] || [];
        items.forEach((it) => (up[it.id] = value));
        setChecked(up);
    };
    const selectedCount = Object.values(checked).filter(Boolean).length;
    const canCreate = name.trim().length > 0 && selectedCount > 0;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className={`absolute inset-0 bg-black/30 ${closing
                    ? "animate-[fadeOut_.2s_ease-in_forwards]"
                    : "animate-[fadeIn_.25s_ease-out_forwards]"
                    }`}
                onClick={requestClose}
            />
            <aside
                className={`absolute top-16 right-5 bottom-5 w-[600px] bg-white shadow-2xl border border-[#E6E6E6] rounded-xl overflow-hidden ${closing
                    ? "animate-[drawerOut_.22s_ease-in_forwards]"
                    : "animate-[drawerIn_.25s_ease-out_forwards]"
                    }`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#EFEFEF]">
                    <h3 className="text-[16px] font-semibold text-[#424242]">
                        Create User Role
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={!canCreate}
                            className={
                                "text-xs md:text-sm h-8 px-3 rounded-md transition " +
                                (!canCreate
                                    ? "bg-[#F2F2F2] text-[#9AA1A9] cursor-not-allowed"
                                    : "bg-[#2F66F6] text-white hover:bg-[#1e4cd8]")
                            }
                            onClick={async () => {
                                if (!canCreate) return;
                                const permissionIds = Object.entries(checked)
                                    .filter(([, v]) => v)
                                    .map(([k]) => k);
                                // Resolve clinicId
                                const authSnap = useDoctorAuthStore.getState();
                                const clinicId =
                                    authSnap?.user?.associatedWorkplaces?.clinic?.id ||
                                    authSnap?.user?.clinicId ||
                                    authSnap?.clinicId;
                                if (!clinicId) {
                                    console.error("No clinicId available for create-role");
                                    setCreateError(
                                        "No clinic selected. Please sign in and ensure doctor profile is loaded."
                                    );
                                    return;
                                }
                                try {
                                    setCreating(true);
                                    setCreateError("");
                                    const res = await createRole({
                                        name,
                                        description: desc,
                                        permissions: permissionIds,
                                        clinicId,
                                    });
                                    // Update roles UI list if onCreate provided
                                    onCreate?.(res?.data || res);
                                    requestClose();
                                } catch (e) {
                                    console.error("Failed to create role", e);
                                    setCreateError(e?.message || "Failed to create role");
                                } finally {
                                    setCreating(false);
                                }
                            }}
                        >
                            {creating ? "Creating…" : "Create"}
                        </button>
                        <button
                            onClick={requestClose}
                            className="w-8 h-8 rounded-full grid place-items-center hover:bg-gray-100"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                {createError ? (
                    <div className="px-3 py-2 text-[12px] text-red-600">
                        {String(createError)}
                    </div>
                ) : null}
                <div className="px-3 py-2 flex flex-col gap-2 overflow-y-auto h-[calc(100%-48px)]">
                    <label className="block">
                        <span className="text-[12px] text-[#424242] font-medium">
                            Role Name <span className="text-red-500">*</span>
                        </span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter staff full name"
                            className="w-full h-9 px-3 mt-1 rounded-md border border-[#E6E6E6] focus:border-[#BFD3FF] focus:ring-2 focus:ring-[#EAF2FF] outline-none text-sm"
                        />
                    </label>
                    <label className="block">
                        <span className="text-[12px] text-[#424242] font-medium">
                            Description
                        </span>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={2}
                            placeholder="Describe role responsibilities..."
                            className="w-full p-2 mt-1 rounded-md border border-[#E6E6E6] focus:border-[#BFD3FF] focus:ring-2 focus:ring-[#EAF2FF] outline-none text-sm"
                        />
                    </label>
                    <div className="mt-2">
                        <div className="text-[13px] font-medium text-[#424242] mb-2 flex justify-between">
                            <span>Select Permissions</span>
                            <span className="text-xs text-gray-400">
                                {selectedCount} selected
                            </span>
                        </div>
                        {loading && <div className="text-xs text-gray-500">Loading...</div>}
                        <div className="space-y-4">
                            {Object.entries(grouped).map(([mod, items]) => {
                                const allSelected = items.every((it) => checked[it.id]);
                                return (
                                    <div
                                        key={mod}
                                        className="border border-[#E6E6E6] rounded-md overflow-hidden"
                                    >
                                        <div className="bg-[#F9FAFB] px-3 py-2 flex items-center justify-between border-b border-[#E6E6E6]">
                                            <span className="text-[13px] font-semibold text-[#424242]">
                                                {mod}
                                            </span>
                                            <button
                                                onClick={() => groupAll(mod, !allSelected)}
                                                className="text-[11px] text-blue-600 hover:underline"
                                            >
                                                {allSelected ? "Unselect All" : "Select All"}
                                            </button>
                                        </div>
                                        <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white">
                                            {items.map((perm) => (
                                                <label
                                                    key={perm.id}
                                                    className="flex items-start gap-2 text-[12px] text-[#424242] cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={!!checked[perm.id]}
                                                        onChange={() => toggle(perm.id)}
                                                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <div className="font-medium">{perm.name}</div>
                                                        {perm.description && (
                                                            <div className="text-[10px] text-gray-400 leading-tight">
                                                                {perm.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};


const StaffTab = () => {
    const [tab, setTab] = useState("staff"); // 'staff' | 'roles'
    const [inviteOpen, setInviteOpen] = useState(false);
    const [roleOpen, setRoleOpen] = useState(false); // shared drawer for managing roles (future)
    const [createRoleOpen, setCreateRoleOpen] = useState(false); // inline drawer for creating role

    // DATA
    const {
        roles,
        staffList,
        loadingRoles,
        loadingStaff,
        fetchRoles,
        fetchStaff
    } = useStaffStore();

    const getClinicId = () => {
        const authSnap = useDoctorAuthStore.getState();
        return (
            authSnap?.user?.associatedWorkplaces?.clinic?.id ||
            authSnap?.user?.clinicId ||
            authSnap?.clinicId
        );
    };

    useEffect(() => {
        const clinicId = getClinicId();
        if (tab === "roles") fetchRoles({ clinicId });
        if (tab === "staff") fetchStaff({ clinicId });
    }, [tab, fetchRoles, fetchStaff]);

    return (
        <div className="p-4 flex flex-col gap-3 no-scrollbar">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex bg-[#F2F2F2] p-1 rounded-lg w-max">
                    <TabBtn
                        label="Staff Members"
                        active={tab === "staff"}
                        onClick={() => setTab("staff")}
                    />
                    <TabBtn
                        label="Roles & Permissions"
                        active={tab === "roles"}
                        onClick={() => setTab("roles")}
                    />
                </div>
                {/* Action Button */}
                <div>
                    {tab === "staff" ? (
                        <button
                            onClick={() => setInviteOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 transition"
                        >
                            <span>+</span> Invite New Staff
                        </button>
                    ) : (
                        <button
                            onClick={() => setCreateRoleOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 transition"
                        >
                            <span>+</span> Create New Role
                        </button>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <InfoBanner />

            {/* Content Area */}
            <div className="mt-2 min-h-[300px]">
                {tab === "staff" ? (
                    <div className="flex flex-col gap-4">
                        {/* Empty / Illustration state could go here */}
                        <div className="flex flex-col md:flex-row gap-6 ">
                            {/* Illustration left side - strictly visual */}
                            <div className="hidden md:flex flex-col items-center justify-center p-4">
                                <AvatarCarousel />
                                <div className="mt-6 text-center text-gray-400 text-sm max-w-[240px]">
                                    Manage your clinic staff, assign roles, and track their activities.
                                </div>
                            </div>

                            {/* Staff Grid */}
                            <div className="flex-1">
                                <div className="mb-2 text-sm text-gray-500 font-medium">
                                    Active Staff ({staffList.length})
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {loadingStaff ? (
                                        <div className="text-gray-400 text-sm">Loading staff...</div>
                                    ) : staffList.length > 0 ? (
                                        staffList.map((s) => <StaffRow key={s.id} data={s} />)
                                    ) : (
                                        <div className="text-gray-400 text-sm italic">
                                            No staff members found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-3 text-[14px] text-gray-500">
                            Available Roles ({roles.length})
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {loadingRoles ? (
                                <div className="text-gray-400 text-sm">Loading roles...</div>
                            ) : (
                                roles.map((r) => <RoleCard key={r.id} role={r} />)
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Drawers */}
            <InviteStaffDrawer
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onSendInvite={async () => {
                    const clinicId = getClinicId();
                    fetchStaff({ clinicId });
                    setInviteOpen(false);
                }}
            />

            {/* Global/Shared Role drawer (not used by default button, but kept) */}
            <RoleDrawerShared
                open={roleOpen}
                onClose={() => setRoleOpen(false)}
            />

            {/* Inline Role Creation Drawer */}
            <RoleDrawerInline
                open={createRoleOpen}
                onClose={() => setCreateRoleOpen(false)}
                onCreate={(newRole) => {
                    // refresh roles
                    fetchRoles({ clinicId: getClinicId() });
                }}
            />
        </div>
    );
};

export default StaffTab;
