import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import RadioButton from "@/components/GeneralDrawer/RadioButton";
import { ChevronDown } from "lucide-react";
import { registerStaff } from "@/services/staff/registerStaffService";
import { fetchAllRoles } from "@/services/rbac/roleService";
import useAuthStore from "@/store/useAuthStore";

export default function InviteStaffDrawer({ open, onClose, initial = [], onSendInvite, onSend, clinicId: propClinicId }) {
  const [rows, setRows] = useState([
    { name: "", email: "", phone: "", position: "", role: "", roleId: "" },
  ]);
  const [closing, setClosing] = useState(false);
  const [roleOpenIdx, setRoleOpenIdx] = useState(null);
  const [mode, setMode] = useState("individual");

  const [roles, setRoles] = useState([]); // [{id,name}]
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const getClinicId = () => {
    if (propClinicId) return propClinicId;
    const { doctorDetails } = useAuthStore.getState();
    return doctorDetails?.associatedWorkplaces?.clinic?.id ||
      doctorDetails?.clinicId ||
      doctorDetails?.primaryClinic?.id || null;
  };
  const effectiveClinicId = getClinicId();

  useEffect(() => {
    if (!open) return;

    const seed = Array.isArray(initial) && initial.length
      ? initial.map((r) => ({
        name: r?.name || "",
        email: r?.email || "",
        phone: r?.phone || "",
        position: r?.position || "",
        role: r?.role || "",
        roleId: r?.roleId || ""
      }))
      : [{ name: "", email: "", phone: "", position: "", role: "", roleId: "" }];
    setRows(seed);

    const fetchRoles = async () => {
      setRolesError(""); // Clear any previous error

      const dummy = [
        { id: "role-frontdesk", name: "Front Desk" },
        { id: "role-consultant", name: "Consultant" },
        { id: "role-admin", name: "Admin" }
      ];

      // If no clinic ID, use fallback immediately
      if (!effectiveClinicId) {
        console.warn("No Clinic ID found for InviteStaffDrawer, using fallback roles for UI.");
        setRolesError(""); // Explicitly clear error
        setRoles(dummy);
        setRows(prev => prev.map(row => {
          if (row.role && !row.roleId) {
            const match = dummy.find(l => l.name === row.role);
            return match ? { ...row, roleId: match.id } : { ...row, role: "", roleId: "" };
          }
          return row;
        }));
        return;
      }

      try {
        setRolesLoading(true);
        const res = await fetchAllRoles({ clinicId: effectiveClinicId });
        const list = res?.data || [];
        setRoles(list.map((r) => ({ id: r.id, name: r.name })));

        setRows(prev => prev.map(row => {
          if (row.role && !row.roleId) {
            const match = list.find(l => l.name === row.role);
            return match ? { ...row, roleId: match.id } : { ...row, role: "", roleId: "" };
          }
          return row;
        }));

      } catch (e) {
        console.warn("Failed to load roles in drawer, using fallback:", e);
        // Fallback to dummy roles so the feature works in demo/dev
        setRolesError(""); // Explicitly clear error
        setRoles(dummy);

        // Fix up rows again with fallback data
        setRows(prev => prev.map(row => {
          if (row.role && !row.roleId) {
            const match = dummy.find(l => l.name === row.role);
            return match ? { ...row, roleId: match.id } : { ...row, role: "", roleId: "" };
          }
          return row;
        }));
      } finally {
        setRolesLoading(false);
      }
    };


    fetchRoles();
  }, [open, effectiveClinicId]);

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
    return roles.map((r) => ({ label: r.name, value: r.id }));
  }, [roles, rolesLoading, rolesError]);

  const addRow = () => setRows((r) => [...r, { name: "", email: "", phone: "", position: "", role: "", roleId: "" }]);
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx));
  const setRow = (idx, patch) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const allFilled = rows.every(r => r.name && r.email && r.phone && r.position && r.roleId);
  const firstRowFilled = rows[0] && rows[0].name && rows[0].email;

  const handleSend = async () => {
    if (!allFilled) return;

    try {
      const signupLink = `${window.location.origin}/fd/onboarding`;

      await Promise.all(
        rows.map((r) => {
          const [firstName, ...rest] = r.name.trim().split(" ");
          const lastName = rest.join(" ");

          return registerStaff({
            firstName: firstName || r.name,
            lastName: lastName || "",
            emailId: r.email,
            phone: r.phone,
            position: r.position,
            roleId: r.roleId,
            clinicId: effectiveClinicId,
            signupLink
          });
        })
      );

      if (typeof onSend === 'function') onSend(rows);

      onClose?.();
    } catch (err) {
      console.error("Invite failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to send invites";
      alert(msg);
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
        <div className="text-[12px] h-[40px] text-secondary-grey300 bg-blue-primary100 border border-blue-primary150 rounded-md px-3 py-2 flex items-center gap-2">
          <img src="/Doctor_module/settings/info_blue.png" alt="info" className="h-4" />
          Staff will receive an email invitation to create their account and set up Secure Account
        </div>

        {!firstRowFilled && (
          <div className="flex items-center gap-6">
            <RadioButton name="invite-mode" value="individual" checked={mode === "individual"} onChange={setMode} label="Individual Invite" />
            <RadioButton name="invite-mode" value="bulk" checked={mode === "bulk"} onChange={setMode} label="Bulk Invite" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-md flex flex-col border-[0.5px] border-secondary-grey100 p-3 gap-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-grey300 font-medium">{rows.length > 1 ? `New Staff Member ${idx + 1}` : "New Staff Member"}</span>
                {rows.length > 1 && (
                  <button type="button" className="text-secondary-grey200 hover:text-secondary-grey300" onClick={() => removeRow(idx)}>
                    <img src="/Doctor_module/settings/dustbin.png" alt="" className="w-4 mr-1" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InputWithMeta label="Full Name" requiredDot value={row.name} onChange={(v) => setRow(idx, { name: v })} placeholder="Anand Patil" />
                <InputWithMeta label="Email Address" requiredDot value={row.email} onChange={(v) => setRow(idx, { email: v })} placeholder="anand.patil@gmail.com" />
                <InputWithMeta label="Phone Number" requiredDot value={row.phone} onChange={(v) => setRow(idx, { phone: v.replace(/[^0-9]/g, '') })} placeholder="91753 37891" />
                <InputWithMeta label="Position" requiredDot value={row.position} onChange={(v) => setRow(idx, { position: v })} placeholder="Receptionist" />
              </div>

              <div className="">
                <div className="grid grid-cols-1">
                  <div className="relative">
                    <InputWithMeta
                      label="Assign Roles"
                      requiredDot
                      value={row.role}
                      placeholder="Select Role"
                      RightIcon={ChevronDown}
                      onFieldOpen={() => setRoleOpenIdx((o) => (o === idx ? null : idx))}
                      dropdownOpen={roleOpenIdx === idx}
                      onRequestClose={() => setRoleOpenIdx(null)}
                      readonlyWhenIcon
                    />
                    <Dropdown
                      open={roleOpenIdx === idx}
                      onClose={() => setRoleOpenIdx(null)}
                      items={roleOptions}
                      selectedValue={row.roleId}
                      onSelect={(it) => {
                        setRow(idx, { role: it.label, roleId: it.value });
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
          <button type="button" className="w-full border-[0.5px] border-dashed border-secondary-grey100 rounded-md p-2 hover:bg-blue-primary50 cursor-pointer text-blue-primary250 hover:text-blue-primary300 text-sm" onClick={addRow}>
            Add More Staff Members
          </button>
        </div>
      </div>
    </GeneralDrawer>
  );
}
