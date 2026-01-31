import React, { useEffect, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import calendarWhite from "/Doctor_module/sidebar/calendar_white.png";
import UniversalLoader from "@/components/UniversalLoader";
import useToastStore from "@/store/useToastStore";
import { addDoctorPublicationForSuperAdmin, updateDoctorPublicationForSuperAdmin } from "@/services/doctorService";

/**
 * AddPublicationDrawer — Add/Edit Publication form
 * Props:
 * - open, onClose
 * - onSave: ({ title, publisher, date, url, desc }) => void
 * - mode: 'add' | 'edit'
 * - initial: optional initial values for edit
 */
export default function AddPublicationDrawer({ open, onClose, onSave, mode = "add", initial = {}, doctorId }) {
  useEffect(() => {
    console.log("[AddPublicationDrawer] open prop:", open);
  }, [open]);
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Detect changes vs initial to gate Update button
  const isDirty = React.useMemo(() => {
    const norm = (v) => (v ?? "");
    const iTitle = norm(initial?.title);
    const iPublisher = norm(initial?.publisher);
    const iDate = norm(initial?.date || (initial?.publicationDate ? initial.publicationDate.split("T")[0] : ""));
    const iUrl = norm(initial?.url || initial?.publicationUrl);
    const iDesc = norm(initial?.desc || initial?.description);
    return (
      norm(title) !== iTitle ||
      norm(publisher) !== iPublisher ||
      norm(date) !== iDate ||
      norm(url) !== iUrl ||
      norm(desc) !== iDesc
    );
  }, [title, publisher, date, url, desc, initial]);

  useEffect(() => {
    if (!open) return;
  console.log("[AddPublicationDrawer] initializing with initial:", initial);
    setTitle(initial?.title || "");
    setPublisher(initial?.publisher || "");
    setDate(initial?.date || (initial?.publicationDate ? initial.publicationDate.split("T")[0] : ""));
    setUrl(initial?.url || initial?.publicationUrl || "");
    setDesc(initial?.desc || initial?.description || "");
    setShowCalendar(false);
  }, [open, initial]);

  const canSave = Boolean(title && publisher && date);

  const save = async () => {
    if (!canSave) return;
    const { addToast } = useToastStore.getState();
    if (!doctorId) {
      addToast({ title: "Missing doctorId", message: "Cannot add publication.", type: "error" });
      return;
    }
    const base = {
      title,
      publisher,
      publicationDate: date,
      publicationUrl: url || "",
      description: desc || "",
    };
    try {
      setSaving(true);
      if (mode === 'edit') {
        // Build partial diff payload
        const norm = (v) => (v ?? "");
        const diff = { id: initial?.id };
        const push = (key, newVal, oldVal) => { if (norm(newVal) !== norm(oldVal)) diff[key] = newVal; };
        push('title', base.title, initial?.title);
        push('publisher', base.publisher, initial?.publisher);
        push('publicationDate', base.publicationDate, (initial?.publicationDate ? initial.publicationDate.split('T')[0] : initial?.date || ""));
        push('publicationUrl', base.publicationUrl, initial?.publicationUrl || initial?.url);
        push('description', base.description, initial?.description || initial?.desc);
        const res = await updateDoctorPublicationForSuperAdmin(doctorId, diff);
        addToast({ title: "Updated", message: res?.message || "Publication updated", type: "success" });
        onSave?.(res?.data || diff);
        onClose?.();
      } else {
        const res = await addDoctorPublicationForSuperAdmin(doctorId, base);
        addToast({ title: "Added", message: res?.message || "Publication added", type: "success" });
        onSave?.(res?.data || base);
        onClose?.();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to add publication";
      addToast({ title: "Add failed", message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Publication" : "Add Publication"}
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
          label="Title"
          requiredDot
          value={title}
          onChange={setTitle}
          placeholder="Enter Title"
        />
        <InputWithMeta
          label="Publication / Publisher"
          requiredDot
          value={publisher}
          onChange={setPublisher}
          placeholder="Enter Publication"
        />

        {/* Publication Date with calendar icon and dropdown */}
        <div className="relative">
          <InputWithMeta
            label="Publication Date"
            requiredDot
            value={date}
            onChange={setDate}
            placeholder="Select Date"
            RightIcon='/Doctor_module/settings/calendar.png'
            onIconClick={() => setShowCalendar((v) => !v)}
            dropdownOpen={showCalendar}
            onRequestClose={() => setShowCalendar(false)}
            readonlyWhenIcon={true}
          />
          {showCalendar && (
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
                  setShowCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        <InputWithMeta
          label="Publication URL"
          value={url}
          onChange={setUrl}
          placeholder="Paste Publication URL"
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
