import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import RadioButton from "@/components/GeneralDrawer/RadioButton";
import { ChevronDown, Trash2 } from "lucide-react";
import { registerStaff } from "@/services/staff/registerStaffService";
import { fetchAllRoles } from "@/services/rbac/roleService";
import useAuthStore from "@/store/useAuthStore";
import useClinicStore from "@/store/settings/useClinicStore";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";

export default function InviteStaffDrawer({ open, onClose, initial = [], onSendInvite, onSend }) {
    const [rows, setRows] = useState([
        { name: "", email: "", phone: "", position: "", role: "" },
    ]);
    const [inviting, setInviting] = useState(false);
    const { addToast } = useToastStore();
    const { selectedClinicId } = useClinicStore();
    const [closing, setClosing] = useState(false);
    const [roleOpenIdx, setRoleOpenIdx] = useState(null);
    const [mode, setMode] = useState("individual"); // 'individual' | 'bulk'

    const allFilled = useMemo(() => {
        if (!rows || rows.length === 0) return false;
        return rows.every(r => {
            const trimmedName = (r.name || "").trim();
            const hasBothNames = trimmedName.split(/\s+/).length >= 2;
            const hasEmail = (r.email || "").trim().length > 0;
            const hasPhone = (r.phone || "").trim().length > 0;
            const hasPosition = (r.position || "").trim().length > 0;
            return hasBothNames && hasEmail && hasPhone && hasPosition;
        });
    }, [rows]);

    const firstRowFilled = useMemo(() => {
        const r = rows?.[0];
        if (!r) return false;
        const trimmedName = (r.name || "").trim();
        const hasBothNames = trimmedName.split(/\s+/).length >= 2;
        const hasEmail = (r.email || "").trim().length > 0;
        const hasPhone = (r.phone || "").trim().length > 0;
        const hasPosition = (r.position || "").trim().length > 0;
        return hasBothNames && hasEmail && hasPhone && hasPosition;
    }, [rows]);

    const [roles, setRoles] = useState([]); // [{id,name}]
    const [rolesLoading, setRolesLoading] = useState(false);
    const [rolesError, setRolesError] = useState("");

    useEffect(() => {
        if (!open) return;
        {
            const seed = Array.isArray(initial) && initial.length
                ? initial.map((r) => ({
                    name: r?.name || "",
                    email: r?.email || "",
                    phone: r?.phone || "",
                    position: r?.position || "",
                    role: r?.role || "",
                }))
                : [{ name: "", email: "", phone: "", position: "", role: "" }];
            setRows(seed);

            (async () => {
                try {
                    setRolesLoading(true);
                    setRolesError("");
                    if (!selectedClinicId) {
                        setRoles([]);
                        setRolesLoading(false);
                        return;
                    }
                    const res = await fetchAllRoles({ hospitalId: selectedClinicId });
                    const list = res?.data || [];
                    const mappedRoles = list.map((r) => ({ id: r.id, name: r.name }));
                    setRoles(mappedRoles);

                    if (mappedRoles.length > 0) {
                        const firstRole = mappedRoles[0].name;
                        setRows(prev => prev.map(r => ({
                            ...r,
                            role: r.role || firstRole
                        })));
                    }
                } catch (e) {
                    setRolesError(e?.message || "Failed to load roles");
                } finally {
                    setRolesLoading(false);
                }
            })();
        }
    }, [open, selectedClinicId]);

    const requestClose = React.useCallback(() => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose?.();
        }, 220);
    }, [onClose]);

    useEffect(() => {
        if (!open && !closing) return;
        const onEsc = (e) => e.key === "Escape" && requestClose();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [open, closing, requestClose]);

    const roleOptions = useMemo(() => {
        if (rolesLoading) return [{ label: "Loading…", value: "" }];
        if (rolesError) return [{ label: "Failed to load", value: "" }];
        if (!roles || roles.length === 0)
            return [{ label: "No roles", value: "" }];
        return roles.map((r) => ({ label: r.name, value: r.name }));
    }, [roles, rolesLoading, rolesError]);

    const addRow = () => setRows((r) => [...r, { name: "", email: "", phone: "", position: "", role: roles[0]?.name || "" }]);
    const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));
    const setRow = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

    const valid = rows.every((r) => {
        const trimmedName = (r.name || "").trim();
        const hasBothNames = trimmedName.split(/\s+/).length >= 2;
        return hasBothNames && r.email && r.phone && r.position && r.role;
    });

    const handleSend = async () => {
        if (!valid || inviting) return;

        setInviting(true);
        try {
            await Promise.all(
                rows.map((r) => {
                    const matchedRole = roles.find(role => role.name === r.role);
                    const roleId = matchedRole?.id || "";

                    const parts = (r.name || "").trim().split(/\s+/);
                    const firstName = parts[0] || "";
                    const lastName = parts.slice(1).join(" ");

                    const payload = {
                        firstName,
                        lastName,
                        emailId: r.email,
                        phone: r.phone,
                        position: r.position,
                        roleId: roleId,
                        hospitalId: selectedClinicId // Use hospitalId for HospitalModule
                    };
                    return registerStaff(payload);
                })
            );

            addToast({
                title: "Success",
                message: "Staff invitation(s) sent successfully.",
                type: "success"
            });

            if (typeof onSendInvite === 'function') await onSendInvite(rows);
            else if (typeof onSend === 'function') await onSend(rows);

            requestClose();
        } catch (err) {
            console.error("Invite failed:", err);
            addToast({
                title: "Error",
                message: err?.response?.data?.message || err?.message || "Failed to send invites",
                type: "error"
            });
        } finally {
            setInviting(false);
        }
    };

    if (!open && !closing) return null;

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={requestClose}
            title="Invite Staff"
            primaryActionLabel={inviting ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} color="white" />
                    <span>Sending...</span>
                </div>
            ) : "Send Invite"}
            onPrimaryAction={handleSend}
            primaryActionDisabled={!allFilled || inviting}
            width={600}
        >
            <div className="flex flex-col gap-5">
                <div className="text-[12px] h-[40px] text-secondary-grey300 bg-blue-primary100 border border-blue-primary150 rounded-md px-3 py-2 flex items-center gap-2">
                    <img src="/Doctor_module/settings/info_blue.png" alt="info" className="h-4" />
                    Staff will receive an email invitation to create their account and set up Secure Account
                </div>

                {!firstRowFilled && (
                    <div className="flex items-center gap-6">
                        <RadioButton
                            name="invite-mode"
                            value="individual"
                            checked={mode === "individual"}
                            onChange={setMode}
                            label="Individual Invite"
                        />
                        <RadioButton
                            name="invite-mode"
                            value="bulk"
                            checked={mode === "bulk"}
                            onChange={setMode}
                            label="Bulk Invite"
                        />
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {rows.map((row, idx) => (
                        <div key={idx} className="rounded-md flex flex-col border-[0.5px] border-secondary-grey100 p-3 gap-3 relative">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-secondary-grey300 font-medium">
                                    {rows.length > 1 ? `New Staff Member ${idx + 1}` : "New Staff Member"}
                                </span>
                                {rows.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-secondary-grey200 hover:text-secondary-grey300"
                                        onClick={() => removeRow(idx)}
                                        aria-label="Remove"
                                        title="Remove"
                                    >
                                        <img src="/Doctor_module/settings/dustbin.png" alt="" className="w-4 mr-1" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                <InputWithMeta
                                    label="Full Name"
                                    requiredDot
                                    value={row.name}
                                    onChange={(v) => setRow(idx, { name: v })}
                                    placeholder="Anand Patil"
                                />
                                <InputWithMeta
                                    label="Email Address"
                                    requiredDot
                                    value={row.email}
                                    onChange={(v) => setRow(idx, { email: v })}
                                    placeholder="anand.patil@gmail.com"
                                />
                                <InputWithMeta
                                    label="Phone Number"
                                    requiredDot
                                    value={row.phone}
                                    onChange={(v) => setRow(idx, { phone: v.replace(/[^0-9]/g, '') })}
                                    placeholder="91753 37891"
                                />
                                <InputWithMeta
                                    label="Position"
                                    requiredDot
                                    value={row.position}
                                    onChange={(v) => setRow(idx, { position: v })}
                                    placeholder="Receptionist"
                                />
                            </div>

                            <div className="">
                                <div className="grid grid-cols-1">
                                    <div className="relative">
                                        <InputWithMeta
                                            label="Assign Roles"
                                            requiredDot
                                            value={row.role}
                                            onChange={(v) => setRow(idx, { role: v })}
                                            placeholder="Select Role"
                                            RightIcon={ChevronDown}
                                            onFieldOpen={() => setRoleOpenIdx((o) => (o === idx ? null : idx))}
                                            dropdownOpen={roleOpenIdx === idx}
                                            onRequestClose={() => setRoleOpenIdx(null)}
                                        />
                                        <Dropdown
                                            open={roleOpenIdx === idx}
                                            onClose={() => setRoleOpenIdx(null)}
                                            items={roleOptions}
                                            selectedValue={row.role}
                                            onSelect={(it) => {
                                                setRow(idx, { role: it.value });
                                                setRoleOpenIdx(null);
                                            }}
                                            anchorClassName="w-full h-0"
                                            className="input-meta-dropdown w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="">
                    <button
                        type="button"
                        className=" w-full border-[0.5px] border-dashed border-secondary-grey100 rounded-md p-2 hover:bg-blue-primary50 cursor-pointer text-blue-primary250 hover:text-blue-primary300  text-sm "
                        onClick={addRow}
                    >
                        Add More Staff Members
                    </button>
                </div>
            </div>
        </GeneralDrawer>
    );
}
