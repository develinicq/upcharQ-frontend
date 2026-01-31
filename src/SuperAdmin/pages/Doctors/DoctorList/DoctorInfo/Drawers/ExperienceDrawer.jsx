import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
const calendarBlackPath = '/Doctor_module/settings/calendar.png';
import { ChevronDown } from "lucide-react";
import UniversalLoader from "@/components/UniversalLoader";
import useToastStore from "@/store/useToastStore";
import { addDoctorExperienceForSuperAdmin, updateDoctorExperienceForSuperAdmin } from "@/services/doctorService";


// Local checkbox-with-label row used inside this drawer
const CheckboxWithLabel = ({ label, checked, onChange }) => (
  <InputWithMeta label=" " showInput={false}>
    <label className="inline-flex items-center gap-2 cursor-pointer text-[12px] text-[#424242]">
  <input
    type="checkbox"
    className="peer sr-only"
    checked={checked}
    onChange={onChange}
  />

  <span className="w-5 h-5 rounded-md border border-gray-400 flex items-center justify-center
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

  <span className="text-sm text-secondary-grey300">{label}</span>
</label>

  </InputWithMeta>
);

export default function ExperienceDrawer({ open, onClose, initial = {}, mode = "add", onSave, doctorId }) {
  
  const [data, setData] = useState({
    jobTitle: "",
    employmentType: "",
    hospitalOrClinicName: "",
    isCurrentlyWorking: false,
    startDate: "",
    endDate: "",
    endCurrentPositionNote: "",
    description: "",
  });
  const [typeOpen, setTypeOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const hospitalOptions = useMemo(
    () => [
      "Chauhan Clinic",
      "City Hospital",
      "General Hospital",
      "Sunrise Clinic",
      "Metro Care Center",
    ],
    []
  );
  const formatDateForInput = (value) =>
  value ? new Date(value).toISOString().split("T")[0] : "";


  useEffect(() => {
    if (open) {
      const init = initial || {};
      setData({
        jobTitle: init.jobTitle || "",
        employmentType: init.employmentType || "",
        hospitalOrClinicName: init.hospitalOrClinicName || "",
        isCurrentlyWorking: Boolean(init.isCurrentlyWorking),
        startDate: formatDateForInput(init.startDate),
        endDate: formatDateForInput(init.endDate),

        endCurrentPositionNote:
          init.endCurrentPositionNote || init.currentPositionNote || "",
        description: init.description || "",
      });
      setErrors({});
    }
  }, [open, initial]);

  const canSave = useMemo(() => {
    const init = initial || {};
    const initialData = {
      jobTitle: init.jobTitle || "",
      employmentType: init.employmentType || "",
      hospitalOrClinicName: init.hospitalOrClinicName || "",
      isCurrentlyWorking: Boolean(init.isCurrentlyWorking),
      startDate: formatDateForInput(init.startDate),
      endDate: formatDateForInput(init.endDate),
      endCurrentPositionNote: init.endCurrentPositionNote || init.currentPositionNote || "",
      description: init.description || "",
    };

    return (
      (data.jobTitle || "").trim() !== (initialData.jobTitle || "").trim() ||
      (data.employmentType || "").trim() !== (initialData.employmentType || "").trim() ||
      (data.hospitalOrClinicName || "").trim() !== (initialData.hospitalOrClinicName || "").trim() ||
      Boolean(data.isCurrentlyWorking) !== Boolean(initialData.isCurrentlyWorking) ||
      (data.startDate || "").trim() !== (initialData.startDate || "").trim() ||
      (data.endDate || "").trim() !== (initialData.endDate || "").trim() ||
      (data.endCurrentPositionNote || "").trim() !== (initialData.endCurrentPositionNote || "").trim() ||
      (data.description || "").trim() !== (initialData.description || "").trim()
    );
  }, [data, initial]);

  const title = useMemo(
    () => (mode === "edit" ? "Edit Experience" : "Add Experience"),
    [mode]
  );

  // Meta schema for rendering
  const fields = [
    { key: "jobTitle", label: "Job Title", type: "text", required: true, placeholder: "Select or Enter Job Title" },
    { key: "employmentType", label: "Employment Type", type: "select", required: true, options: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"], placeholder: "Select Type" },
    { key: "hospitalOrClinicName", label: "Hospital or Clinic Name", type: "text", required: true, placeholder: "Select or Enter Hospital or Clinic Name" },
    { key: "isCurrentlyWorking", label: "I am currently working in this role", type: "checkbox" },
    { key: "startDate", label: "Start Date", type: "date", required: true },
    { key: "endDate", label: "Till Date", type: "date", dependsOn: "isCurrentlyWorking" },
    { key: "endCurrentPositionNote", label: "End current position as of now", type: "checkbox-note" },
    { key: "description", label: "Description", type: "textarea", maxLength: 1600, placeholder: "List your Duties, Highlights and Achievements" },
  ];

  function validate() {
    const e = {};
    if (!data.jobTitle?.trim()) e.jobTitle = "Job Title is required";
    if (!data.employmentType?.trim()) e.employmentType = "Employment Type is required";
    if (!data.hospitalOrClinicName?.trim()) e.hospitalOrClinicName = "Hospital or Clinic Name is required";
    if (!data.startDate) e.startDate = "Start Date is required";
    if (!data.isCurrentlyWorking && !data.endDate) e.endDate = "Till Date is required";
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate);
      const t = new Date(data.endDate);
      if (t < s) e.endDate = "Till Date cannot be before Start Date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    const { addToast } = useToastStore.getState();
    if (!doctorId) {
      addToast({ title: "Missing doctorId", message: "Cannot save experience.", type: "error" });
      return;
    }
    const base = { ...data };
    if (base.isCurrentlyWorking) base.endDate = "";
    try {
      setSaving(true);
      if (mode === 'edit') {
        // Build partial diff payload
        const norm = (v) => (v ?? "");
        const diff = { id: initial?.id };
        const push = (key, newVal, oldVal) => { if (norm(newVal) !== norm(oldVal)) diff[key] = newVal; };
        push('jobTitle', base.jobTitle, initial?.jobTitle);
        push('employmentType', base.employmentType, initial?.employmentType);
        push('hospitalOrClinicName', base.hospitalOrClinicName, initial?.hospitalOrClinicName);
        push('isCurrentlyWorking', Boolean(base.isCurrentlyWorking), Boolean(initial?.isCurrentlyWorking));
        push('startDate', base.startDate, (initial?.startDate ? initial.startDate.split('T')[0] : ""));
        push('endDate', base.endDate, (initial?.endDate ? initial.endDate.split('T')[0] : ""));
        push('description', base.description, initial?.description);
        const res = await updateDoctorExperienceForSuperAdmin(doctorId, diff);
        addToast({ title: "Updated", message: res?.message || "Experience updated", type: "success" });
        onSave?.(res?.data || diff);
        onClose?.();
      } else {
        const res = await addDoctorExperienceForSuperAdmin(doctorId, base);
        addToast({ title: "Added", message: res?.message || "Experience added", type: "success" });
        onSave?.(res?.data || base);
        onClose?.();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || (mode === 'edit' ? "Failed to update experience" : "Failed to add experience");
      addToast({ title: mode === 'edit' ? "Update failed" : "Add failed", message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  }


  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title={title}
      primaryActionLabel={saving ? (
        <div className="flex items-center gap-2">
          <UniversalLoader size={16} style={{ width: 'auto', height: 'auto' }} />
          <span>{mode === 'edit' ? 'Updating...' : 'Saving...'}</span>
        </div>
      ) : (mode === 'edit' ? "Update" : "Save")}
      onPrimaryAction={handleSave}
      primaryActionDisabled={saving || !canSave}
      width={600}
    >
      <div className="flex flex-col gap-3">
        <InputWithMeta
          label="Job Title"
          requiredDot
          value={data.jobTitle}
          onChange={(v) => setData((d) => ({ ...d, jobTitle: v }))}
          placeholder="Select or Enter Job Title"
        />

        <div className="relative">
          <InputWithMeta
            label="Employment Type"
            requiredDot
            value={data.employmentType}
            onChange={(v) => setData((d) => ({ ...d, employmentType: v }))}
            placeholder="Select Type"
            RightIcon={ChevronDown}
            onFieldOpen={() => setTypeOpen((o) => !o)}
            dropdownOpen={typeOpen}
            onRequestClose={() => setTypeOpen(false)}
          />
          <Dropdown
            open={typeOpen}
            onClose={() => setTypeOpen(false)}
            items={["Full-time", "Part-time", "Contract", "Internship", "Freelance"].map((t) => ({ label: t, value: t }))}
            selectedValue={data.employmentType}
            onSelect={(it) => {
              setData((d) => ({ ...d, employmentType: it.value }));
              setTypeOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        <div className="relative">
          <InputWithMeta
            label="Hospital or Clinic Name"
            requiredDot
            value={data.hospitalOrClinicName}
            onChange={(v) => setData((d) => ({ ...d, hospitalOrClinicName: v }))}
            placeholder="Select or Enter Hospital or Clinic Name"
            RightIcon={ChevronDown}
            onFieldOpen={() => setHospitalOpen((o) => !o)}
            dropdownOpen={hospitalOpen}
            onRequestClose={() => setHospitalOpen(false)}
          />
          <Dropdown
            open={hospitalOpen}
            onClose={() => setHospitalOpen(false)}
            items={hospitalOptions.map((h) => ({ label: h, value: h }))}
            selectedValue={data.hospitalOrClinicName}
            onSelect={(it) => {
              setData((d) => ({ ...d, hospitalOrClinicName: it.value }));
              setHospitalOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        <CheckboxWithLabel
          label="I am currently working in this role"
          checked={data.isCurrentlyWorking}
          onChange={(e) => setData((d) => ({ ...d, isCurrentlyWorking: e.target.checked }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <InputWithMeta
              key={`start-${data.startDate || ''}`}
              label="Start Date"
              requiredDot
              value={data.startDate}
              onChange={(v) => setData((d) => ({ ...d, startDate: v }))}
              placeholder="Select Date"
              RightIcon={calendarBlackPath}
              onIconClick={() => setShowStartCalendar((v) => !v)}
              onFieldOpen={() => setShowStartCalendar((v) => !v)}
              dropdownOpen={showStartCalendar}
              onRequestClose={() => setShowStartCalendar(false)}
              readonlyWhenIcon
            />
            {showStartCalendar && (
              <div className="shadcn-calendar-dropdown absolute z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                <ShadcnCalendar
                  mode="single"
                  selected={data.startDate ? new Date(data.startDate) : undefined}
                  onSelect={(d) => {
                    if (!d) return;
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                    const dd = String(d.getDate()).padStart(2, "0");
                    setData((prev) => ({ ...prev, startDate: `${yyyy}-${mm}-${dd}` }));
                    setShowStartCalendar(false);
                  }}
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  className="rounded-lg p-1"
                  classNames={{ day_selected: "bg-blue-600 text-white hover:bg-blue-600" }}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <InputWithMeta
              key={`end-${data.endDate || ''}`}
              label="Till Date"
              requiredDot={!data.isCurrentlyWorking}
              value={data.endDate}
              onChange={(v) => setData((d) => ({ ...d, endDate: v }))}
              placeholder="Select Date"
              disabled={data.isCurrentlyWorking}
              RightIcon={calendarBlackPath}
              onIconClick={() => !data.isCurrentlyWorking && setShowEndCalendar((v) => !v)}
              onFieldOpen={() => !data.isCurrentlyWorking && setShowEndCalendar((v) => !v)}
              dropdownOpen={showEndCalendar}
              onRequestClose={() => setShowEndCalendar(false)}
              readonlyWhenIcon
            />
            {showEndCalendar && !data.isCurrentlyWorking && (
              <div className="shadcn-calendar-dropdown absolute z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                <ShadcnCalendar
                  mode="single"
                  selected={data.endDate ? new Date(data.endDate) : undefined}
                  onSelect={(d) => {
                    if (!d) return;
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, "0");
                    const dd = String(d.getDate()).padStart(2, "0");
                    setData((prev) => ({ ...prev, endDate: `${yyyy}-${mm}-${dd}` }));
                    setShowEndCalendar(false);
                  }}
                  captionLayout="dropdown"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  className="rounded-lg p-1"
                  classNames={{ day_selected: "bg-blue-600 text-white hover:bg-blue-600" }}
                />
              </div>
            )}
          </div>
        </div>

        <CheckboxWithLabel
          label={`End current position as of now – ${data.hospitalOrClinicName || "Clinic/Hospital"}`}
          checked={Boolean(data.endCurrentPositionNote)}
          onChange={(e) =>
            setData((d) => ({
              ...d,
              endCurrentPositionNote: e.target.checked ? (d.endCurrentPositionNote || "End current position as of now") : "",
            }))
          }
        />

        <RichTextBox
          label="Description"
          value={data.description}
          onChange={(v) => setData((d) => ({ ...d, description: v.slice(0, 1600) }))}
          placeholder="List your Duties, Highlights and Achievements"
          showCounter
          maxLength={1600}
        />
      </div>
    </GeneralDrawer>
  );
}
