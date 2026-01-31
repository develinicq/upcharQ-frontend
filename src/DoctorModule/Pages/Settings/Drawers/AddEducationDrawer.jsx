import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown, Info } from "lucide-react";
import useImageUploadStore from "@/store/useImageUploadStore";
import CustomUpload from "@/components/CustomUpload";
import UniversalLoader from "@/components/UniversalLoader";
import useToastStore from "@/store/useToastStore";
import { createEducation, updateEducation } from "@/services/settings/educationService";

/**
 * AddEducationDrawer — Add/Edit Education with dropdowns and file upload
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSave: (data) => void // data shape: { school, gradType, degree, field, start, end, proof }
 * - mode: 'add' | 'edit'
 * - initial: object // when editing; { school, gradType, degree, field, start, end, proof }
 */
export default function AddEducationDrawer({ open, onClose, onSave, mode = "add", initial = {} }) {
  const [school, setSchool] = useState("");
  const [gradType, setGradType] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [proofKey, setProofKey] = useState("");
  const [proofName, setProofName] = useState("");
  const [saving, setSaving] = useState(false);

  // Dropdown states
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [gradOpen, setGradOpen] = useState(false);
  const [degreeOpen, setDegreeOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);

  const { getUploadUrl, isLoading: uploading, error: uploadError, reset } = useImageUploadStore();

  // Prefill on open/edit
  useEffect(() => {
    if (!open) return;
    setSchool(initial?.school || "");
    setGradType(initial?.gradType || "");
    setDegree(initial?.degree || "");
    setField(initial?.field || "");
    setStart(initial?.start || "");
    setEnd(initial?.end || "");
    setProofKey(initial?.proof || "");
    setProofName(initial?.proof ? (typeof initial.proof === 'string' ? initial.proof.split('/').pop() : "Uploaded File") : "");
  }, [open, initial]);

  const canSave = Boolean(school && gradType && degree && start && end);

  // Disable Update when nothing changed in edit mode
  const isDirty = useMemo(() => {
    const norm = (v) => (v ?? "");
    const initialSchool = norm(initial?.school);
    const initialGrad = norm(initial?.gradType);
    const initialDegree = norm(initial?.degree);
    const initialField = norm(initial?.field);
    const initialStart = norm(initial?.start);
    const initialEnd = norm(initial?.end);
    const initialProof = norm(initial?.proof);
    return (
      norm(school) !== initialSchool ||
      norm(gradType) !== initialGrad ||
      norm(degree) !== initialDegree ||
      norm(field) !== initialField ||
      norm(start) !== initialStart ||
      norm(end) !== initialEnd ||
      norm(proofKey || initial?.proof || "") !== initialProof
    );
  }, [school, gradType, degree, field, start, end, proofKey, initial]);

  // Suggestions (can be later sourced from API)
  const schoolOptions = useMemo(
    () => [
      "AIIMS New Delhi",
      "KEM Hospital, Mumbai",
      "BJ Medical College, Pune",
      "Grant Medical College, Mumbai",
      "GMC Nagpur",
    ],
    []
  );

  const gradTypeOptions = useMemo(
    () => [
      { label: "Graduation", value: "UG" },
      { label: "Post-Graduation", value: "PG" },
      { label: "Fellowship", value: "Fellowship" },
    ],
    []
  );

  const degreeOptions = useMemo(
    () => [
      "MBBS",
      "MD",
      "MS",
      "DNB",
      "DM",
      "MCh",
      "BDS",
      "MDS",
    ],
    []
  );

  const fieldOptions = useMemo(
    () => [
      "General Medicine",
      "Pediatrics",
      "Orthopedics",
      "Gynecology",
      "Cardiology",
      "Dermatology",
    ],
    []
  );

  const onUploadFile = async (file) => {
    if (!file) return;
    try {
      reset();
      const info = await getUploadUrl(file.type, file);
      if (!info?.uploadUrl || !info?.key) return;
      // Upload to storage
      await fetch(info.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setProofKey(info.key);
      setProofName(file.name);
    } catch (e) {
      console.error("Upload failed", e);
    }
  };

  const save = async () => {
    if (!canSave) return;
    const { addToast } = useToastStore.getState();
    const basePayload = {
      instituteName: school,
      graduationType: gradType, // expects 'UG' | 'PG' | 'Fellowship'
      degree,
      fieldOfStudy: field || "",
      startYear: Number(start),
      completionYear: Number(end),
      proofDocumentUrl: proofKey || initial?.proof || "",
    };

    try {
      setSaving(true);
      if (mode === "edit" && initial?.id) {
        // Build partial payload with only changed fields
        const norm = (v) => (v ?? "");
        const diffPayload = {};
        const pushIfChanged = (key, newVal, oldVal) => {
          if (norm(newVal) !== norm(oldVal)) diffPayload[key] = newVal;
        };
        pushIfChanged("instituteName", basePayload.instituteName, initial?.school);
        pushIfChanged("graduationType", basePayload.graduationType, initial?.gradType);
        pushIfChanged("degree", basePayload.degree, initial?.degree);
        pushIfChanged("fieldOfStudy", basePayload.fieldOfStudy, initial?.field);
        pushIfChanged("startYear", basePayload.startYear, Number(initial?.start));
        pushIfChanged("completionYear", basePayload.completionYear, Number(initial?.end));
        pushIfChanged("proofDocumentUrl", basePayload.proofDocumentUrl, initial?.proof);

        const res = await updateEducation({ id: initial.id, ...diffPayload });
        addToast({ title: "Updated", message: res?.message || "Educational detail updated", type: "success" });
        onSave?.(res?.data || { ...initial, ...diffPayload });
        onClose?.();
      } else {
        const res = await createEducation(basePayload);
        addToast({ title: "Added", message: res?.message || "Educational detail added", type: "success" });
        onSave?.(res?.data || basePayload);
        onClose?.();
      }
    } catch (err) {
      const msg = err?.message || (mode === "edit" ? "Failed to update education" : "Failed to add education");
      addToast({ title: mode === "edit" ? "Update failed" : "Add failed", message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Education" : "Add Education"}
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
      <div className="flex flex-col gap-3.5">
        {/* School/College/University */}
        <div className="relative">
          <InputWithMeta
            label="School/College/ University"
            requiredDot
            value={school}
            onChange={setSchool}
            placeholder="Select or Enter Institute Name"
            RightIcon={ChevronDown}
            onFieldOpen={() => setSchoolOpen((o) => !o)}
            dropdownOpen={schoolOpen}
            onRequestClose={() => setSchoolOpen(false)}
          />
          <Dropdown
            open={schoolOpen}
            onClose={() => setSchoolOpen(false)}
            items={schoolOptions.map((s) => ({ label: s, value: s }))}
            selectedValue={school}
            onSelect={(it) => {
              setSchool(it.value);
              setSchoolOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        {/* Graduation Type */}
        <div className="relative">
          <InputWithMeta
            label="Graduation Type"
            requiredDot
            value={gradType}
            onChange={() => { }}
            placeholder="Select Type"
            RightIcon={ChevronDown}
            onFieldOpen={() => setGradOpen((o) => !o)}
            dropdownOpen={gradOpen}
            onRequestClose={() => setGradOpen(false)}
            readonlyWhenIcon
          />
          <Dropdown
            open={gradOpen}
            onClose={() => setGradOpen(false)}
            items={gradTypeOptions.map((g) => ({ label: g.label, value: g.value }))}
            selectedValue={gradType}
            onSelect={(it) => {
              setGradType(it.value);
              setGradOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        {/* Degree */}
        <div className="relative">
          <InputWithMeta
            label="Degree"
            requiredDot
            value={degree}
            onChange={setDegree}
            placeholder="Select or Enter Degree"
            RightIcon={ChevronDown}
            onFieldOpen={() => setDegreeOpen((o) => !o)}
            dropdownOpen={degreeOpen}
            onRequestClose={() => setDegreeOpen(false)}
          />
          <Dropdown
            open={degreeOpen}
            onClose={() => setDegreeOpen(false)}
            items={degreeOptions.map((d) => ({ label: d, value: d }))}
            selectedValue={degree}
            onSelect={(it) => {
              setDegree(it.value);
              setDegreeOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        {/* Field of Study */}
        <div className="relative">
          <InputWithMeta
            label="Field Of Study"
            value={field}
            onChange={setField}
            placeholder="Select or Enter your Field of Study"
            RightIcon={ChevronDown}
            onFieldOpen={() => setFieldOpen((o) => !o)}
            dropdownOpen={fieldOpen}
            onRequestClose={() => setFieldOpen(false)}
          />
          <Dropdown
            open={fieldOpen}
            onClose={() => setFieldOpen(false)}
            items={fieldOptions.map((f) => ({ label: f, value: f }))}
            selectedValue={field}
            onSelect={(it) => {
              setField(it.value);
              setFieldOpen(false);
            }}
            anchorClassName="w-full h-0"
            className="input-meta-dropdown w-full"
          />
        </div>

        {/* Years */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputWithMeta
            label="Start Year"
            requiredDot
            value={start}
            onChange={(v) => setStart(v.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="2020"
          />
          <InputWithMeta
            label="Year of Completion"
            requiredDot
            value={end}
            onChange={(v) => setEnd(v.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="2024"
          />
        </div>

        {/* Upload Proof */}
        {proofKey || initial?.proof ? (
          <CustomUpload
            label="Upload Proof"
            compulsory
            meta={uploadError ? uploadError : "Support Size upto 1MB in .png, .jpg, .svg, .webp"}
            uploadedKey={proofKey || initial?.proof}
            fileName={proofName}
            onUpload={(key, name) => { setProofKey(key); setProofName(name); }}
          />
        ) : (
          <CustomUpload
            label="Upload Proof"
            variant="box"
            fullWidth
            compulsory
            meta={uploadError ? uploadError : "Support Size upto 1MB in .png, .jpg, .svg, .webp"}
            uploadedKey={proofKey}
            fileName={proofName}
            onUpload={(key, name) => { setProofKey(key); setProofName(name); }}
          />
        )}
      </div>
    </GeneralDrawer>
  );
}
