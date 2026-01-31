import React, { useEffect, useRef, useState } from "react";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "../../components/UniversalLoader";
import {
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ChevronDown,
} from "lucide-react";
import GeneralDrawer from "../GeneralDrawer/GeneralDrawer";
import RadioButton from "../GeneralDrawer/RadioButton";
import InputWithMeta from "../GeneralDrawer/InputWithMeta";
import Dropdown from "../GeneralDrawer/Dropdown";
import {
  findPatientSlots,
  bookWalkInAppointment,
} from "../../services/authService";
import { classifyISTDayPart, buildISTRangeLabel, calculateAge } from "../../lib/timeUtils";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import calendarWhite from "/Doctor_module/sidebar/calendar_white.png";
import AvatarCircle from "../../components/AvatarCircle";
import { searchPatientsForWalkIn } from "../../services/patientService";
import useClinicStore from "../../store/settings/useClinicStore";

// UI-only Book Appointment Drawer using GeneralDrawer and shared inputs
// Integrated Book Appointment Drawer fetching real slots and booking via APIs
export default function BookAppointmentDrawer({
  open,
  onClose,
  onSave,
  doctorId,
  clinicId,
  hospitalId,
  onBookedRefresh,
}) {
  // Wrap public calendar image as an icon component for InputWithMeta
  const CalendarWhiteIcon = () => (
    <img src={calendarWhite} alt="Calendar" className="w-4 h-4" />
  );
  const { addToast } = useToastStore();
  const [isExisting, setIsExisting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [apptType, setApptType] = useState("New Consultation");
  const [reason, setReason] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const dobRef = useRef(null);
  const [apptDate, setApptDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const apptDateRef = useRef(null);
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [showApptDateCalendar, setShowApptDateCalendar] = useState(false);
  const suggestions = [
    "New Consultation",
    "Follow-up Consultation",
    "Review Visit",
  ];
  const reasonSuggestions = ["Cough", "Cold", "Headache", "Nausea", "Dizziness", "Muscle Pain", "Sore Throat"];
  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];
  const bloodGroups = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];
  // Dropdown open states
  const [openApptTypeDD, setOpenApptTypeDD] = useState(false);
  const [openGenderDD, setOpenGenderDD] = useState(false);
  const [openBloodDD, setOpenBloodDD] = useState(false);
  const [openReasonDD, setOpenReasonDD] = useState(false);
  const [openBucketDD, setOpenBucketDD] = useState(false);

  const openOnly = (which) => {
    setOpenApptTypeDD(which === "appt");
    setOpenGenderDD(which === "gender");
    setOpenBloodDD(which === "blood");
    setOpenReasonDD(which === "reason");
    setOpenBucketDD(which === "bucket");
  };

  const toggleOpen = (which) => {
    const isAppt = which === "appt";
    const isGender = which === "gender";
    const isBlood = which === "blood";
    const isReason = which === "reason";
    const alreadyOpen =
      (isAppt && openApptTypeDD) ||
      (isGender && openGenderDD) ||
      (isBlood && openBloodDD);
    if (alreadyOpen) {
      // close all
      openOnly("");
    } else {
      openOnly(which);
    }
  };

  // Real slots from API
  const [grouped, setGrouped] = useState({
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  });
  const [timeBuckets, setTimeBuckets] = useState([]);
  const [bucketKey, setBucketKey] = useState("morning");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [closing, setClosing] = useState(false);

  // Debounced Search for Existing Patients
  useEffect(() => {
    if (!isExisting || !searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const resp = await searchPatientsForWalkIn(searchQuery);
        setSearchResults(resp.data || []);
      } catch (err) {
        console.error("Patient search failed", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, isExisting]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPatient(null);
  }, [isExisting]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && requestClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // Close calendars on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isCalendarClick = target.closest(".shadcn-calendar-dropdown");
      if (!isCalendarClick) {
        setShowDobCalendar(false);
        setShowApptDateCalendar(false);
      }
    };

    if (showDobCalendar || showApptDateCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDobCalendar, showApptDateCalendar]);

  // Load slots when opened or date/ids change
  const { selectedClinicId, selectedWorkplaceType } = useClinicStore();

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!open) return;

      // Determine IDs based on selection or props
      let activeClinicId = undefined;
      let activeHospitalId = undefined;

      if (selectedClinicId && selectedWorkplaceType) {
        const type = selectedWorkplaceType.toLowerCase();
        if (type === "clinic") {
          activeClinicId = selectedClinicId;
        } else if (type === "hospital") {
          activeHospitalId = selectedClinicId;
        }
      } else {
        // Fallback to props
        activeClinicId = clinicId;
        activeHospitalId = hospitalId;
      }

      if (!doctorId || (!activeClinicId && !activeHospitalId)) return;

      setSelectedSlotId(null);
      setGrouped({ morning: [], afternoon: [], evening: [], night: [] });
      setTimeBuckets([]);
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const resp = await findPatientSlots({
          doctorId,
          date: apptDate,
          clinicId: activeClinicId,
          hospitalId: activeHospitalId,
        });
        const arr = Array.isArray(resp)
          ? resp
          : resp?.data || resp?.slots || [];
        if (ignore) return;
        const grp = (arr || []).reduce(
          (acc, s) => {
            const part = classifyISTDayPart(s.startTime);
            if (!acc[part]) acc[part] = [];
            acc[part].push(s);
            return acc;
          },
          { morning: [], afternoon: [], evening: [], night: [] }
        );
        setGrouped(grp);
        const tb = [];
        if (grp.morning.length) {
          const f = grp.morning[0],
            l = grp.morning[grp.morning.length - 1];
          tb.push({
            key: "morning",
            label: "Morning",
            time: buildISTRangeLabel(f.startTime, l.endTime),
            Icon: Sunrise,
          });
        }
        if (grp.afternoon.length) {
          const f = grp.afternoon[0],
            l = grp.afternoon[grp.afternoon.length - 1];
          tb.push({
            key: "afternoon",
            label: "Afternoon",
            time: buildISTRangeLabel(f.startTime, l.endTime),
            Icon: Sun,
          });
        }
        if (grp.evening.length) {
          const f = grp.evening[0],
            l = grp.evening[grp.evening.length - 1];
          tb.push({
            key: "evening",
            label: "Evening",
            time: buildISTRangeLabel(f.startTime, l.endTime),
            Icon: Sunset,
          });
        }
        if (grp.night.length) {
          const f = grp.night[0],
            l = grp.night[grp.night.length - 1];
          tb.push({
            key: "night",
            label: "Night",
            time: buildISTRangeLabel(f.startTime, l.endTime),
            Icon: Moon,
          });
        }
        setTimeBuckets(tb);
        const firstNonEmpty = tb[0]?.key || "morning";
        setBucketKey(firstNonEmpty);
        const firstSlot = (grp[firstNonEmpty] || [])[0] || null;
        setSelectedSlotId(
          firstSlot ? firstSlot.id || firstSlot.slotId || firstSlot._id : null
        );
      } catch (e) {
        if (!ignore)
          setSlotsError(
            e?.response?.data?.message || e.message || "Failed to load slots"
          );
      } finally {
        if (!ignore) setLoadingSlots(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [open, apptDate, doctorId, clinicId, hospitalId, selectedClinicId, selectedWorkplaceType]);

  const requestClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose?.();
    }, 220);
  };

  const canSave = () => {
    if (!selectedSlotId || booking || reason.trim().length < 10 || !apptType) return false;
    if (isExisting) return selectedPatient !== null;
    return firstName && lastName && dob && gender && bloodGroup && mobile;
  };

  const mapBloodGroup = (bg) => {
    if (!bg) return undefined;
    const base = bg.toUpperCase();
    if (base.endsWith("+")) return base.replace("+", "_POSITIVE");
    if (base.endsWith("-")) return base.replace("-", "_NEGATIVE");
    return base;
  };

  const save = async () => {
    if (!canSave() || booking) return;
    setBooking(true);
    setErrorMsg("");
    setFieldErrors({});

    // Determine IDs based on selection or props (consistent with slot loading)
    let activeClinicId = undefined;
    let activeHospitalId = undefined;

    if (selectedClinicId && selectedWorkplaceType) {
      const type = selectedWorkplaceType.toLowerCase();
      if (type === "clinic") {
        activeClinicId = selectedClinicId;
      } else if (type === "hospital") {
        activeHospitalId = selectedClinicId;
      }
    } else {
      activeClinicId = clinicId;
      activeHospitalId = hospitalId;
    }

    try {
      let payload;
      if (isExisting) {
        payload = {
          method: "EXISTING",
          patientId: selectedPatient?.id,
          reason: reason.trim(),
          slotId: selectedSlotId,
          clinicId: activeClinicId,
          hospitalId: activeHospitalId,
          bookingType: apptType?.toUpperCase().includes("FOLLOW")
            ? "FOLLOW_UP"
            : apptType?.toUpperCase().includes("REVIEW")
              ? "FOLLOW_UP"
              : "NEW",
        };
      } else {
        payload = {
          method: "NEW_USER",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: mobile.trim(),
          emailId: (email || "").trim() || undefined,
          dob: dob.trim(),
          gender: (gender || "").toUpperCase(),
          bloodGroup: mapBloodGroup(bloodGroup),
          reason: reason.trim(),
          slotId: selectedSlotId,
          clinicId: activeClinicId,
          hospitalId: activeHospitalId,
          bookingType: apptType?.toUpperCase().includes("REVIEW")
            ? "FOLLOW_UP"
            : "NEW",
        };
      }
      await bookWalkInAppointment(payload);

      addToast({
        title: "Appointment Booked",
        message: "Walk-in appointment successfully booked.",
        type: "success",
        duration: 3000
      });

      onBookedRefresh?.();
      onClose?.();
      if (onSave) onSave(payload);
    } catch (e) {
      const msg = e?.message || "Booking failed";

      addToast({
        title: "Booking Failed",
        message: msg,
        type: "error",
        duration: 4000
      });

      const errs = e?.validation || e?.response?.data?.errors || null;
      if (errs && typeof errs === "object") setFieldErrors(errs);
      setErrorMsg(String(msg));
    } finally {
      setBooking(false);
    }
  };
  return (
    <GeneralDrawer
      isOpen={open}
      onClose={onClose}
      title="Book Walk-In Appointment"
      primaryActionLabel={booking ? (
        <div className="flex items-center gap-2">
          <UniversalLoader size={16} style={{ width: 'auto', height: 'auto' }} />
          <span>Booking Appointment...</span>
        </div>
      ) : "Book Appointment"}
      onPrimaryAction={save}
      primaryActionDisabled={!canSave() || booking}
      width={600}
    >
      <div className="flex flex-col gap-4">
        {/* Radios */}
        <div className="flex items-center gap-6">
          <RadioButton
            name="pt"
            value="existing"
            checked={isExisting}
            onChange={(v) => setIsExisting(v === "existing")}
            label="Existing Patients"
          />
          <RadioButton
            name="pt"
            value="new"
            checked={!isExisting}
            onChange={(v) => setIsExisting(v === "existing" ? true : false)}
            label="New Patient"
          />
        </div>

        {/* Body */}
        {isExisting ? (
          <div className="flex flex-col gap-3">
            {selectedPatient ? (
              <InputWithMeta
                label="Patient"
                requiredDot
                showInput={false}
              >
                <div className="flex items-center gap-2">
                  <div className={`flex-1 rounded-md border-[0.5px] border-secondary-grey150 h-9 text-sm text-secondary-grey400 bg-secondary-grey50 flex items-center px-2 select-none gap-2`}>
                    <AvatarCircle name={selectedPatient.name} size="xs" color="blue" />
                    <span className="truncate">
                      {`${selectedPatient.name} (${selectedPatient.gender?.charAt(0)} | ${selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString('en-GB') : 'N/A'} (${calculateAge(selectedPatient.dob)}Y) | ${selectedPatient.phone})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setSearchQuery("");
                    }}
                    className="text-xs text-blue-primary250 hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              </InputWithMeta>
            ) : (
              <div className="relative">
                <InputWithMeta
                  label="Patient"
                  requiredDot
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search Patient by name, Abha id, Patient ID or Contact Number"
                  RightIcon={searching ? () => (
                    <div className="flex items-center justify-center h-full w-full">
                      <UniversalLoader size={12} style={{ width: 'auto', height: 'auto' }} />
                    </div>
                  ) : undefined}
                />
                {!searching && searchResults.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-[1001] bg-white border border-secondary-grey200 rounded-lg shadow-xl max-h-[250px] overflow-y-auto">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input onBlur if applicable
                          setSelectedPatient(p);
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-secondary-grey50 cursor-pointer border-b border-secondary-grey100 last:border-b-0"
                      >
                        <AvatarCircle name={p.name} size={32} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-secondary-grey400">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-secondary-grey200">
                            {p.patientCode} • {p.phone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-[1001] bg-white border border-secondary-grey200 rounded-lg shadow-xl p-4 text-center text-xs text-secondary-grey400">
                    No patients found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
              <InputWithMeta
                label="First Name"
                requiredDot
                value={firstName}
                onChange={setFirstName}
                placeholder="Enter First Name"
              />
              <InputWithMeta
                label="Last Name"
                requiredDot
                value={lastName}
                onChange={setLastName}
                placeholder="Enter Last Name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
              <InputWithMeta
                label="Mobile Number"
                requiredDot
                value={mobile}
                onChange={setMobile}
                placeholder="Enter Mobile Number"
              />
              <div className="relative">
                <InputWithMeta
                  label="Date of Birth"
                  requiredDot
                  value={dob}
                  placeholder="Select Date of Birth"
                  RightIcon={CalendarWhiteIcon}
                  onIconClick={() => setShowDobCalendar((v) => !v)}
                  dropdownOpen={showDobCalendar}
                  onRequestClose={() => setShowDobCalendar(false)}
                />
                {showDobCalendar && (
                  <div className="shadcn-calendar-dropdown absolute z-[10000]  bg-white border border-gray-200 rounded-xl shadow-2xl p-2">
                    <ShadcnCalendar
                      mode="single"
                      selected={dob ? new Date(dob) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          setDob(`${year}-${month}-${day}`);
                        }
                        setShowDobCalendar(false);
                      }}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      className="rounded-lg p-1"
                      classNames={{
                        day_selected:
                          "bg-blue-primary250 text-white hover:bg-blue-primary250",
                        // keep today subtle default; no blue accents
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
              <div className="relative">
                <InputWithMeta
                  label="Blood Group"
                  requiredDot
                  value={bloodGroup}
                  placeholder="Select Blood Group"
                  RightIcon={ChevronDown}
                  onFieldOpen={() => setOpenBloodDD(!openBloodDD)}
                  dropdownOpen={openBloodDD}
                  dropdownItems={bloodGroups}
                  onSelectItem={(it) => setBloodGroup(it.value)}
                  onRequestClose={() => setOpenBloodDD(false)}
                />
              </div>
              <div className="relative">
                <InputWithMeta
                  label="Gender"
                  requiredDot
                  value={gender}
                  placeholder="Select Gender"
                  RightIcon={ChevronDown}
                  onFieldOpen={() => setOpenGenderDD(!openGenderDD)}
                  dropdownOpen={openGenderDD}
                  dropdownItems={genders}
                  onSelectItem={(it) => setGender(it.value)}
                  onRequestClose={() => setOpenGenderDD(false)}
                />
              </div>
            </div>
            <div className="">
              <InputWithMeta
                label="Email ID"
                value={email}
                onChange={setEmail}
                placeholder="Enter Email"
              />
            </div>
          </>
        )}

        <div className="relative">
          <InputWithMeta
            label="Appointment Type"
            requiredDot
            value={apptType}
            onChange={setApptType}
            placeholder="Select or Enter Appointment Type"
            RightIcon={ChevronDown}
            onFieldOpen={() => setOpenApptTypeDD(!openApptTypeDD)}
            dropdownOpen={openApptTypeDD}
            dropdownItems={[
              "New Consultation",
              "Follow-up Consultation",
              "Review Visit",
              "Routine Health Check-up",
              "Emergency OPD (Non-admission)",
              "Second Opinion",
            ].map((t) => ({ label: t, value: t }))}
            onSelectItem={(it) => setApptType(it.value)}
            onRequestClose={() => setOpenApptTypeDD(false)}
          />
          <div className="flex gap-2 items-center mt-1">
            <div className="text-xs text-blue-primary250">Suggestion:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="px-1 py-0.5 bg-secondary-grey50 rounded-[4px] min-w-[18px] text-xs text-secondary-grey300 hover:bg-gray-50"
                  type="button"
                  onClick={() => setApptType(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <InputWithMeta
            label="Reason for Visit"
            value={reason}
            onChange={setReason}
            requiredDot
            placeholder="Enter Reason for Visit (Min 10 characters)"
            inputRightMeta={
              <div className={`text-[10px] font-medium ${reason.trim().length < 10 ? 'text-red-500' : 'text-green-600'}`}>
                {reason.trim().length}/10
              </div>
            }
          />
          <div className="flex justify-between items-center mt-1">
            <div className="flex gap-2 items-center">
              <div className="text-xs text-blue-primary250">Suggestion:</div>
              <div className="flex flex-wrap gap-2">
                {reasonSuggestions.map((s) => (
                  <button
                    key={s}
                    className="px-1 py-0.5 bg-secondary-grey50 rounded-[4px] min-w-[18px] text-xs text-secondary-grey300 hover:bg-gray-50"
                    type="button"
                    onClick={() => setReason(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {reason.trim().length > 0 && reason.trim().length < 10 && (
            <div className="text-[10px] text-red-500 mt-0.5">Reason must be at least 10 characters long.</div>
          )}
        </div>

        <div className="bg-secondary-grey150 w-0.5px h-[1px] "></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
          <div className="relative">
            <InputWithMeta
              label="Appointment Date"
              requiredDot
              value={apptDate}
              onChange={setApptDate}
              placeholder="YYYY-MM-DD"
              RightIcon={CalendarWhiteIcon}
              onIconClick={() => setShowApptDateCalendar((v) => !v)}
              dropdownOpen={showApptDateCalendar}
              onRequestClose={() => setShowApptDateCalendar(false)}
            />
            {showApptDateCalendar && (
              <div className="shadcn-calendar-dropdown absolute z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl">
                <ShadcnCalendar
                  mode="single"
                  selected={apptDate ? new Date(apptDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      setApptDate(`${year}-${month}-${day}`);
                    }
                    setShowApptDateCalendar(false);
                  }}
                  captionLayout="dropdown"
                  fromYear={new Date().getFullYear() - 1}
                  toYear={new Date().getFullYear() + 1}
                  className="rounded-lg "
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-600",
                    // keep other controls neutral; no blue accents
                  }}
                />
              </div>
            )}
          </div>
          {/* Available Slot visible for both Existing/New patients */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <InputWithMeta
                label="Available Slot"
                requiredDot
                value={(() => {
                  if (loadingSlots) return "Loading…";
                  if (!timeBuckets.length) return "No slots available";
                  const cur =
                    timeBuckets.find((tb) => tb.key === bucketKey) ||
                    timeBuckets[0];
                  const t = cur?.time || "loading…";
                  return `${cur.label} - (${t})`;
                })()}
                rightMeta={(() => {
                  const curSlots = grouped[bucketKey] || [];
                  const curSlot = curSlots[0];
                  if (!curSlot) return null;
                  // Use availableTokens if present, else fallback logic if needed
                  const avail = curSlot.availableTokens !== undefined ? curSlot.availableTokens : (curSlot.maxTokens || 0);
                  return `${avail} Tokens Available`;
                })()}
                placeholder="Select"
                RightIcon={ChevronDown}
                onFieldOpen={() => setOpenBucketDD(!openBucketDD)}
                dropdownOpen={openBucketDD}
                onRequestClose={() => setOpenBucketDD(false)}
                dropdownItems={timeBuckets.map(({ key, label, time }) => ({
                  label: `${label} - (${time || "loading…"})`,
                  value: key,
                }))}
                onSelectItem={(it) => {
                  const key = it.value;
                  setBucketKey(key);
                  const firstSlot = (grouped[key] || [])[0] || null;
                  setSelectedSlotId(
                    firstSlot
                      ? firstSlot.id || firstSlot.slotId || firstSlot._id
                      : null
                  );
                }}
                selectedValue={bucketKey}
              />
            </div>
            {loadingSlots && (
              <div className="text-xs text-gray-500">Loading slots…</div>
            )}
            {slotsError && (
              <div className="text-xs text-red-600">{slotsError}</div>
            )}
          </div>
        </div>

      </div>
    </GeneralDrawer>
  );
}
