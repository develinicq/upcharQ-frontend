import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import RadioButton from "@/components/GeneralDrawer/RadioButton";
import { ChevronDown, Trash2 } from "lucide-react";
import { registerStaff } from "@/services/staff/registerStaffService";
import { fetchAllRoles } from "@/services/rbac/roleService";
import useAuthStore from "@/store/useAuthStore";

export default function InviteStaffDrawer({ open, onClose, initial = [], onSendInvite, onSend }) {
  const [rows, setRows] = useState([
    { name: "", email: "", phone: "", position: "", role: "Front Desk" },
  ]);
  const [closing, setClosing] = useState(false);
  const [roleOpenIdx, setRoleOpenIdx] = useState(null);
  const [mode, setMode] = useState("individual"); // 'individual' | 'bulk'
  const allFilled = useMemo(() => {
    if (!rows || rows.length === 0) return false;
    return rows.every(r => {
      const hasName = (r.name || "").trim().length > 0;
      const hasEmail = (r.email || "").trim().length > 0;
      const hasPhone = (r.phone || "").trim().length > 0;
      const hasPosition = (r.position || "").trim().length > 0;
      return hasName && hasEmail && hasPhone && hasPosition;
    });
  }, [rows]);
  const firstRowFilled = useMemo(() => {
    const r = rows?.[0];
    if (!r) return false;
    const hasName = (r.name || "").trim().length > 0;
    const hasEmail = (r.email || "").trim().length > 0;
    const hasPhone = (r.phone || "").trim().length > 0;
    const hasPosition = (r.position || "").trim().length > 0;
    return hasName && hasEmail && hasPhone && hasPosition;
  }, [rows]);
  const [roles, setRoles] = useState([]); // [{id,name}]
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  // Seed rows and fetch roles only when opening; avoid depending on `initial` reference
  useEffect(() => {
    if (!open) return;
    {
      const seed = Array.isArray(initial) && initial.length
        ? initial.map((r) => ({
            name: r?.name || "",
            email: r?.email || "",
            phone: r?.phone || "",
            position: r?.position || "",
            role: r?.role || "Front Desk",
          }))
        : [{ name: "", email: "", phone: "", position: "", role: "Front Desk" }];
      setRows(seed);

      // Fetch roles for Assign Roles dropdown
      (async () => {
        try {
          setRolesLoading(true);
          setRolesError("");
          const { doctorDetails } = useAuthStore.getState();
          const clinicId =
            doctorDetails?.associatedWorkplaces?.clinic?.id ||
            doctorDetails?.clinicId ||
            doctorDetails?.primaryClinic?.id || null;
          if (!clinicId) {
            setRoles([]);
            setRolesLoading(false);
            return;
          }
          const res = await fetchAllRoles(clinicId);
          const list = res?.data || [];
          setRoles(list.map((r) => ({ id: r.id, name: r.name })));
        } catch (e) {
          setRolesError(e?.message || "Failed to load roles");
        } finally {
          setRolesLoading(false);
        }
      })();
    }
  }, [open]);

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

  const addRow = () => setRows((r) => [...r, { name: "", email: "", phone: "", position: "", role: "Front Desk" }]);
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));
  const setRow = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const valid = rows.every((r) => r.name && r.email && r.phone && r.position && r.role);
  // Prefer API inside drawer; fallback to callbacks when provided
  const useApi = true;
  const handleSend = async () => {
    if (!valid) return;
    try {
      if (useApi) {
        await Promise.all(
          rows.map((r) =>
            registerStaff({
              name: r.name,
              email: r.email,
              phone: r.phone,
              position: r.position,
              role: r.role,
            })
          )
        );
      } else {
        if (typeof onSendInvite === 'function') await onSendInvite(rows);
        else if (typeof onSend === 'function') await onSend(rows);
      }
      onClose?.();
    } catch (err) {
      console.error("Invite failed:", err);
      alert("Failed to send invites");
    }
  };

  if (!open && !closing) return null;

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={requestClose}
      title="Invite Staff"
      primaryActionLabel="Send Invite"
      onPrimaryAction={handleSend}
  primaryActionDisabled={!allFilled}
      width={600}
    >
      <div className="flex flex-col gap-5">
        {/* Banner */}
        <div className="text-[12px] h-[40px] text-secondary-grey300 bg-blue-primary100 border border-blue-primary150 rounded-md px-3 py-2 flex items-center gap-2">
          <img src="/Doctor_module/settings/info_blue.png" alt="info" className="h-4" />
          Staff will receive an email invitation to create their account and set up Secure Account
        </div>

  {/* Mode radio group (hidden once first row is filled) */}
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

  {/* Rows */}
  <div className="flex flex-col gap-3">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-md flex flex-col border-[0.5px] border-secondary-grey100 p-3 gap-3 relative">
              {/* Header + Delete */}
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

              {/* Role Dropdown */}
              <div className="">
                <div className="grid grid-cols-1">
                  <div className="relative">
                    <InputWithMeta
                      label="Assign Roles"
                      requiredDot
                      value={row.role}
                      onChange={(v) => setRow(idx, { role: v })}
                      placeholder="Front Desk"
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
        {/* Outlined dashed placeholder and Add More link */}
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
