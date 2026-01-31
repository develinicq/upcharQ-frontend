import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown } from "lucide-react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import calendarWhite from "/Doctor_module/sidebar/calendar_white.png";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import UniversalLoader from "@/components/UniversalLoader";
import useToastStore from "@/store/useToastStore";
import { addDoctorAwardForSuperAdmin, updateDoctorAwardForSuperAdmin } from "@/services/doctorService";

/**
 * AddAwardDrawer — Add/Edit Award form matching provided design
 * Props:
 * - open, onClose
 * - onSave: ({ title, issuer, with, date, url, desc }) => void
 * - mode: 'add' | 'edit'
 * - initial: optional initial values for edit
 */
export default function AddAwardDrawer({ open, onClose, onSave, mode = "add", initial = {}, doctorId }) {
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [assoc, setAssoc] = useState("");
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Detect changes vs initial (only matters in edit mode)
  const isDirty = React.useMemo(() => {
    const norm = (v) => (v ?? "");
    const iTitle = norm(initial?.title || initial?.awardName);
    const iIssuer = norm(initial?.issuer || initial?.issuerName);
    const iAssoc = norm(initial?.with || initial?.associatedWith);
    const iDate = norm(initial?.date || (initial?.issueDate ? initial.issueDate.split("T")[0] : ""));
    const iUrl = norm(initial?.url || initial?.awardUrl);
    const iDesc = norm(initial?.desc || initial?.description);
    return (
      norm(title) !== iTitle ||
      norm(issuer) !== iIssuer ||
      norm(assoc) !== iAssoc ||
      norm(date) !== iDate ||
      norm(url) !== iUrl ||
      norm(desc) !== iDesc
    );
  }, [title, issuer, assoc, date, url, desc, initial]);

  const [assocOpen, setAssocOpen] = useState(false);
  const [showIssueCalendar, setShowIssueCalendar] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || initial?.awardName || "");
    setIssuer(initial?.issuer || initial?.issuerName || "");
    setAssoc(initial?.with || initial?.associatedWith || "");
    setDate(initial?.date || (initial?.issueDate ? initial.issueDate.split("T")[0] : ""));
    setUrl(initial?.url || initial?.awardUrl || "");
    setDesc(initial?.desc || initial?.description || "");
    setAssocOpen(false);
  }, [open, initial]);

  const canSave = Boolean(title && issuer && date);

  // Suggestion options for Associated With (can type custom as well)
  const assocOptions = useMemo(
    () => [
      "Department",
      "Hospital",
      "Clinic",
      "University",
      "Conference",
    ],
    []
  );

  const save = async () => {
    if (!canSave) return;
    const { addToast } = useToastStore.getState();
    if (!doctorId) {
      addToast({ title: "Missing doctorId", message: "Cannot add award.", type: "error" });
      return;
    }
    const base = {
      awardName: title,
      issuerName: issuer,
      associatedWith: assoc || "",
      issueDate: date, // YYYY-MM-DD
      awardUrl: url || "",
      description: desc || "",
    };
    try {
      setSaving(true);
      if (mode === 'edit') {
        // Build partial diff payload
        const norm = (v) => (v ?? "");
        const diff = { id: initial?.id };
        const push = (key, newVal, oldVal) => { if (norm(newVal) !== norm(oldVal)) diff[key] = newVal; };
        push('awardName', base.awardName, initial?.awardName || initial?.title);
        push('issuerName', base.issuerName, initial?.issuerName || initial?.issuer);
        push('associatedWith', base.associatedWith, initial?.associatedWith || initial?.with);
        push('issueDate', base.issueDate, (initial?.issueDate ? initial.issueDate.split('T')[0] : initial?.date || ""));
        push('awardUrl', base.awardUrl, initial?.awardUrl || initial?.url);
        push('description', base.description, initial?.description || initial?.desc);
        const res = await updateDoctorAwardForSuperAdmin(doctorId, diff);
        addToast({ title: "Updated", message: res?.message || "Award updated", type: "success" });
        onSave?.(res?.data || diff);
        onClose?.();
      } else {
        const res = await addDoctorAwardForSuperAdmin(doctorId, base);
        addToast({ title: "Added", message: res?.message || "Award added", type: "success" });
        onSave?.(res?.data || base);
        onClose?.();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to add award";
      addToast({ title: "Add failed", message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Award" : "Add Award"}
      primaryActionLabel={saving ? (
        <div className="flex items-center gap-2">
          <UniversalLoader size={16} style={{ width: 'auto', height: 'auto' }} />
          <span>{mode === 'edit' ? 'Updating...' : 'Saving...'}</span>
        </div>
      ) : (mode === 'edit' ? "Update" : "Save")}
  onPrimaryAction={save}
  primaryActionDisabled={saving || !canSave || (mode === 'edit' && !isDirty)}
      width={600}
    >
      <div className="flex flex-col gap-4">
        <InputWithMeta
          label="Award Name"
          requiredDot
          value={title}
          onChange={setTitle}
          placeholder="Enter Award Name"
        />
        <InputWithMeta
          label="Issuer Name"
          requiredDot
          value={issuer}
          onChange={setIssuer}
          placeholder="Enter Issuer Name"
        />

        <div className="relative">
          <InputWithMeta
            label="Associated With"
            value={assoc}
            onChange={setAssoc}
            placeholder="Select or Enter Associated"
            RightIcon={ChevronDown}
            onFieldOpen={() => setAssocOpen((o) => !o)}
            dropdownOpen={assocOpen}
            onRequestClose={() => setAssocOpen(false)}
            // allow typing even when icon present
            readonlyWhenIcon={false}
          />
          <Dropdown
            open={assocOpen}
            onClose={() => setAssocOpen(false)}
            items={assocOptions.map((a) => ({ label: a, value: a }))}
            selectedValue={assoc}
            onSelect={(it) => {
              setAssoc(it.value);
              setAssocOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        {/* Issue Date with calendar icon and dropdown calendar */}
        <div className="relative">
          <InputWithMeta
            label="Issue Date"
            requiredDot
            value={date}
            onChange={setDate}
            placeholder="Select Date"
            RightIcon=
             '/Doctor_module/settings/calendar.png'
            
            onIconClick={() => setShowIssueCalendar((v) => !v)}
            dropdownOpen={showIssueCalendar}
            onRequestClose={() => setShowIssueCalendar(false)}
            readonlyWhenIcon={true}
          />
          {showIssueCalendar && (
            <div className="shadcn-calendar-dropdown absolute right-1 top-full z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
              <ShadcnCalendar
                mode="single"
                selected={date ? new Date(date) : undefined}
                onSelect={(d) => {
                  if (!d) return;
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  setDate(`${yyyy}-${mm}-${dd}`);
                  setShowIssueCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        <InputWithMeta
          label="Award URL"
          value={url}
          onChange={setUrl}
          placeholder="Paste Award URL"
        />

        <RichTextBox
          label="Description"
          value={desc}
          onChange={(v) => setDesc(v.slice(0, 1600))}
          placeholder="List your Duties, Highlights and Achievements"
          showCounter={true}
          maxLength={1600}
        />
      </div>
    </GeneralDrawer>
  );
}
