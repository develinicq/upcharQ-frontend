import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown } from "lucide-react";
import { updateDoctorProfessionalDetailsForSuperAdmin, getDoctorProfessionalDetailsForSuperAdmin } from "@/services/doctorService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";

export default function EditPracticeDetailsDrawer({ open, onClose, initial = {}, onSave, doctorId, onRefetch }) {
  const [data, setData] = useState({
    registrationNumber: "",
    registrationCouncil: "",
    registrationYear: "",
    mrnProof: null,
    mrnProofName: "",
    workExperience: "",
    medicalPracticeType: "",
    practiceArea: [],
    specialties: [], // [{ id?, specialtyName, expYears }]
  });
  const [practiceAreaInput, setPracticeAreaInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [baseline, setBaseline] = useState(null);

  // Dropdown states
  const [typeOpen, setTypeOpen] = useState(false);
  const [specialtyOpenIdx, setSpecialtyOpenIdx] = useState(null);

  useEffect(() => {
    if (open) {
      const initData = {
        registrationNumber: initial?.registrationNumber || "",
        registrationCouncil: initial?.registrationCouncil || "",
        registrationYear: initial?.registrationYear || "",
        mrnProof: initial?.mrnProof || null,
        mrnProofName: initial?.mrnProofName || (initial?.mrnProof ? "MRN Proof.pdf" : ""),
        workExperience: initial?.workExperience ? String(initial.workExperience) : "",
        medicalPracticeType: initial?.medicalPracticeType || "",
        practiceArea: Array.isArray(initial?.practiceArea) ? initial.practiceArea : [],
        specialties: (Array.isArray(initial?.specialties) && initial.specialties.length > 0)
          ? initial.specialties.map((s) => ({
            id: s?.id,
            specialtyName: s?.specialtyName || s?.name || "",
            expYears: s?.expYears !== undefined && s?.expYears !== null ? String(s.expYears) : "",
          }))
          : [{ specialtyName: "", expYears: "" }],
      };
      setData(initData);
      // capture normalized baseline for dirty comparison
      const normalize = (d) => ({
        registrationNumber: (d.registrationNumber || "").trim(),
        registrationCouncil: (d.registrationCouncil || "").trim(),
        registrationYear: (d.registrationYear || "").trim(),
        mrnProofName: (d.mrnProofName || "").trim(),
        workExperience: (d.workExperience || "").trim(),
        medicalPracticeType: (d.medicalPracticeType || "").trim(),
        practiceArea: Array.isArray(d.practiceArea) ? d.practiceArea.slice().sort() : [],
        specialties: Array.isArray(d.specialties)
          ? d.specialties
              .map((s) => ({
                specialtyName: (s.specialtyName || "").trim(),
                expYears: (s.expYears || "").trim(),
              }))
              .filter((s) => s.specialtyName)
          : [],
      });
      setBaseline(normalize(initData));
      setDirty(false);
    }
  }, [open, initial]);

  const practiceTypes = useMemo(() => [
    { label: "Allopathy", value: "Allopathy" },
    { label: "Homeopathy", value: "Homeopathy" },
    { label: "Ayurveda", value: "Ayurveda" },
    { label: "Unani Medicine", value: "Unani Medicine" },
    { label: "Siddha Medicine", value: "Siddha Medicine" },
    { label: "Naturopathy", value: "Naturopathy" },
    { label: "Yoga & Alternative Therapies", value: "Yoga & Alternative Therapies" },
    { label: "Chiropractic", value: "Chiropractic" },
    { label: "Osteopathy", value: "Osteopathy" },
    { label: "Tibetan Medicine", value: "Tibetan Medicine" },
  ], []);

  const specialtyOptions = useMemo(
    () => [
      "General Medicine",
      "Cardiology",
      "Dermatology",
      "Orthopedics",
      "ENT",
      "Neurology",
      "Pediatrics",
      "Gynecology",
      "Ophthalmology",
      "Psychiatry",
      "Physiotherapy",
      "Oncology",
      "Pulmonology",
      "Gastroenterology",
    ].map((x) => ({ label: x, value: x })),
    []
  );

  const areaOptions = useMemo(
    () => [
      "Cough",
      "Cold",
      "Headache",
      "Nausea",
      "Dizziness",
      "Muscle Pain",
      "Sore Throat",
    ],
    []
  );

  const setField = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const setSpecialty = (idx, patch) =>
    setData((d) => ({
      ...d,
      specialties: d.specialties.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const addSpecialty = () =>
    setData((d) => ({
      ...d,
      specialties: [...(d.specialties || []), { specialtyName: "", expYears: "" }],
    }));

  const removeSpecialty = (idx) =>
    setData((d) => ({
      ...d,
      specialties: d.specialties.filter((_, i) => i !== idx),
    }));

  const toggleArea = (a) =>
    setData((d) => ({
      ...d,
      practiceArea: d.practiceArea.includes(a)
        ? d.practiceArea.filter((x) => x !== a)
        : [...d.practiceArea, a],
    }));

  const validate = () => {
    if (!data.registrationNumber) return false;
    if (!data.registrationCouncil) return false;
    if (!data.registrationYear) return false;
    if (!data.workExperience || isNaN(Number(data.workExperience))) return false;
    if (!data.medicalPracticeType) return false;
    return true;
  };

  const buildPartialPayload = () => {
    const payload = {};
    // medicalRegistrationDetails diff
    const mrnPatch = {};
    if (data.registrationNumber !== (initial?.registrationNumber || "")) {
      mrnPatch.medicalCouncilRegistrationNumber = data.registrationNumber;
    }
    if (data.registrationCouncil !== (initial?.registrationCouncil || "")) {
      mrnPatch.registrationCouncil = data.registrationCouncil;
    }
    if (data.registrationYear !== (initial?.registrationYear || "")) {
      mrnPatch.registrationYear = data.registrationYear;
    }
    if (data.mrnProof && data.mrnProof !== initial?.mrnProof) {
      // Assume file upload handled elsewhere and we have a URL; if not, keep name
      mrnPatch.proofDocumentUrl = initial?.proofDocumentUrl || data.mrnProofName;
    }
    if (Object.keys(mrnPatch).length) payload.medicalRegistrationDetails = mrnPatch;

    // practiceDetails diff
    const practicePatch = {};
    const workExpNum = data.workExperience ? Number(data.workExperience) : undefined;
    if (workExpNum !== (initial?.workExperience ?? undefined)) {
      practicePatch.workExperience = workExpNum;
    }
    if (data.medicalPracticeType !== (initial?.medicalPracticeType || "")) {
      practicePatch.medicalPracticeType = data.medicalPracticeType;
    }
    // specialties diffs: compare arrays by name+expYears
    const normSpec = (arr) => (Array.isArray(arr) ? arr.map((s) => ({
      specialtyName: s?.specialtyName || s?.name || "",
      expYears: s?.expYears !== undefined && s?.expYears !== null ? Number(s.expYears) : undefined,
    })) : []);
    const currentSpecs = normSpec(data.specialties);
    const initialSpecs = normSpec(initial.specialties);
    const specsChanged = JSON.stringify(currentSpecs) !== JSON.stringify(initialSpecs);
    if (specsChanged) practicePatch.specialties = currentSpecs.filter(s => s.specialtyName);

    // practiceArea diff
    const currentAreas = Array.isArray(data.practiceArea) ? data.practiceArea : [];
    const initialAreas = Array.isArray(initial.practiceArea) ? initial.practiceArea : [];
    if (JSON.stringify(currentAreas) !== JSON.stringify(initialAreas)) {
      practicePatch.practiceArea = currentAreas;
    }

    if (Object.keys(practicePatch).length) payload.practiceDetails = practicePatch;
    return payload;
  };

  // Recompute dirty state when form changes
  useEffect(() => {
    // recompute dirty: compare normalized current vs baseline
    const normalize = (d) => ({
      registrationNumber: (d.registrationNumber || "").trim(),
      registrationCouncil: (d.registrationCouncil || "").trim(),
      registrationYear: (d.registrationYear || "").trim(),
      mrnProofName: (d.mrnProofName || "").trim(),
      workExperience: (d.workExperience || "").trim(),
      medicalPracticeType: (d.medicalPracticeType || "").trim(),
      practiceArea: Array.isArray(d.practiceArea) ? d.practiceArea.slice().sort() : [],
      specialties: Array.isArray(d.specialties)
        ? d.specialties
            .map((s) => ({
              specialtyName: (s.specialtyName || "").trim(),
              expYears: (s.expYears || "").trim(),
            }))
            .filter((s) => s.specialtyName)
        : [],
    });
    if (!baseline) { setDirty(false); return; }
    const curr = normalize(data);
    setDirty(JSON.stringify(curr) !== JSON.stringify(baseline));
  }, [data, baseline]);

  const handleSave = async () => {
  if (!validate()) return;
  const payload = buildPartialPayload();
  if (!payload.medicalRegistrationDetails && !payload.practiceDetails) {
      onClose?.();
      return;
    }
    try {
      setSaving(true);
      const resp = await updateDoctorProfessionalDetailsForSuperAdmin(doctorId, payload);
      // Close immediately on success and show toast without delay
      onClose?.();
      useToastStore.getState().addToast({
        title: 'Updated',
        message: resp?.message || 'Professional details updated successfully',
        type: 'success',
      });
      onSave?.(payload);
      // Refetch in the background to refresh UI
      (async () => {
        try {
          const fresh = await getDoctorProfessionalDetailsForSuperAdmin(doctorId);
          onRefetch?.(fresh?.data);
        } catch (e) {
          useToastStore.getState().addToast({
            title: 'Refresh failed',
            message: e?.response?.data?.message || e.message || 'Failed to refresh details',
            type: 'warning',
          });
        }
      })();
    } catch (e) {
      useToastStore.getState().addToast({
        title: 'Update failed',
        message: e?.response?.data?.message || e.message || 'Failed to update professional details',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
  <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title="Edit Professional Details"
      primaryActionLabel={saving ? (
        <div className="flex items-center gap-2">
          <UniversalLoader size={16} style={{ width: 'auto', height: 'auto' }} />
          <span>Updating...</span>
        </div>
      ) : "Update"}
  onPrimaryAction={handleSave}
  primaryActionDisabled={!validate() || saving || !dirty}
      width={600}
    >
  <div className="flex flex-col gap-5">
        {/* Medical Registration Details */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[16px] font-medium text-secondary-grey400">Medical Registration Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithMeta
              label="Medical Council Registration Number"
              requiredDot
              value={data.registrationNumber}
              onChange={(v) => setField("registrationNumber", v)}
              placeholder="MCIM789456"
            />

            <div className="relative">
              <InputWithMeta
                label="Registration Council"
                requiredDot
                value={data.registrationCouncil}
                placeholder="Select Council"
                RightIcon={ChevronDown}
                readonlyWhenIcon
                onFieldOpen={() => setTypeOpen((o) => (o === 'council' ? null : 'council'))}
                dropdownOpen={typeOpen === 'council'}
                onRequestClose={() => setTypeOpen(null)}
                dropdownItems={[
                  { label: "Maharashtra Medical Council", value: "Maharashtra Medical Council" },
                  { label: "Delhi Medical Council", value: "Delhi Medical Council" },
                  { label: "Karnataka Medical Council", value: "Karnataka Medical Council" },
                ]}
                selectedValue={data.registrationCouncil}
                onSelectItem={(it) => {
                  setField('registrationCouncil', it.value);
                }}
                itemRenderer={(it, { isSelected }) => (
                  <span className={isSelected ? 'text-blue-600 font-semibold' : ''}>{it.label}</span>
                )}
              />
            </div>

            <InputWithMeta
              label="Registration Year"
              requiredDot
              value={data.registrationYear}
              onChange={(v) => setField("registrationYear", v.replace(/[^0-9]/g, ""))}
              placeholder="2015"
              meta="Visible to Patient"
            />

            <InputWithMeta
              label="Upload MRN Proof"
              infoIcon
              imageUpload
              fileName={data.mrnProofName}
              onFileSelect={(f) => {
                setField("mrnProof", f);
                setField("mrnProofName", f?.name || "");
              }}
              onFileView={() => { }}
              showReupload
              showDivider
              meta="Support Size upto 5MB in .pdf, .jpg, .doc"
            />
          </div>
        </div>

        {/* Practice Details */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[16px] font-medium text-secondary-grey400">Practice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithMeta
              label="Work Experience"
              requiredDot
              value={data.workExperience}
              onChange={(v) => setField("workExperience", v.replace(/[^0-9]/g, ""))}
              placeholder="20"
              inputRightMeta="Years"
            />

            <div className="relative">
              <InputWithMeta
                label="Medical Practice Type"
                requiredDot
                value={data.medicalPracticeType}
                placeholder="Select practice type"
                RightIcon={ChevronDown}
                readonlyWhenIcon
                onFieldOpen={() => setTypeOpen((o) => (o === 'practice' ? null : 'practice'))}
                dropdownOpen={typeOpen === 'practice'}
                onRequestClose={() => setTypeOpen(null)}
                dropdownItems={practiceTypes}
                selectedValue={data.medicalPracticeType}
                onSelectItem={(it) => {
                  setField('medicalPracticeType', it.value);
                }}
                itemRenderer={(it, { isSelected }) => (
                  <span className={isSelected ? 'text-blue-600 font-semibold' : ''}>{it.label}</span>
                )}
              />
            </div>
          </div>
        </div>

        {/* Specialization list */}
        <div className="flex flex-col gap-4">
          <div className="text-[14px] font-normal text-secondary-grey400 flex items-center gap-1">
            Specialization <span className="bg-red-500 w-1 h-1 rounded-full"></span>
          </div>
          <div className="flex flex-col gap-3">
            {data.specialties.map((sp, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start relative pr-6">
                <div className="relative">
                  <InputWithMeta
                    value={sp.specialtyName}
                    placeholder="Select Specialty"
                    RightIcon={ChevronDown}
                    readonlyWhenIcon
                    onFieldOpen={() => setSpecialtyOpenIdx((o) => (o === idx ? null : idx))}
                    dropdownOpen={specialtyOpenIdx === idx}
                    onRequestClose={() => setSpecialtyOpenIdx(null)}
                    dropdownItems={specialtyOptions}
                    selectedValue={sp.specialtyName}
                    onSelectItem={(it) => {
                      setSpecialty(idx, { specialtyName: it.value });
                    }}
                    itemRenderer={(it, { isSelected }) => (
                      <span className={isSelected ? 'text-blue-600 font-semibold' : ''}>{it.label}</span>
                    )}
                  />
                </div>

                <InputWithMeta
                  value={sp.expYears}
                  onChange={(v) => setSpecialty(idx, { expYears: v.replace(/[^0-9]/g, "") })}
                  placeholder="14"
                  inputRightMeta="Years"
                />

                {data.specialties.length > 1 && (
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary-grey200 hover:text-red-500 p-1"
                    onClick={() => removeSpecialty(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={addSpecialty}
              className="text-blue-primary250 hover:text-blue-primary300 text-[14px] font-medium flex items-center gap-1"
            >
              + Add More Specialities
            </button>
          </div>
        </div>

        {/* Practice Area with input and suggestions */}
        <div className="flex flex-col gap-4">
          <div className="text-[16px] font-medium text-secondary-grey400">Practice Area</div>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <InputWithMeta showInput={false}>
                <div className="relative">
                  <input
                    value={practiceAreaInput}
                    onChange={(e) => setPracticeAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && practiceAreaInput.trim()) {
                        setField("practiceArea", [...data.practiceArea, practiceAreaInput.trim()]);
                        setPracticeAreaInput("");
                      }
                    }}
                    placeholder="Start typing a disease / Condition / Procedure"
                    className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 h-8 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 pr-8"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-grey200 pointer-events-none" />
                </div>
              </InputWithMeta>
            </div>
            <div className="flex gap-2 items-center mt-1">
              <div className="text-xs text-blue-primary250">Suggestion:</div>
              <div className="flex flex-wrap gap-2">
                {areaOptions.map((a) => {
                  const active = data.practiceArea.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleArea(a)}
                      className={`px-1 py-0.5 bg-secondary-grey50 rounded-[4px] min-w-[18px] text-xs hover:bg-gray-50 ${active
                        ? "text-blue-primary250 bg-blue-50 border border-blue-primary150"
                        : "text-secondary-grey300"
                        }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GeneralDrawer>
  );
}
