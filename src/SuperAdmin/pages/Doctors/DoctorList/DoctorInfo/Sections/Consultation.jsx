import React, { useState, useEffect, useMemo, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import Toggle from "@/components/FormItems/Toggle";
import TimeInput from "@/components/FormItems/TimeInput";
import { ChevronDown, Trash2 } from "lucide-react";
import InputWithMeta from "@/components/GeneralDrawer/InputWithMeta";
import EditClinicDetailsDrawer from "../Drawers/EditClinicDetailsDrawer.jsx";
import { getDoctorConsultationDetailsForSuperAdmin, updateDoctorConsultationDetailsForSuperAdmin } from "@/services/doctorService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "@/components/UniversalLoader";

// Reusable SectionCard (same as others)
const SectionCard = ({
  title,
  subtitle,
  subo,
  Icon,
  onIconClick,
  headerRight,
  children,
}) => (
  <div className="px-4 py-3 flex flex-col gap-3 bg-white rounded-lg ">
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm">
          <div className="font-medium text-[14px] text-gray-900">{title}</div>

          {subtitle && (
            <div className="px-1 py-[2px] bg-secondary-grey50 rounded-md text-[12px] text-gray-500">
              {subtitle}
            </div>
          )}
        </div>

        {subo && (
          <div className="flex gap-1 text-[12px] text-secondary-grey200">
            <span>{subo}</span>
            <span className="text-blue-primary250">Call Us</span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 shrink-0">
        {headerRight}

        {Icon && (
          <button
            onClick={onIconClick}
            className="p-1 text-gray-500 hover:bg-gray-50"
          >
            {typeof Icon === "string" ? (
              <img src={Icon} alt="icon" className="w-7 h-7" />
            ) : (
              <Icon className="w-7 h-7" />
            )}
          </button>
        )}
      </div>
    </div>

    <div>{children}</div>
  </div>
);

// Helper for time formatting
const toHM = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    // For this read-only/display view, just showing local time or mocked string
    // If the prop provides full ISO strings, we parse them.
    // Simple fallback:
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) { return "" }
};

const DEFAULT_SCHEDULE = [
  { day: "Monday", available: true, sessions: [{ sessionNumber: 1, startTime: "1970-01-01T09:00:00.000Z", endTime: "1970-01-01T13:00:00.000Z" }] },
  { day: "Tuesday", available: false, sessions: [] },
  { day: "Wednesday", available: false, sessions: [] },
  { day: "Thursday", available: false, sessions: [] },
  { day: "Friday", available: false, sessions: [] },
  { day: "Saturday", available: false, sessions: [] },
  { day: "Sunday", available: false, sessions: [] },
];

const Consultation = ({ doctor, onLoadingChange, cache = {}, updateCache, clinicId: externalClinicId }) => {
  const [consultationDetails, setConsultationDetails] = useState(doctor?.consultationDetails || {});
  const [consultationDirty, setConsultationDirty] = useState(false);
  const [savingConsultation, setSavingConsultation] = useState(false);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  // Alias for code using doctorDetails
  const doctorDetails = doctor;

  useEffect(() => {
    console.log('[Consultation] Mounted with doctor:', doctor);
    if (doctor?.consultationDetails) {
      setConsultationDetails(doctor.consultationDetails);
      setHasData(true);
    }
    // Hydrate from per-clinic cache if available
    else if (cache && Object.keys(cache).length > 0) {
      setConsultationDetails(cache);
      setHasData(true);
    }
  }, [doctor]);

  // Bubble loading state up to parent (PageNav) for universal loader
  useEffect(() => {
    if (typeof onLoadingChange === 'function') {
      onLoadingChange(!!consultationLoading);
    }
  }, [consultationLoading, onLoadingChange]);

  // Fetch consultation details for SuperAdmin using clinicId from doctor banner/details
  const memoClinicId = useMemo(() => {
    // URL query fallback for clinicId
    const urlClinicId = (() => {
      try {
        const sp = new URLSearchParams(window.location.search);
        return sp.get('clinicId') || null;
      } catch (_) { return null; }
    })();

    return (
      externalClinicId ||
      urlClinicId ||
      doctorDetails?.clinicId ||
      doctorDetails?.clinic?.id ||
      doctorDetails?.workplace?.clinics?.[0]?.id ||
      doctorDetails?.associatedWorkplaces?.clinics?.[0]?.id ||
      doctorDetails?.associatedWorkplaces?.clinic?.id ||
      doctorDetails?.associatedWorkplaces?.clinicId ||
      null
    );
  }, [externalClinicId, doctorDetails?.clinicId, doctorDetails?.workplace?.clinics, doctorDetails?.associatedWorkplaces]);

  // Use ref for updateCache to avoid re-triggering fetch when parent re-renders (causing new inline function)
  const updateCacheRef = useRef(updateCache);
  useEffect(() => {
    updateCacheRef.current = updateCache;
  }, [updateCache]);

  // Always fetch when this section activates; rely on API for fresh data
  const fetchConsultation = React.useCallback(async () => {
    const id = doctorDetails?.userId || doctorDetails?.id;
    const clinicId = memoClinicId;

    if (!id) return;

    try {
      setConsultationLoading(true);
      if (!clinicId) {
        // Without clinicId we cannot fetch consultation details; show empty state
        setHasData(false);
        return;
      }

      const res = await getDoctorConsultationDetailsForSuperAdmin(id, clinicId);
      const feesData = res?.data?.consultationFees;
      const schedData = res?.data?.scheduleDetails;

      if (!feesData && !schedData) {
        setHasData(false);
        return;
      }

      const fees = feesData || {};
      const sched = schedData || {};
      const schedule = Array.isArray(sched?.schedule)
        ? sched.schedule
        : DEFAULT_SCHEDULE;

      const payload = {
        consultationFees: [
          {
            hospitalId: fees.hospitalId ?? null,
            clinicId: fees.clinicId ?? clinicId,
            consultationFee: fees.consultationFee ?? "",
            followUpFee: fees.followUpFee ?? "",
            autoApprove: Boolean(fees.autoApprove),
            avgDurationMinutes: Number(fees.avgDurationMinutes) || 0,
            availabilityDurationDays:
              Number(fees.availabilityDays) || undefined,
          },
        ],
        slotTemplates: { schedule, clinicId },
      };
      setConsultationDetails(payload);
      setHasData(true);
      if (typeof updateCacheRef.current === "function") updateCacheRef.current(payload);
      setConsultationDirty(false);
    } catch (err) {
      console.error("Failed to fetch consultation details for SuperAdmin:", err);
      setHasData(false);
    } finally {
      setConsultationLoading(false);
    }
  }, [doctorDetails?.userId, doctorDetails?.id, memoClinicId]);

  useEffect(() => {
    fetchConsultation();
  }, [fetchConsultation]);

  // Mock API for SuperAdmin view
  const putDoctorConsultationDetails = async (payload) => {
    console.log("Mock save consultation:", payload);
    await new Promise(r => setTimeout(r, 800));
  };

  const showNoData = !consultationLoading && !hasData;

  return (
    <div className=" space-y-6 p-4 bg-secondary-grey50">
      {consultationLoading ? (
        <div className="flex items-center justify-center h-48 rounded-lg">
          <UniversalLoader size={28} className="" />
        </div>
      ) : showNoData ? (
        <div className="bg-white border border-secondary-grey100 rounded-lg p-10 text-center text-secondary-grey300">
          No consultation details found for this clinic.
        </div>
      ) : (
        <>

          {/* In-Clinic Consultation Fees */}
          <SectionCard
            title="In-Clinic Consultations Fees"
            subtitle="Visible to Patient"

          >
            <div className="flex items-center gap-6">
              {/* First Time Consultation */}

              <label className="text-[14px] text-secondary-grey300 whitespace-nowrap">
                First Time Consultation Fees:
              </label>

              <div className="flex h-8 flex-1 border-[0.5px] border-secondary-grey200 rounded-md ">
                <input
                  className="flex-1 text-sm px-2 rounded-l bg-white focus:outline-none"
                  placeholder="Value"
                  value={
                    consultationDetails?.consultationFees?.[0]
                      ?.consultationFee || ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setConsultationDetails((d) => ({
                      ...d,
                      consultationFees: [
                        {
                          ...(d?.consultationFees?.[0] || {}),
                          consultationFee: v,
                        },
                      ],
                    }));
                    setConsultationDirty(true);
                  }}
                />

                <div className="px-2 flex items-center text-sm  border-l-[0.5px] border-secondary-grey100 rounded-r bg-secondary-grey50 text-secondary-grey300">
                  Rupees
                </div>
              </div>


              {/* Follow-up Consultation */}
              <div className="text-secondary-grey100 text-md w-1">|</div>
              <label className="text-[14px] text-secondary-grey300 whitespace-nowrap">
                Follow-up Consultation Fees:
              </label>

              <div className="flex h-8 flex-1 border-[0.5px] border-secondary-grey200 rounded-md ">
                <input
                  className="flex-1 text-sm px-2 rounded-l bg-white focus:outline-none"
                  placeholder="Value"
                  value={
                    consultationDetails?.consultationFees?.[0]?.followUpFee ||
                    ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setConsultationDetails((d) => ({
                      ...d,
                      consultationFees: [
                        {
                          ...(d?.consultationFees?.[0] || {}),
                          followUpFee: v,
                        },
                      ],
                    }));
                    setConsultationDirty(true);
                  }}
                />

                <div className="px-2 flex items-center text-sm  border-l-[0.5px] border-secondary-grey100 rounded-r bg-secondary-grey50 text-secondary-grey300">
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
                  checked={Boolean(
                    consultationDetails?.consultationFees?.[0]?.autoApprove
                  )}
                  onCheckedChange={(v) => {
                    setConsultationDetails((d) => ({
                      ...d,
                      consultationFees: [
                        {
                          ...(d?.consultationFees?.[0] || {}),
                          autoApprove: v,
                        },
                      ],
                    }));
                    setConsultationDirty(true);
                  }}
                  className=""
                />
                <span className="text-sm text-secondary-grey300">Auto Approve Requested Appointment</span>
              </label>
            }
          >


            <div className="flex gap-4 ">

              <div>
                <InputWithMeta label="Average Consultation Min per Patient" requiredDot showInput={false}></InputWithMeta>

                <div className="flex flex-1 h-8 w-[300px]  border-[0.5px] border-secondary-grey200 rounded-md">
                  <input
                    className="flex-1 text-sm px-2 rounded-l bg-white focus:outline-none"
                    placeholder="Value"
                    value={
                      consultationDetails?.consultationFees?.[0]
                        ?.avgDurationMinutes ?? ""
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setConsultationDetails((d) => ({
                        ...d,
                        consultationFees: [
                          {
                            ...(d?.consultationFees?.[0] || {}),
                            avgDurationMinutes: v,
                          },
                        ],
                      }));
                      setConsultationDirty(true);
                    }}
                  />

                  <div className="px-2 flex items-center text-sm  border-l-[0.5px] border-secondary-grey100 rounded-r bg-secondary-grey50 text-secondary-grey300">
                    Mins
                  </div>
                </div>
              </div>
              <div className="text-secondary-grey100 text-xl px-2 opacity-50 mt-4">|</div>



              <div >

                <InputWithMeta
                  label="Set Availability Duration"
                  requiredDot
                  infoIcon
                  value={(() => {
                    const v = consultationDetails?.consultationFees?.[0]?.availabilityDurationDays;
                    return v ? `${v} Days` : '';
                  })()}
                  placeholder="Select Duration"
                  dropdownItems={[
                    { label: '2 Days', value: 2 },
                    { label: '7 Days', value: 7 },
                    { label: '14 Days', value: 14 },
                    { label: '21 Days', value: 21 },
                    { label: '28 Days', value: 28 },
                  ]}
                  selectedValue={consultationDetails?.consultationFees?.[0]?.availabilityDurationDays}
                  onSelectItem={(it) => {
                    setConsultationDetails((d) => ({
                      ...d,
                      consultationFees: [
                        {
                          ...(d?.consultationFees?.[0] || {}),
                          availabilityDurationDays: it.value,
                        },
                      ],
                    }));
                    setConsultationDirty(true);
                    setAvailabilityOpen(false);
                  }}
                  itemRenderer={(it, { isSelected }) => (
                    <span
                      className={
                        isSelected
                          ? ''
                          : ''
                      }
                    >
                      {it.label}
                    </span>
                  )}
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

            {/* inline loader removed in favor of page-level loader */}
            {/* {consultationError && (
                  <div className="text-xs text-red-600 mt-2">
                    {consultationError}
                  </div>
                )} */}

            {/* Days grid (from API schedule or default fallback) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
              {(
                consultationDetails?.slotTemplates?.schedule?.length
                  ? consultationDetails.slotTemplates.schedule
                  : DEFAULT_SCHEDULE
              ).map((d) => {
                const toHM = (iso) => {
                  if (!iso) return "";
                  if (iso.length === 5 && iso.includes(':')) return iso;
                  try {
                    const d = new Date(iso);
                    if (isNaN(d.getTime())) return iso;

                    // Robust logic: Parse UTC, add 5.5 hours, format components
                    const utcMs = d.getTime();
                    const istMs = utcMs + (330 * 60 * 1000); // 5.5h
                    const istDate = new Date(istMs);
                    const hh = String(istDate.getUTCHours()).padStart(2, "0");
                    const mm = String(istDate.getUTCMinutes()).padStart(2, "0");
                    return `${hh}:${mm}`;
                  } catch (e) { return iso || ""; }
                };
                // Helper to convert IST HH:MM (from input) to UTC ISO string
                const toUTC = (hm) => {
                  if (!hm) return "";
                  const [h, m] = hm.split(":").map(Number);
                  // IST = UTC + 5.5h (330 mins)
                  // UTC = IST - 330 mins
                  let mins = h * 60 + m - 330;
                  // Handle day wrap
                  if (mins < 0) mins += 1440;
                  mins %= 1440;
                  const uh = Math.floor(mins / 60);
                  const um = mins % 60;
                  return `1970-01-01T${String(uh).padStart(2, "0")}:${String(um).padStart(2, "0")}:00.000Z`;
                };

                // Helper to hydrate state if empty (fixes "default view not editable" bug)
                const hydrateState = (prev) => {
                  const next = JSON.parse(JSON.stringify(prev || {}));
                  if (!next.slotTemplates?.schedule?.length) {
                    if (!next.slotTemplates) next.slotTemplates = {};
                    next.slotTemplates.schedule = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
                  }
                  return next;
                };

                const disabledCls = d.available
                  ? ""
                  : "opacity-60 pointer-events-none";
                const sessionBgClass = d.available ? "bg-blue-50" : "bg-white";
                const cardOpacity = d.available ? "" : "opacity-60";
                return (
                  <div
                    key={d.day}
                    className={`bg-white border border-secondary-grey100 rounded-lg p-3 `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        {d.day}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-grey300">Available</span>
                        <Toggle
                          checked={Boolean(d.available)}
                          onChange={(v) => {
                            const checked =
                              typeof v === "boolean" ? v : v?.target?.checked;

                            setConsultationDetails((prev) => {
                              const next = hydrateState(prev);
                              const day = next.slotTemplates.schedule.find(x => x.day === d.day || String(x.day).toUpperCase() === String(d.day).toUpperCase());
                              if (day) day.available = checked;
                              return next;
                            });

                            setConsultationDirty(true);
                          }}
                        />
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 mb-3"></div>

                    <div className={`space-y-3 ${disabledCls}`}>
                      {(Array.isArray(d.sessions) && d.sessions.length > 0
                        ? d.sessions
                        : [
                          {
                            sessionNumber: 1,
                            startTime: "1970-01-01T09:00:00.000Z",
                            endTime: "1970-01-01T01:00:00.000Z",
                            maxTokens: null,
                          },
                        ]
                      ).map((s) => (
                        <div
                          key={s.id || s.sessionNumber}
                          className={`flex items-center gap-4 ${sessionBgClass} p-2 rounded-lg bg-blue-primary50`}
                        >
                          <span className="text-sm text-secondary-grey300 whitespace-nowrap">
                            Session {s.sessionNumber}:
                          </span>
                          <TimeInput
                            value={toHM(s.startTime)}
                            onChange={(ev) => {
                              const v = ev.target.value;
                              setConsultationDetails((cd) => {
                                const next = hydrateState(cd);
                                const day = next.slotTemplates.schedule.find((x) => x.day === d.day || String(x.day).toUpperCase() === String(d.day).toUpperCase());
                                const ss = day?.sessions?.find(
                                  (x) =>
                                    (x.id || x.sessionNumber) ===
                                    (s.id || s.sessionNumber)
                                );
                                if (ss)
                                  ss.startTime = toUTC(v);
                                return next;
                              });
                              setConsultationDirty(true);
                            }}
                          />
                          <span className="text-sm text-secondary-grey300 whitespace-nowrap">-</span>
                          <TimeInput
                            value={toHM(s.endTime)}
                            onChange={(ev) => {
                              const v = ev.target.value;
                              setConsultationDetails((cd) => {
                                const next = hydrateState(cd);
                                const day = next.slotTemplates.schedule.find((x) => x.day === d.day || String(x.day).toUpperCase() === String(d.day).toUpperCase());
                                const ss = day?.sessions?.find(
                                  (x) =>
                                    (x.id || x.sessionNumber) ===
                                    (s.id || s.sessionNumber)
                                );
                                if (ss)
                                  ss.endTime = toUTC(v);
                                return next;
                              });
                              setConsultationDirty(true);
                            }}
                          />
                          <div className="text-sm text-secondary-grey300 whitespace-nowrap h-5 w-[8.5px] opacity-50">|</div>
                          <span className="text-sm text-secondary-grey300 whitespace-nowrap">
                            Token Available:
                          </span>
                          <div className="">
                            <input
                              className="h-8 w-full text-sm border border-secondary-grey200 rounded px-2 bg-white text-secondary-grey400 focus:outline-none focus:border-blue-primary500"
                              placeholder="Value"
                              value={s.maxTokens ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setConsultationDetails((cd) => {
                                  const next = hydrateState(cd);
                                  const day = next.slotTemplates.schedule.find((x) => x.day === d.day || String(x.day).toUpperCase() === String(d.day).toUpperCase());
                                  const ss = day?.sessions?.find(
                                    (x) =>
                                      (x.id || x.sessionNumber) ===
                                      (s.id || s.sessionNumber)
                                  );
                                  if (ss) ss.maxTokens = v === "" ? null : (Number(v) || 0);
                                  return next;
                                });
                                setConsultationDirty(true);
                              }}
                            />
                          </div>

                          {/* Delete icon - only show when there are 2+ sessions */}
                          {d.sessions.length > 1 && (
                            <button
                              onClick={() => {
                                setConsultationDetails((prev) => {
                                  const next = hydrateState(prev);
                                  const dayIndex = next.slotTemplates.schedule.findIndex(x => x.day === d.day || String(x.day).toUpperCase() === String(d.day).toUpperCase());
                                  if (dayIndex === -1) return next;

                                  const day = next.slotTemplates.schedule[dayIndex];
                                  day.sessions = day.sessions.filter(
                                    (session) =>
                                      (session.id || session.sessionNumber) !== (s.id || s.sessionNumber)
                                  );

                                  return next;
                                });
                                setConsultationDirty(true);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete session"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          className="text-sm text-blue-primary250 hover:text-blue-700 font-normal"
                          disabled={!d.available}
                          onClick={() => {
                            if (!d.available) return;
                            setConsultationDetails((prev) => {
                              const next = hydrateState(prev);
                              const daySchedule = next.slotTemplates.schedule.find(x => x.day === d.day || String(x.day).toUpperCase() === String(d.day).toUpperCase());

                              if (!daySchedule) return next;

                              // Check if we've reached max 6 slots
                              const currentSessionCount =
                                daySchedule.sessions?.length || 0;
                              if (currentSessionCount >= 6) {
                                alert("Maximum 6 slots allowed");
                                return next;
                              }

                              const sessionsToAdd = [];

                              if (currentSessionCount === 0) {
                                // Add Session 1 (matching placeholder)
                                sessionsToAdd.push({
                                  sessionNumber: 1,
                                  startTime: "1970-01-01T09:00:00.000Z",
                                  endTime: "1970-01-01T01:00:00.000Z", // Matching 01:00
                                  maxTokens: null,
                                });
                                // Add Session 2 (new default)
                                sessionsToAdd.push({
                                  sessionNumber: 2,
                                  startTime: "1970-01-01T09:00:00.000Z",
                                  endTime: "1970-01-01T17:00:00.000Z",
                                  maxTokens: null,
                                });
                              } else {
                                // Add Next Session
                                sessionsToAdd.push({
                                  sessionNumber: currentSessionCount + 1,
                                  startTime: "1970-01-01T09:00:00.000Z",
                                  endTime: "1970-01-01T17:00:00.000Z",
                                  maxTokens: null,
                                });
                              }

                              if (!daySchedule.sessions) daySchedule.sessions = [];
                              daySchedule.sessions.push(...sessionsToAdd);

                              return next;
                            });
                            setConsultationDirty(true);
                          }}
                        >
                          + Add More (Max 6 Slots)
                        </button>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            disabled={!d.available}
                            className="w-4 h-4"
                          />

                          <span>Apply to All Days</span>
                        </label>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Footer consent + Save */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="px-2 sm:px-4 md:px-6 py-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12px] text-gray-600">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                In order to use the platform to its full potential and continue
                using your benefits, kindly accept our{" "}
                <a href="#" className="text-blue-600">
                  Terms and conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600">
                  Privacy policy
                </a>
                .
              </label>
              <button
                disabled={!consultationDirty || savingConsultation}
                onClick={async () => {
                  try {
                    setSavingConsultation(true);

                    // Determine if we should send clinicId or hospitalId
                    const associatedClinicId = doctorDetails?.associatedWorkplaces?.clinic?.id || consultationDetails?.consultationFees?.[0]?.clinicId;
                    const associatedHospitalId = doctorDetails?.associatedWorkplaces?.hospitals?.[0]?.id || consultationDetails?.consultationFees?.[0]?.hospitalId;

                    // Create an object with the correct key (clinicId or hospitalId) to spread into the payload sections
                    // Priority to clinicId if both exist (unlikely but safe), or fallback to hospitalId
                    const locationIdObj = associatedClinicId ? { clinicId: associatedClinicId } : { hospitalId: associatedHospitalId };

                    // Build payload per spec
                    const fees = consultationDetails?.consultationFees?.[0] || {};
                    const schedule =
                      consultationDetails?.slotTemplates?.schedule?.length
                        ? consultationDetails.slotTemplates.schedule
                        : DEFAULT_SCHEDULE;

                    const dayMap = {
                      Monday: "MONDAY",
                      Tuesday: "TUESDAY",
                      Wednesday: "WEDNESDAY",
                      Thursday: "THURSDAY",
                      Friday: "FRIDAY",
                      Saturday: "SATURDAY",
                      Sunday: "SUNDAY",
                    };
                    const toHM = (iso) => {
                      if (!iso) return "";
                      const d = new Date(iso);
                      if (isNaN(d.getTime())) return iso; // Fallback if already formatted or invalid
                      const hh = String(d.getUTCHours()).padStart(2, "0");
                      const mm = String(d.getUTCMinutes()).padStart(2, "0");
                      return `${hh}:${mm}`;
                    };

                    const slotData = schedule
                      .map((d) => {
                        // If day is not available, send empty timings to clear existing slots
                        const sessions = d.available ? (d.sessions || []) : [];
                        return {
                          day: dayMap[d.day] || String(d.day).toUpperCase(),
                          timings: sessions.map((s) => ({
                            startTime: toHM(s.startTime),
                            endTime: toHM(s.endTime),
                            maxTokens: Number(s.maxTokens) || 0,
                          })),
                        };
                      });

                    const payload = {
                      consultationFees: {
                        ...locationIdObj,
                        consultationFee: String(fees.consultationFee ?? ""),
                        followUpFee: String(fees.followUpFee ?? ""),
                        autoApprove: Boolean(fees.autoApprove),
                        avgDurationMinutes: Number(fees.avgDurationMinutes) || 0,
                        availabilityDurationDays: Number(fees.availabilityDurationDays) || undefined,
                      },
                      slotDetails: {
                        ...locationIdObj,
                        slotData,
                      },
                    };

                    const doctorId = doctorDetails?.userId || doctorDetails?.id;
                    // Pass locationIdObj (contains { clinicId: ... } or { hospitalId: ... }) as query params
                    await updateDoctorConsultationDetailsForSuperAdmin(doctorId, payload, locationIdObj);

                    useToastStore.getState().addToast({
                      title: "Success",
                      message: "Consultation details saved successfully",
                      type: "success",
                    });

                    // Refresh data
                    await fetchConsultation();

                    setConsultationDirty(false);
                  } catch (e) {
                    console.error("Save error:", e);
                    useToastStore.getState().addToast({
                      title: "Error",
                      message: e?.response?.data?.message || e.message || "Failed to save details",
                      type: "error",
                    });
                  } finally {
                    setSavingConsultation(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 h-9 rounded text-sm font-medium transition-colors ${!consultationDirty || savingConsultation
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {savingConsultation && <UniversalLoader size={16} className="border-white" />}
                {savingConsultation ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Consultation;
