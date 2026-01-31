import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import { fetchAllPermissions } from "@/services/rbac/permissionService";
import { createRole } from "@/services/rbac/roleService";

export default function RoleDrawer({ open, onClose, onCreated }) {
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [grouped, setGrouped] = useState({}); // { module: [{id,name,description}] }
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchAllPermissions();
        const gp = res?.data?.groupedPermissions;
        const list = res?.data?.permissions;
        let groupedPerms = gp;
        if (!groupedPerms && Array.isArray(list)) {
          groupedPerms = list.reduce((acc, p) => {
            const key = p.module || p.category || "General";
            acc[key] = acc[key] || [];
            acc[key].push(p);
            return acc;
          }, {});
        }
        setGrouped(groupedPerms || {});
      } catch (e) {
        setError(e?.message || e?.error || "Failed to load permissions");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const requestClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 220);
  };

  const togglePerm = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAllInGroup = (groupKey, enable) => {
    const ids = (grouped[groupKey] || []).map((p) => p.id);
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (enable ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const canCreate = name.trim().length > 0 && selected.size > 0;

  const CheckboxWithLabel = ({ label, checked, onChange }) => (
    <InputWithMeta label=" " showInput={false}>
      <label className="inline-flex items-start gap-2 cursor-pointer text-[12px] text-[#424242]">
    <input
      type="checkbox"
      className=" peer sr-only  "
      checked={checked}
      onChange={onChange}
  
    />
  
    <span className="w-4 h-4 mt-1 rounded-sm border border-gray-400 flex items-center justify-center
                     peer-checked:bg-blue-600 peer-checked:border-blue-600">
      <svg
        className="hidden peer-checked:block w-3 h-3 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.414a1 1 0 011.414-1.414l3.05 3.05 6.657-6.657a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  
    <span className="text-xs text-secondary-grey400">{label}</span>
  </label>
  
    </InputWithMeta>
  );

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      const permissionIds = Array.from(selected);
      const res = await createRole({
        name: name.trim(),
        description: desc.trim(),
        permissions: permissionIds,
      });
      onCreated?.(res?.data);
      requestClose();
    } catch (e) {
      alert(e?.message || "Failed to create role");
    }
  };

  if (!open && !closing) return null;

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={requestClose}
      title="Create User Role"
      onPrimaryAction={handleCreate}
      primaryActionLabel="Create"
      primaryActionDisabled={!canCreate}
      width={600}
    >
      <div className="flex flex-col ">
        <div className="flex flex-col gap-3">
            <InputWithMeta
          label="Role Name"
          requiredDot
          placeholder="Enter staff full name"
          value={name}
          onChange={setName}
        />
        <InputWithMeta
          label="Description"
          placeholder="Describe the role"
          value={desc}
          onChange={setDesc}
        />

        <InputWithMeta
          label="Permissions"
          requiredDot
          showInput={false}
          
        />
        </div>
        
        {loading && <div className="text-[12px] text-secondary-grey200">Loading permissions…</div>}
        {error && <div className="text-[12px] text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="flex flex-col gap-2">
            {Object.entries(grouped).map(([key, perms]) => {
              const groupIds = perms.map((p) => p.id);
              const allSelected = groupIds.every((id) => selected.has(id));
              return (
                <div key={key} className="border border-secondary-grey100 rounded-md py-2 px-3 pb-3 flex flex-col gap-[6px]">

                  <div className="flex items-center justify-between ">
                    <div className="font-medium text-[14px] text-secondary-grey300">{key}</div>
                    <div className="">
                      <CheckboxWithLabel
                        label={(
                          <div className=" mt-1 text-[12px] text-secondary-grey300">Select All</div>
                        )}
                        checked={allSelected}
                        onChange={(e) => selectAllInGroup(key, e.target.checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {perms.map((p) => (
                      <div key={p.id} className="text-[12px] text-secondary-grey400">
                        <CheckboxWithLabel
                          label={(
                            <div>
                              <div className="font-medium text-secondary-grey400">{p.name}</div>
                              {p.description && (
                                <div className="text-secondary-grey200">{p.description}</div>
                              )}
                            </div>
                          )}
                          checked={selected.has(p.id)}
                          onChange={() => togglePerm(p.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GeneralDrawer>
  );
}
