import React, { useState, useMemo } from "react";
import GeneralDrawer from "../../../components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "../../../components/GeneralDrawer/InputWithMeta";
import { ChevronDown, ChevronUp } from "lucide-react";
import { addMedicalRecordByDoctor } from "../../../services/doctorService";
import useToastStore from "../../../store/useToastStore";
import UniversalLoader from "../../../components/UniversalLoader";

export default function AddVitalsDrawer({ open, onClose, onSave, patient }) {
  const patientId = patient?.patientId || patient?.id;
  const { addToast } = useToastStore();

  const [form, setForm] = useState({
    bpSys: "",
    bpDia: "",
    oxygenSaturation: "",
    pulse: "",
    respiratoryRate: "",
    temperature: "",
    bloodGlucose: "",
    heightFt: "",
    heightIn: "",
    weight: "",
    waist: "",
    bmi: "",
    notes: "",
  });

  const [vitalsOpen, setVitalsOpen] = useState(true);
  const [biometricsOpen, setBiometricsOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((s) => ({ ...s, [field]: value }));
  };

  const hasData = useMemo(() => {
    const fields = [
      "bpSys", "bpDia", "oxygenSaturation", "pulse", "respiratoryRate",
      "temperature", "bloodGlucose", "heightFt", "heightIn", "weight",
      "waist", "bmi"
    ];
    return fields.some(f => String(form[f]).trim() !== "");
  }, [form]);

  const handleSave = async () => {
    if (!hasData || saving) return;
    setSaving(true);

    try {
      const vitalsPayload = {
        patientId,
        recordType: "VITALS",
        recordData: {}
      };

      if (form.bpSys || form.bpDia) {
        vitalsPayload.recordData.bloodPressure = {
          systolic: Number(form.bpSys) || 0,
          diastolic: Number(form.bpDia) || 0
        };
      }
      if (form.temperature) vitalsPayload.recordData.temperature = Number(form.temperature);
      if (form.pulse) vitalsPayload.recordData.heartRate = Number(form.pulse);
      if (form.respiratoryRate) vitalsPayload.recordData.respiratoryRate = Number(form.respiratoryRate);
      if (form.oxygenSaturation) vitalsPayload.recordData.oxygenSaturation = Number(form.oxygenSaturation);
      // bloodGlucose is not in the example but good to have if supported or just omit if unsure
      if (form.bloodGlucose) vitalsPayload.recordData.bloodGlucose = Number(form.bloodGlucose);

      const biometricsPayload = {
        patientId,
        recordType: "BIOMETRICS",
        recordData: {}
      };

      if (form.heightFt || form.heightIn) {
        const ft = Number(form.heightFt) || 0;
        const inch = Number(form.heightIn) || 0;
        // Convert to cm: (ft * 30.48) + (in * 2.54)
        biometricsPayload.recordData.height = Number(((ft * 30.48) + (inch * 2.54)).toFixed(2));
      }
      if (form.weight) biometricsPayload.recordData.weight = Number(form.weight);
      if (form.bmi) biometricsPayload.recordData.bmi = Number(form.bmi);
      if (form.waist) biometricsPayload.recordData.waistCircumference = Number(form.waist);

      const calls = [];
      if (Object.keys(vitalsPayload.recordData).length > 0) {
        calls.push(addMedicalRecordByDoctor(vitalsPayload));
      }
      if (Object.keys(biometricsPayload.recordData).length > 0) {
        calls.push(addMedicalRecordByDoctor(biometricsPayload));
      }

      if (calls.length === 0) {
        setSaving(false);
        return;
      }

      await Promise.all(calls);
      addToast({ title: "Success", message: "Medical records added successfully", type: "success" });
      onSave?.();
      onClose?.();
      // Reset form
      setForm({
        bpSys: "", bpDia: "", oxygenSaturation: "", pulse: "",
        respiratoryRate: "", temperature: "", bloodGlucose: "",
        heightFt: "", heightIn: "", weight: "", waist: "", bmi: "", notes: "",
      });
    } catch (error) {
      console.error("Save error:", error);
      addToast({ title: "Error", message: error?.response?.data?.message || "Failed to add records", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const SectionToggle = ({ title, isOpen, onToggle }) => (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 text-sm font-semibold text-secondary-grey400 mb-1"
    >
      {title} {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );

  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title="Add Vitals & Biometrics"
      primaryActionLabel={saving ? (
        <div className="flex items-center gap-2">
          <UniversalLoader size={16} color="white" style={{ width: 'auto', height: 'auto' }} />
          <span>Saving...</span>
        </div>
      ) : "Save"}
      onPrimaryAction={handleSave}
      primaryActionDisabled={!hasData || saving}
      width={560}
    >
      <div className="flex flex-col gap-4">
        {/* Vitals Section */}
        <div className="">
          <SectionToggle
            title="Vitals"
            isOpen={vitalsOpen}
            onToggle={() => setVitalsOpen(!vitalsOpen)}
          />

          {vitalsOpen && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border border-secondary-grey100/80 rounded-lg p-3">
              {/* Blood Pressure - Grouped in 1 column */}
              <div>
                <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                  Blood Pressure
                  <button type="button" className="text-secondary-grey200 w-3 h-3 hover:text-secondary-grey300 cursor-pointer">
                    <img src="/Doctor_module/text_box/info.png" alt="info" className="h-3 w-3" />
                  </button>
                </label>
                <div className="flex gap-2">
                  <InputWithMeta
                    placeholder="Value"
                    suffix="Sys"
                    value={form.bpSys}
                    onChange={(val) => handleChange("bpSys", val)}
                    className="flex-1"
                  />
                  <InputWithMeta
                    placeholder="Value"
                    suffix="Dia"
                    value={form.bpDia}
                    onChange={(val) => handleChange("bpDia", val)}
                    className="flex-1"
                  />
                </div>
              </div>

              <InputWithMeta
                label="Oxygen Saturation"
                infoIcon
                placeholder="Value"
                suffix="%"
                value={form.oxygenSaturation}
                onChange={(val) => handleChange("oxygenSaturation", val)}
              />

              <InputWithMeta
                label="Pulse Rate"
                infoIcon
                placeholder="Value"
                suffix="bpm"
                value={form.pulse}
                onChange={(val) => handleChange("pulse", val)}
              />

              <InputWithMeta
                label="Respiratory Rate"
                infoIcon
                placeholder="Value"
                suffix="rpm"
                value={form.respiratoryRate}
                onChange={(val) => handleChange("respiratoryRate", val)}
              />

              <InputWithMeta
                label="Body Temperature"
                infoIcon
                placeholder="Value"
                suffix="F"
                value={form.temperature}
                onChange={(val) => handleChange("temperature", val)}
              />

              <InputWithMeta
                label="Blood Glucose Level"
                infoIcon
                placeholder="Value"
                suffix="mg/dl"
                value={form.bloodGlucose}
                onChange={(val) => handleChange("bloodGlucose", val)}
              />
            </div>
          )}
        </div>

        {/* Biometrics Section */}
        <div className="">
          <SectionToggle
            title="Biometrics"
            isOpen={biometricsOpen}
            onToggle={() => setBiometricsOpen(!biometricsOpen)}
          />

          {biometricsOpen && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border border-secondary-grey100/80 rounded-lg p-3">
              {/* Height - Grouped in 1 column */}
              <div>
                <label className="text-sm text-secondary-grey300 flex items-center gap-1 ">Height</label>
                <div className="flex gap-2">
                  <InputWithMeta
                    placeholder="Value"
                    suffix="ft"
                    value={form.heightFt}
                    onChange={(val) => handleChange("heightFt", val)}
                    className="flex-1"
                  />
                  <InputWithMeta
                    placeholder="Value"
                    suffix="in"
                    value={form.heightIn}
                    onChange={(val) => handleChange("heightIn", val)}
                    className="flex-1"
                  />
                </div>
              </div>

              <InputWithMeta
                label="Weight"
                placeholder="Value"
                suffix="kg"
                value={form.weight}
                onChange={(val) => handleChange("weight", val)}
              />

              <InputWithMeta
                label="Waist Circumference"
                placeholder="Value"
                suffix="cm"
                value={form.waist}
                onChange={(val) => handleChange("waist", val)}
              />

              <InputWithMeta
                label="BMI"
                placeholder="Value"
                value={form.bmi}
                onChange={(val) => handleChange("bmi", val)}
              />
            </div>
          )}
        </div>
      </div>
    </GeneralDrawer>
  );
}
