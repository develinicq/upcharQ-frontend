import React, { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

// Shared InviteStaffDrawer used from Settings > Staff Permissions and Navbar > Add New
// Props:
// - open: boolean
// - onClose: () => void
// - onSend: (rows: Array<{ fullName, email, phone, position, roleId }>) => void
// - roleOptions: Array<{ id, name }>
export default function InviteStaffDrawer({ open, onClose, onSend, roleOptions = [] }) {
  const [mode, setMode] = useState("individual");
  const [rows, setRows] = useState([
    { id: 0, fullName: "", email: "", phone: "", position: "", roleId: "" },
  ]);
  const [closing, setClosing] = useState(false);

  const requestClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && requestClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [requestClose]);

  useEffect(() => {
    if (open) {
      // reset on open
      setMode("individual");
      setRows([{ id: 0, fullName: "", email: "", phone: "", position: "", roleId: "" }]);
    }
  }, [open]);

  if (!open && !closing) return null;

  const removeRow = (id) => setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: (r[r.length - 1]?.id ?? 0) + 1, fullName: "", email: "", phone: "", position: "", roleId: "" },
    ]);
  const onChangeRow = (id, field, value) => setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const emailOk = (e) => /.+@.+\..+/.test(e);
  const allValid = rows.every((x) => x.fullName && emailOk(x.email) && x.phone && x.position && x.roleId);

  const InfoBanner = () => (
    <div className="flex items-start gap-2 border rounded-md px-3 py-2 bg-[#F6FAFF] border-[#D8E7FF] text-[#3A6EEA]">
      <img src="/i-icon.png" alt="info" className="w-4 h-4 mt-0.5" />
      <p className="text-[12px] leading-5">
        Staff will receive an email invitation to create their account and set up Secure Account
      </p>
    </div>
  );

  const Field = ({ label, required, children }) => (
    <label className="block">
      <span className="text-[12px] text-[#424242] font-medium">{label} {required && <span className="text-red-500">*</span>}</span>
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
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/30 ${closing ? "animate-[fadeOut_.2s_ease-in_forwards]" : "animate-[fadeIn_.25s_ease-out_forwards]"}`}
        onClick={requestClose}
      />
      <aside
        className={`absolute top-16 right-5 bottom-5 w-[600px] bg-white shadow-2xl border border-[#E6E6E6] rounded-xl overflow-hidden ${
          closing ? "animate-[drawerOut_.22s_ease-in_forwards]" : "animate-[drawerIn_.25s_ease-out_forwards]"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#EFEFEF]">
          <h3 className="text-[16px] font-semibold text-[#424242]">Invite Staff</h3>
          <div className="flex items-center gap-3">
            <button
              disabled={!allValid}
              className={
                "text-xs md:text-sm h-8 px-3 rounded-md transition " +
                (!allValid ? "bg-[#F2F2F2] text-[#9AA1A9] cursor-not-allowed" : "bg-[#2F66F6] text-white hover:bg-[#1e4cd8]")
              }
              onClick={() => allValid && onSend?.(rows)}
            >
              Send Invite
            </button>
            <button onClick={requestClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-gray-100" aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-3 overflow-y-auto h-[calc(100%-48px)]">
          <InfoBanner />
          <div className="flex items-center gap-6 text-[13px] text-[#424242]">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="invite-mode" checked={mode === "individual"} onChange={() => setMode("individual")} />
              Individual Invite
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="invite-mode" checked={mode === "bulk"} onChange={() => setMode("bulk")} />
              Bulk Invite
            </label>
          </div>
          <div className="border rounded-lg border-[#E6E6E6] p-3">
            <div className="text-[13px] font-semibold text-[#424242]">New Staff Members</div>
            <div className="mt-2 flex flex-col gap-3">
              {rows.map((row) => (
                <div key={row.id} className="relative grid grid-cols-1 gap-3">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="absolute right-0 -top-1 text-gray-400 hover:text-gray-600"
                    title="Remove"
                    aria-label="Remove row"
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                  <Field label="Full Name" required>
                    <TextInput
                      placeholder="Enter staff full name"
                      value={row.fullName}
                      onChange={(e) => onChangeRow(row.id, "fullName", e.target.value)}
                    />
                  </Field>
                  <Field label="Email Address" required>
                    <TextInput
                      type="email"
                      placeholder="staff@clinic.com"
                      value={row.email}
                      onChange={(e) => onChangeRow(row.id, "email", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone Number" required>
                    <TextInput
                      placeholder="Enter phone number"
                      value={row.phone}
                      onChange={(e) => onChangeRow(row.id, "phone", e.target.value)}
                    />
                  </Field>
                  <Field label="Position" required>
                    <TextInput
                      placeholder="Enter User Job Role"
                      value={row.position}
                      onChange={(e) => onChangeRow(row.id, "position", e.target.value)}
                    />
                  </Field>
                  <Field label="Assign Roles" required>
                    <Select
                      value={row.roleId}
                      onChange={(e) => onChangeRow(row.id, "roleId", e.target.value)}
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      {roleOptions.length === 0 ? (
                        <option value="" disabled>
                          Loading roles…
                        </option>
                      ) : (
                        roleOptions.map((r, idx) => (
                          <option key={idx} value={r.id}>
                            {r.name}
                          </option>
                        ))
                      )}
                    </Select>
                  </Field>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <button onClick={addRow} className="text-[13px] font-medium text-[#2F66F6] hover:text-[#1e4cd8]">
              Add More Staff Members
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
