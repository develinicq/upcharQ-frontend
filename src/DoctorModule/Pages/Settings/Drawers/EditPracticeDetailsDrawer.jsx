import React, { useEffect, useMemo, useState } from "react";
import GeneralDrawer from "@/components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import Dropdown from "@/components/GeneralDrawer/Dropdown";
import { ChevronDown } from "lucide-react";
import { updateMedicalRegistration, updatePracticeDetails, getProfessionalDetails } from "@/services/settings/professionalService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";

export default function EditPracticeDetailsDrawer({ open, onClose, initial = {}, onSave }) {
  const [data, setData] = useState({
    workExperience: "",
    medicalPracticeType: "",
    practiceArea: [],
    specialties: [], // [{ id?, name, expYears }]
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
        workExperience: initial?.workExperience ? String(initial.workExperience) : "",
        medicalPracticeType: initial?.medicalPracticeType || "",
        practiceArea: Array.isArray(initial?.practiceArea) ? initial.practiceArea : [],
        specialties: (Array.isArray(initial?.specialties) && initial.specialties.length > 0)
          ? initial.specialties.map((s) => ({
            id: s?.id,
            name: s?.name || s?.specialtyName || "",
            expYears: s?.expYears !== undefined && s?.expYears !== null ? String(s.expYears) : "",
          }))
          : [{ name: "", expYears: "" }],
      };
      setData(initData);

      // capture normalized baseline for dirty comparison
      const normalize = (d) => ({
        workExperience: (d.workExperience || "").trim(),
        medicalPracticeType: (d.medicalPracticeType || "").trim(),
        practiceArea: Array.isArray(d.practiceArea) ? d.practiceArea.slice().sort() : [],
        specialties: Array.isArray(d.specialties)
          ? d.specialties
            .map((s) => ({
              name: (s.name || "").trim(),
              expYears: (s.expYears || "").trim(),
            }))
            .filter((s) => s.name)
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
    { label: "Dentistry", value: "Dentistry" },
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
      specialties: [...(d.specialties || []), { name: "", expYears: "" }],
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

  useEffect(() => {
    const normalize = (d) => ({
      workExperience: (d.workExperience || "").trim(),
      medicalPracticeType: (d.medicalPracticeType || "").trim(),
      practiceArea: Array.isArray(d.practiceArea) ? d.practiceArea.slice().sort() : [],
      specialties: Array.isArray(d.specialties)
        ? d.specialties
          .map((s) => ({
            name: (s.name || "").trim(),
            expYears: (s.expYears || "").trim(),
          }))
          .filter((s) => s.name)
        : [],
    });
    if (!baseline) { setDirty(false); return; }
    const curr = normalize(data);
    setDirty(JSON.stringify(curr) !== JSON.stringify(baseline));
  }, [data, baseline]);

  const validate = () => {
    if (!data.workExperience || isNaN(Number(data.workExperience))) return false;
    if (!data.medicalPracticeType) return false;
    return true;
  };

  const buildPayload = () => {
    const payload = {
      workExperience: Number(data.workExperience),
      medicalPracticeType: data.medicalPracticeType,
      practiceArea: Array.isArray(data.practiceArea) ? data.practiceArea : [],
      specialties: (Array.isArray(data.specialties) ? data.specialties : [])
        .filter(s => s.name)
        .map(s => ({
          name: s.name,
          expYears: String(s.expYears)
        }))
    };
    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = buildPayload();
    if (!dirty) {
      onClose?.();
      return;
    }

    const { addToast } = useToastStore.getState();
    try {
      setSaving(true);
      await updatePracticeDetails(payload);

      addToast({
        title: 'Updated',
        message: 'Practice details updated successfully',
        type: 'success',
      });
      onSave?.(payload);
      onClose?.();
    } catch (e) {
      addToast({
        title: 'Update failed',
        message: e?.message || 'Failed to update practice details',
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
      title="Edit Practice Details"
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


        {/* Practice Details */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[16px] font-medium text-secondary-grey400">Practice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithMeta
              label="Work Experience"
              requiredDot
              value={data.workExperience}
              onChange={(v) => setData(d => ({ ...d, workExperience: v.replace(/[^0-9]/g, "") }))}
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
                  setData(d => ({ ...d, medicalPracticeType: it.value }));
                }}
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
                    value={sp.name}
                    placeholder="Select Specialty"
                    RightIcon={ChevronDown}
                    readonlyWhenIcon
                    onFieldOpen={() => setSpecialtyOpenIdx((o) => (o === idx ? null : idx))}
                    dropdownOpen={specialtyOpenIdx === idx}
                    onRequestClose={() => setSpecialtyOpenIdx(null)}
                    dropdownItems={specialtyOptions}
                    selectedValue={sp.name}
                    onSelectItem={(it) => {
                      setSpecialty(idx, { name: it.value });
                    }}
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
                        setData(d => ({ ...d, practiceArea: [...d.practiceArea, practiceAreaInput.trim()] }));
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
