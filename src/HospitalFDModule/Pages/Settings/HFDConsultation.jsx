import React, { useEffect, useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { NavLink } from 'react-router-dom';
import AvatarCircle from '../../../components/AvatarCircle';
import { hospital } from '../../../../public/index.js';
import { Checkbox } from "../../../components/ui/checkbox";
import Toggle from "../../../components/FormItems/Toggle";
import TimeInput from "../../../components/FormItems/TimeInput";
import InputWithMeta from "../../../components/GeneralDrawer/InputWithMeta";
import useConsultationStore from "../../../store/settings/useConsultationStore";
import useHospitalFrontDeskAuthStore from "../../../store/useHospitalFrontDeskAuthStore";
import useClinicStore from "../../../store/settings/useClinicStore";
import useToastStore from "../../../store/useToastStore";
import UniversalLoader from "../../../components/UniversalLoader";
import HFDSettingsHeader from "./HFDSettingsHeader";

const SectionCard = ({ title, subtitle, headerRight, children }) => (
  <div className="px-4 py-3 flex flex-col gap-3 bg-white rounded-lg ">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm">
          <div className="font-medium text-[14px] text-gray-900">{title}</div>
          {subtitle && (
            <div className="px-1 border border-secondary-grey50 bg-secondary-grey50 rounded-sm text-[12px] text-gray-500">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {headerRight}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

// Display helper: UTC ISO -> IST HH:MM
const toHM = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const utcMs = d.getTime();
  const istMs = utcMs + (330 * 60 * 1000); // 5.5h
  const istDate = new Date(istMs);
  const hh = String(istDate.getUTCHours()).padStart(2, "0");
  const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Input helper: IST HH:MM -> UTC ISO
const toUTC = (hm) => {
  if (!hm) return "";
  const [h, m] = hm.split(":").map(Number);
  let mins = h * 60 + m - 330;
  if (mins < 0) mins += 1440;
  mins %= 1440;
  const uh = Math.floor(mins / 60);
  const um = mins % 60;
  return `1970-01-01T${String(uh).padStart(2, "0")}:${String(um).padStart(2, "0")}:00.000Z`;
};

// Payload helper: UTC ISO -> UTC HH:MM
const toRawUTC_HM = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function HFDConsultation() {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const {
    consultationDetails,
    loading,
    saving,
    fetchConsultationDetails,
    updateConsultationDetails,
    setConsultationDetails,
    isDirty,
  } = useConsultationStore();

  const { user, clinicId: authClinicId, doctorId: authDoctorId } = useHospitalFrontDeskAuthStore();
  const { clinic } = useClinicStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const resolveParams = () => {
      const clinicId = authClinicId || user?.clinicId || user?.clinic?.id || clinic?.id || clinic?.clinicId;
      const doctorId = authDoctorId || user?.doctorId || user?.doctor?.id;
      if (clinicId && doctorId) return { clinicId, doctorId };
      return null;
    };
    const params = resolveParams();
    if (params) fetchConsultationDetails(params);
  }, [user, fetchConsultationDetails, authClinicId, authDoctorId, clinic?.id]);

  const handleFeeChange = (field, value) => {
    let fees = [...consultationDetails.consultationFees];
    if (fees.length === 0) {
      fees = [{
        consultationFee: "",
        followUpFee: "",
        autoApprove: false,
        avgDurationMinutes: 0,
        availabilityDurationDays: undefined,
      }];
    }
    fees[0] = { ...fees[0], [field]: value };
    setConsultationDetails({ ...consultationDetails, consultationFees: fees });
  };

  const handleScheduleChange = (dayName, updates) => {
    const schedule = [...consultationDetails.slotTemplates.schedule];
    const dayIndex = schedule.findIndex(d => d.day.toUpperCase() === dayName.toUpperCase());
    if (dayIndex > -1) {
      schedule[dayIndex] = { ...schedule[dayIndex], ...updates };
      setConsultationDetails({
        ...consultationDetails,
        slotTemplates: { ...consultationDetails.slotTemplates, schedule }
      });
    }
  };

  const handleSave = async () => {
    const clinicId = user?.clinicId || user?.clinic?.id || clinic?.id || clinic?.clinicId;
    const doctorId = user?.doctorId || user?.doctor?.id;

    if (!clinicId) {
      addToast({ title: "Error", message: "Could not resolve clinic ID.", type: "error" });
      return;
    }

    const fees = consultationDetails.consultationFees[0] || {};
    const schedule = consultationDetails.slotTemplates.schedule;

    const dayMap = { Monday: "MONDAY", Tuesday: "TUESDAY", Wednesday: "WEDNESDAY", Thursday: "THURSDAY", Friday: "FRIDAY", Saturday: "SATURDAY", Sunday: "SUNDAY" };

    const slotData = schedule.map((d) => {
      const sessions = d.available ? (d.sessions || []) : [];
      return {
        day: dayMap[d.day] || String(d.day).toUpperCase(),
        timings: sessions.map((s) => ({
          startTime: toRawUTC_HM(s.startTime),
          endTime: toRawUTC_HM(s.endTime),
          maxTokens: Number(s.maxTokens) || 0,
        })),
      };
    });

    const payload = {
      doctorId, // Pass doctorId at top level or within sub-objects as needed by store
      consultationFees: {
        clinicId,
        doctorId,
        consultationFee: String(fees.consultationFee ?? ""),
        followUpFee: String(fees.followUpFee ?? ""),
        autoApprove: Boolean(fees.autoApprove),
        avgDurationMinutes: Number(fees.avgDurationMinutes) || 0,
        availabilityDurationDays: Number(fees.availabilityDurationDays || fees.availabilityDays) || 0,
      },
      slotDetails: {
        clinicId,
        doctorId,
        slotData,
      },
    };

    const params = { doctorId, clinicId };

    try {
      await updateConsultationDetails(payload, params);
      addToast({ title: "Success", message: "Consultation details updated successfully", type: "success" });
    } catch (error) {
      addToast({ title: "Error", message: error.message || "Failed to update", type: "error" });
    }
  };

  const curFees = consultationDetails.consultationFees[0] || {};

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="px-6 pb-10">
        <HFDSettingsHeader />

        <div className="mt-6 space-y-6">
          {loading && !curFees.consultationFee ? (
            <div className="flex items-center justify-center h-48 bg-white rounded-lg border">
              <UniversalLoader size={28} />
            </div>
          ) : (
            <>
              <SectionCard title="In-Clinic Consultations Fees" subtitle="Visible to Patient">
                <div className="flex items-center gap-6">
                  <label className="text-[14px] text-secondary-grey300 whitespace-nowrap">
                    First Time Consultation Fees:
                  </label>
                  <div className="flex h-8 flex-1 border-[0.5px] border-secondary-grey200 rounded-md ">
                    <input
                      className="flex-1 text-sm px-2 rounded-l bg-white focus:outline-none"
                      placeholder="Value"
                      value={curFees.consultationFee || ""}
                      onChange={(e) => handleFeeChange("consultationFee", e.target.value)}
                    />
                    <div className="px-2 flex items-center text-sm border-l-[0.5px] border-secondary-grey100 rounded-r bg-secondary-grey50 text-secondary-grey300">
                      Rupees
                    </div>
                  </div>

                  <div className="text-secondary-grey100 text-md w-1">|</div>
                  <label className="text-[14px] text-secondary-grey300 whitespace-nowrap">
                    Follow-up Consultation Fees:
                  </label>
                  <div className="flex h-8 flex-1 border-[0.5px] border-secondary-grey200 rounded-md ">
                    <input
                      className="flex-1 text-sm px-2 rounded-l bg-white focus:outline-none"
                      placeholder="Value"
                      value={curFees.followUpFee || ""}
                      onChange={(e) => handleFeeChange("followUpFee", e.target.value)}
                    />
                    <div className="px-2 flex items-center text-sm border-l-[0.5px] border-secondary-grey100 rounded-r bg-secondary-grey50 text-secondary-grey300">
                      Rupees
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Set your consultation hours"
                headerRight={
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <Checkbox
                      checked={Boolean(curFees.autoApprove)}
                      onCheckedChange={(v) => handleFeeChange("autoApprove", v)}
                    />
                    <span className="text-sm text-secondary-grey300">Auto Approve Requested Appointment</span>
                  </label>
                }
              >
                <div className="flex gap-4 ">
                  <div>
                    <InputWithMeta label="Average Consultation Min per Patient" requiredDot showInput={false} />
                    <div className="flex flex-1 h-8 w-[300px] border-[0.5px] border-secondary-grey200 rounded-md">
                      <input
                        className="flex-1 text-sm px-2 rounded-l bg-white focus:outline-none"
                        placeholder="Value"
                        value={curFees.avgDurationMinutes || ""}
                        onChange={(e) => handleFeeChange("avgDurationMinutes", e.target.value)}
                      />
                      <div className="px-2 flex items-center text-sm border-l-[0.5px] border-secondary-grey100 rounded-r bg-secondary-grey50 text-secondary-grey300">
                        Mins
                      </div>
                    </div>
                  </div>
                  <div className="text-secondary-grey100 text-xl px-2 opacity-50 mt-4">|</div>
                  <div>
                    <InputWithMeta
                      label="Set Availability Duration"
                      requiredDot
                      infoIcon
                      value={curFees.availabilityDurationDays ? `${curFees.availabilityDurationDays} Days` : ''}
                      placeholder="Select Duration"
                      dropdownItems={[
                        { label: '2 Days', value: 2 },
                        { label: '7 Days', value: 7 },
                        { label: '14 Days', value: 14 },
                        { label: '21 Days', value: 21 },
                        { label: '28 Days', value: 28 },
                      ]}
                      selectedValue={curFees.availabilityDurationDays}
                      onSelectItem={(it) => {
                        handleFeeChange("availabilityDurationDays", it.value);
                        setAvailabilityOpen(false);
                      }}
                      showInput={true}
                      className="h-8 w-full text-xs"
                      RightIcon={ChevronDown}
                      readonlyWhenIcon={true}
                      onFieldOpen={() => setAvailabilityOpen(true)}
                      onIconClick={() => setAvailabilityOpen(o => !o)}
                      dropdownOpen={availabilityOpen}
                      onRequestClose={() => setAvailabilityOpen(false)}
                      dropdownClassName="mt-6"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
                  {consultationDetails.slotTemplates.schedule.map((d) => (
                    <div key={d.day} className="bg-white border border-secondary-grey100 rounded-lg p-3 ">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900">{d.day}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-secondary-grey300">Available</span>
                          <Toggle
                            checked={Boolean(d.available)}
                            onChange={(v) => {
                              const checked = typeof v === "boolean" ? v : v?.target?.checked;
                              handleScheduleChange(d.day, { available: checked });
                            }}
                          />
                        </div>
                      </div>
                      <div className="border-t border-gray-200 mb-3" />
                      <div className={`space-y-3 ${!d.available ? "opacity-60 pointer-events-none" : ""}`}>
                        {(d.sessions?.length > 0 ? d.sessions : [{ sessionNumber: 1, startTime: "1970-01-01T09:00:00.000Z", endTime: "1970-01-01T17:00:00.000Z", maxTokens: null }]).map((s, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-blue-primary50 p-2 rounded-lg">
                            <span className="text-sm text-secondary-grey300 whitespace-nowrap">Session {s.sessionNumber || idx + 1}:</span>
                            <TimeInput
                              value={toHM(s.startTime)}
                              onChange={(e) => {
                                const sessions = [...d.sessions];
                                sessions[idx] = { ...sessions[idx], startTime: toUTC(e.target.value) };
                                handleScheduleChange(d.day, { sessions });
                              }}
                            />
                            <span className="text-sm text-secondary-grey300">-</span>
                            <TimeInput
                              value={toHM(s.endTime)}
                              onChange={(e) => {
                                const sessions = [...d.sessions];
                                sessions[idx] = { ...sessions[idx], endTime: toUTC(e.target.value) };
                                handleScheduleChange(d.day, { sessions });
                              }}
                            />
                            <div className="text-sm text-secondary-grey300 whitespace-nowrap h-5 w-[8px] opacity-50">|</div>
                            <span className="text-sm text-secondary-grey300 whitespace-nowrap">Token Available:</span>
                            <input
                              className="h-8 w-16 text-sm border border-secondary-grey200 rounded px-2 bg-white text-secondary-grey400 focus:outline-none"
                              placeholder="Val"
                              value={s.maxTokens ?? ""}
                              onChange={(e) => {
                                const sessions = [...d.sessions];
                                sessions[idx] = { ...sessions[idx], maxTokens: e.target.value === "" ? null : Number(e.target.value) };
                                handleScheduleChange(d.day, { sessions });
                              }}
                            />
                            {d.sessions?.length > 1 && (
                              <button
                                onClick={() => {
                                  const sessions = d.sessions.filter((_, i) => i !== idx);
                                  handleScheduleChange(d.day, { sessions });
                                }}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          className="text-sm text-blue-primary250 hover:text-blue-700 font-normal"
                          onClick={() => {
                            const sessions = [...(d.sessions || [])];
                            if (sessions.length >= 6) return;
                            sessions.push({
                              sessionNumber: sessions.length + 1,
                              startTime: "1970-01-01T09:00:00.000Z",
                              endTime: "1970-01-01T17:00:00.000Z",
                              maxTokens: null
                            });
                            handleScheduleChange(d.day, { sessions });
                          }}
                        >
                          + Add More
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="p-4 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[12px] text-gray-600">
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                    By saving, you agree to our Terms and Privacy Policy.
                  </label>
                  <button
                    disabled={!isDirty || saving}
                    onClick={handleSave}
                    className={`inline-flex items-center justify-center px-4 h-9 rounded text-sm font-medium transition-all ${!isDirty || saving ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"}`}
                  >
                    {saving && <UniversalLoader size={16} className="border-white mr-2" />}
                    {saving ? "Saving Details..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
