import React, { useEffect, useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import { Checkbox } from "../../../../components/ui/checkbox";
import Toggle from "../../../../components/FormItems/Toggle";
import TimeInput from "../../../../components/FormItems/TimeInput";
import InputWithMeta from "../../../../components/GeneralDrawer/InputWithMeta";
import useConsultationStore, { DEFAULT_SCHEDULE } from "../../../../store/settings/useConsultationStore";
import useDoctorAuthStore from "../../../../store/useDoctorAuthStore";
import useHospitalAuthStore from "../../../../store/useHospitalAuthStore";
import useClinicStore from "../../../../store/settings/useClinicStore";
import useToastStore from "../../../../store/useToastStore";
import { pencil } from "../../../../../public/index.js";
import UniversalLoader from "../../../../components/UniversalLoader";

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

const ConsultationTab = () => {
    const [availabilityOpen, setAvailabilityOpen] = useState(false);
    const {
        consultationDetails,
        loading,
        saving,
        fetchConsultationDetails,
        updateConsultationDetails,
        setConsultationDetails,
        isDirty,
        setDirty,
        fetchError
    } = useConsultationStore();

    const { user: doctorDetails, loading: docLoading, fetchMe } = useDoctorAuthStore();
    const user = doctorDetails; // reuse the same object for both names to satisfy existing code
    const { user: hospitalAdminUser, hospitalId: storeHospitalId } = useHospitalAuthStore();

    useEffect(() => {
        if (!doctorDetails && !docLoading) {
            fetchMe?.();
        }
    }, [doctorDetails, docLoading, fetchMe]);
    const { clinic } = useClinicStore();
    const { addToast } = useToastStore();

    useEffect(() => {
        console.log("[ConsultationTab] useEffect triggered", { doctorDetails, user, clinic, hospitalAdminUser, storeHospitalId });

        const resolveParams = () => {
            // Priority 1: doctorDetails from useDoctorAuthStore
            const dClinicId =
                doctorDetails?.clinicId ||
                doctorDetails?.clinic?.id ||
                doctorDetails?.currentClinicId ||
                doctorDetails?.currentClinic?.id ||
                doctorDetails?.primaryClinic?.id ||
                doctorDetails?.associatedWorkplaces?.clinic?.id ||
                doctorDetails?.associatedWorkplaces?.clinics?.[0]?.id;

            const dHospitalId =
                doctorDetails?.hospitalId ||
                doctorDetails?.hospital?.id ||
                doctorDetails?.currentHospitalId ||
                doctorDetails?.currentHospital?.id ||
                doctorDetails?.primaryHospital?.id ||
                doctorDetails?.associatedWorkplaces?.hospital?.id ||
                doctorDetails?.associatedWorkplaces?.hospitals?.[0]?.id;

            // Priority 2: user object (alias for doctorDetails)
            const uClinicId = user?.clinicId || user?.clinic?.id || user?.currentClinicId || user?.currentClinic?.id;
            const uHospitalId = user?.hospitalId || user?.hospital?.id || user?.currentHospitalId || user?.currentHospital?.id;

            // Priority 3: Hospital Admin Store (for dual-role users)
            const hAdminClinicId = hospitalAdminUser?.clinicId || hospitalAdminUser?.clinic?.id || hospitalAdminUser?.currentClinicId;
            const hAdminHospitalId = storeHospitalId || hospitalAdminUser?.hospitalId || hospitalAdminUser?.hospital?.id || hospitalAdminUser?.currentHospitalId;

            // Priority 4: clinic store (if currently viewed clinic)
            const cId = clinic?.id || clinic?.clinicId;

            // Priority 5: Check if doctorDetails is actually nested (some APIs return it differently)
            const nestedDoc = doctorDetails?.doctor || user?.doctor;
            const ndClinicId = nestedDoc?.clinicId || nestedDoc?.clinic?.id;
            const ndHospitalId = nestedDoc?.hospitalId || nestedDoc?.hospital?.id;

            const finalClinicId = dClinicId || uClinicId || hAdminClinicId || cId || ndClinicId;
            const finalHospitalId = dHospitalId || uHospitalId || hAdminHospitalId || ndHospitalId;

            console.log("[ConsultationTab] ID Resolution Search:", {
                fromDoctor: { dClinicId, dHospitalId },
                fromUser: { uClinicId, uHospitalId },
                fromHospitalAdmin: { hAdminClinicId, hAdminHospitalId },
                fromClinicStore: cId,
                fromNestedDoc: { ndClinicId, ndHospitalId }
            });

            if (finalClinicId) return { clinicId: finalClinicId };
            if (finalHospitalId) return { hospitalId: finalHospitalId };
            return null;
        };

        // Only attempt to resolve and fetch if we are not still loading the doctor profile
        if (!docLoading) {
            const params = resolveParams();
            console.log("[ConsultationTab] Final params for fetch:", params);

            if (params) {
                fetchConsultationDetails(params);
            } else {
                console.warn("[ConsultationTab] No clinicId or hospitalId could be resolved.");
            }
        }
    }, [doctorDetails, user, clinic, hospitalAdminUser, storeHospitalId, fetchConsultationDetails, docLoading]);

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

        // Deep clone the object to ensure Zustand/React detects change
        fees[0] = { ...fees[0], [field]: value };

        console.log(`[ConsultationTab] handleFeeChange: ${field} =`, value);
        setConsultationDetails({ ...consultationDetails, consultationFees: fees });
    };

    const handleScheduleChange = (dayName, updates) => {
        const schedule = [...consultationDetails.slotTemplates.schedule];
        const dayIndex = schedule.findIndex(d => d.day.toUpperCase() === dayName.toUpperCase());
        if (dayIndex > -1) {
            schedule[dayIndex] = { ...schedule[dayIndex], ...updates };
            console.log(`[ConsultationTab] handleScheduleChange for ${dayName}:`, updates);
            setConsultationDetails({
                ...consultationDetails,
                slotTemplates: { ...consultationDetails.slotTemplates, schedule }
            });
        }
    };

    const handleSave = async () => {
        console.log("[ConsultationTab] handleSave initiated");
        const resolveIds = () => {
            // Priority 1: doctorDetails (most specific)
            const dClinicId =
                doctorDetails?.clinicId ||
                doctorDetails?.clinic?.id ||
                doctorDetails?.currentClinicId ||
                doctorDetails?.currentClinic?.id ||
                doctorDetails?.primaryClinic?.id ||
                doctorDetails?.associatedWorkplaces?.clinic?.id ||
                doctorDetails?.associatedWorkplaces?.clinics?.[0]?.id;

            const dHospitalId =
                doctorDetails?.hospitalId ||
                doctorDetails?.hospital?.id ||
                doctorDetails?.currentHospitalId ||
                doctorDetails?.currentHospital?.id ||
                doctorDetails?.primaryHospital?.id ||
                doctorDetails?.associatedWorkplaces?.hospital?.id ||
                doctorDetails?.associatedWorkplaces?.hospitals?.[0]?.id;

            // Priority 2: user object (session info)
            const uClinicId = user?.clinicId || user?.clinic?.id || user?.currentClinicId || user?.currentClinic?.id;
            const uHospitalId = user?.hospitalId || user?.hospital?.id || user?.currentHospitalId || user?.currentHospital?.id;

            // Priority 3: hospital store (if dual-role admin)
            const hAdminClinicId = hospitalAdminUser?.clinicId || hospitalAdminUser?.clinic?.id || hospitalAdminUser?.currentClinicId;
            const hAdminHospitalId = storeHospitalId || hospitalAdminUser?.hospitalId || hospitalAdminUser?.hospital?.id || hospitalAdminUser?.currentHospitalId;

            // Priority 4: clinic store (if currently viewed clinic)
            const cId = clinic?.id || clinic?.clinicId;

            // Priority 5: Nested doctor data
            const nestedDoc = doctorDetails?.doctor || user?.doctor;
            const ndClinicId = nestedDoc?.clinicId || nestedDoc?.clinic?.id;
            const ndHospitalId = nestedDoc?.hospitalId || nestedDoc?.hospital?.id;

            const finalClinicId = dClinicId || uClinicId || hAdminClinicId || cId || ndClinicId;
            const finalHospitalId = dHospitalId || uHospitalId || hAdminHospitalId || ndHospitalId;

            return { clinicId: finalClinicId || null, hospitalId: finalHospitalId || null };
        };

        const { clinicId, hospitalId } = resolveIds();
        console.log("[ConsultationTab] handleSave resolved IDs:", { clinicId, hospitalId });

        if (!clinicId && !hospitalId) {
            console.error("[ConsultationTab] FAILED: No clinicId or hospitalId resolved!");
            addToast({
                title: "Error",
                message: "Internal Error: Could not resolve clinic or hospital ID. Please refresh and try again.",
                type: "error",
            });
            return;
        }

        const fees = consultationDetails.consultationFees[0] || {};
        const schedule = consultationDetails.slotTemplates.schedule;

        const dayMap = {
            Monday: "MONDAY",
            Tuesday: "TUESDAY",
            Wednesday: "WEDNESDAY",
            Thursday: "THURSDAY",
            Friday: "FRIDAY",
            Saturday: "SATURDAY",
            Sunday: "SUNDAY",
        };

        const slotData = schedule
            .map((d) => {
                // If day is not available, send empty timings to clear existing slots
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
            consultationFees: {
                ...(hospitalId ? { hospitalId } : {}),
                ...(clinicId ? { clinicId } : {}),
                consultationFee: String(fees.consultationFee ?? ""),
                followUpFee: String(fees.followUpFee ?? ""),
                autoApprove: Boolean(fees.autoApprove),
                avgDurationMinutes: Number(fees.avgDurationMinutes) || 0,
                availabilityDurationDays: Number(fees.availabilityDurationDays || fees.availabilityDays) || 0,
            },
            slotDetails: {
                ...(hospitalId ? { hospitalId } : {}),
                ...(clinicId ? { clinicId } : {}),
                slotData,
            },
        };

        console.log("[ConsultationTab] handleSave Payload:", payload);

        try {
            console.log("[ConsultationTab] Calling updateConsultationDetails store action...");
            const res = await updateConsultationDetails(payload);
            console.log("[ConsultationTab] updateConsultationDetails success:", res);
            addToast({
                title: "Success",
                message: "Consultation details updated successfully",
                type: "success",
            });
        } catch (error) {
            console.error("[ConsultationTab] handleSave ERROR:", error);
            addToast({
                title: "Error",
                message: error.response?.data?.message || error.message || "Failed to update consultation details",
                type: "error",
            });
        }
    };

    const curFees = consultationDetails.consultationFees[0] || {};

    console.log("[ConsultationTab] Render state:", { isDirty, saving, loading });

    return (
        <div className="space-y-6 p-4">
            {/* Universal Fetch Loader */}
            {loading && !consultationDetails.consultationFees[0]?.consultationFee ? (
                <div className="flex items-center justify-center h-48 rounded-lg">
                    <UniversalLoader size={28} className="" />
                </div>
            ) : fetchError ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-lg  p-6 text-center">

                    <div className="text-red-500 text-sm">{fetchError}</div>
                    {/* <button
                        onClick={() => {
                            // Trigger re-resolve and fetch
                            const params = {
                                clinicId: doctorDetails?.clinicId || clinic?.id || user?.clinicId,
                                hospitalId: doctorDetails?.hospitalId || user?.hospitalId
                            };
                            if (params.clinicId || params.hospitalId) fetchConsultationDetails(params);
                        }}
                        className="mt-4 px-4 py-2 border border-red-400 text-error-400 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        Retry Loading
                    </button> */}
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


                        <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
                            {/* Left Column (Even indices) */}
                            <div className="flex-1 flex flex-col gap-6 w-full">
                                {consultationDetails.slotTemplates.schedule
                                    .filter((_, i) => i % 2 === 0)
                                    .map((d) => (
                                        <div key={d.day} className="bg-white border border-secondary-grey100 rounded-lg p-3 w-full">
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
                                                    <div key={s.id || idx} className="flex items-center gap-4 bg-blue-primary50 p-2 rounded-lg">
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
                                                        if (sessions.length >= 6) return alert("Max 6 sessions");
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

                            {/* Right Column (Odd indices) */}
                            <div className="flex-1 flex flex-col gap-6 w-full">
                                {consultationDetails.slotTemplates.schedule
                                    .filter((_, i) => i % 2 !== 0)
                                    .map((d) => (
                                        <div key={d.day} className="bg-white border border-secondary-grey100 rounded-lg p-3 w-full">
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
                                                    <div key={s.id || idx} className="flex items-center gap-4 bg-blue-primary50 p-2 rounded-lg">
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
                                                        if (sessions.length >= 6) return alert("Max 6 sessions");
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
                        </div>
                    </SectionCard>

                    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                        <div className="px-4 py-3 flex items-center justify-between gap-3">
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
    );
};

export default ConsultationTab;
