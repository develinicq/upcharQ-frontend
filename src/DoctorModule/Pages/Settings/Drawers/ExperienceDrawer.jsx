import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import RichTextBox from "@/components/GeneralDrawer/RichTextBox";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
const calendarBlackPath = '/Doctor_module/settings/calendar.png';
import { ChevronDown } from "lucide-react";
import { addExperience, updateExperience } from "@/services/settings/experienceService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";


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

export default function ExperienceDrawer({ open, onClose, initial = {}, mode = "add", onSave }) {

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
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [hospitalOpen, setHospitalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const isDirty = useMemo(() => {
    const norm = (v) => (v ?? "");
    const initialJob = norm(initial?.jobTitle);
    const initialEmp = norm(initial?.employmentType);
    const initialHosp = norm(initial?.hospitalOrClinicName);
    const initialCurr = Boolean(initial?.isCurrentlyWorking);
    const initialStart = formatDateForInput(initial?.startDate);
    const initialEnd = formatDateForInput(initial?.endDate);
    const initialDesc = norm(initial?.description);

    return (
      norm(data.jobTitle) !== initialJob ||
      norm(data.employmentType) !== initialEmp ||
      norm(data.hospitalOrClinicName) !== initialHosp ||
      data.isCurrentlyWorking !== initialCurr ||
      data.startDate !== initialStart ||
      (!data.isCurrentlyWorking && data.endDate !== initialEnd) ||
      norm(data.description) !== initialDesc
    );
  }, [data, initial]);

  const isValid = useMemo(() => {
    return Boolean(
      data.jobTitle?.trim() &&
      data.employmentType?.trim() &&
      data.hospitalOrClinicName?.trim() &&
      data.startDate &&
      (data.isCurrentlyWorking || data.endDate)
    );
  }, [data]);

  function validate() {
    const e = {};
    if (!data.jobTitle?.trim()) e.jobTitle = "Job Title is required";
    if (!data.employmentType?.trim()) e.employmentType = "Employment Type is required";
    if (!data.hospitalOrClinicName?.trim()) e.hospitalOrClinicName = "Hospital or Clinic Name is required";
    if (!data.startDate) e.startDate = "Start Date is required";
    if (!data.isCurrentlyWorking && !data.endDate) e.endDate = "Till Date is required";
    if (data.startDate && data.endDate && !data.isCurrentlyWorking) {
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
    const basePayload = {
      jobTitle: data.jobTitle,
      employmentType: data.employmentType,
      hospitalOrClinicName: data.hospitalOrClinicName,
      isCurrentlyWorking: data.isCurrentlyWorking,
      startDate: data.startDate,
      endDate: data.isCurrentlyWorking ? null : data.endDate,
      description: data.description || null,
    };

    try {
      setSaving(true);
      if (mode === "edit" && initial?.id) {
        // Build diff
        const diff = {};
        const pushIf = (k, n, o) => { if ((n ?? "") !== (o ?? "")) diff[k] = n; };
        pushIf("jobTitle", basePayload.jobTitle, initial.jobTitle);
        pushIf("employmentType", basePayload.employmentType, initial.employmentType);
        pushIf("hospitalOrClinicName", basePayload.hospitalOrClinicName, initial.hospitalOrClinicName);
        if (basePayload.isCurrentlyWorking !== Boolean(initial.isCurrentlyWorking)) {
          diff.isCurrentlyWorking = basePayload.isCurrentlyWorking;
        }
        pushIf("startDate", basePayload.startDate, formatDateForInput(initial.startDate));
        if (!basePayload.isCurrentlyWorking) {
          pushIf("endDate", basePayload.endDate, formatDateForInput(initial.endDate));
        } else {
          diff.endDate = null;
        }
        pushIf("description", basePayload.description, initial.description);

        if (Object.keys(diff).length === 0) {
          onClose?.();
          return;
        }

        const res = await updateExperience({ id: initial.id, ...diff });
        addToast({ title: "Updated", message: res?.message || "Experience updated successfully", type: "success" });
        onSave?.(res?.data || { ...initial, ...diff });
      } else {
        const res = await addExperience(basePayload);
        addToast({ title: "Added", message: res?.message || "Experience added successfully", type: "success" });
        onSave?.(res?.data || basePayload);
      }
      onClose?.();
    } catch (e) {
      addToast({ title: "Error", message: e?.message || "Failed to save experience", type: "error" });
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
      primaryActionDisabled={saving || !isValid || (mode === 'edit' && !isDirty)}
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
