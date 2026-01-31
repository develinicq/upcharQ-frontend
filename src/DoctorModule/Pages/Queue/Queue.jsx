import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar, X, Clock, ChevronDown, Info } from "lucide-react";
import { Morning, Afternoon, Evening, Night } from "../../../components/Icons/SessionIcons";
import {
  bookWalkInAppointment,
  findPatientSlots,
} from "../../../services/authService";
import { classifyISTDayPart, buildISTRangeLabel } from "../../../lib/timeUtils";
import QueueDatePicker from "../../../components/QueueDatePicker";
import AvatarCircle from "../../../components/AvatarCircle";
import Button from "../../../components/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import Badge from "../../../components/Badge";
import { calendarMinimalistic } from "../../../../public/index.js";
import OverviewStatCard from "../../../components/OverviewStatCard";
import Toggle from "../../../components/FormItems/Toggle";
import QueueTable from "./QueueTable";
import useDoctorAuthStore from "../../../store/useDoctorAuthStore";
import useToastStore from "../../../store/useToastStore";
import UniversalLoader from "../../../components/UniversalLoader";
import useSlotStore from "../../../store/useSlotStore";
import {
  getDoctorMe,
  startSlotEta,
  endSlotEta,
  getSlotEtaStatus,
  startPatientSessionEta,
  endPatientSessionEta,
  pauseSlotEta,
  resumeSlotEta,
  markNoShowAppointment,
  terminateQueue,
} from "../../../services/authService";
import {
  action_dot,
  appointement,
  morningQueue,
  nightQueue,
  afternoonQueue,
  eveningQueue,
  downloadIcon,
  refresh,
  terminate,
  vertical,
  queueUndo,
  calenderUndo,
  angelDown,
  pauseIconRed,
  timerOrange,

} from "../../../../public/index.js";

const more = '/superAdmin/Doctors/Threedots.svg'
const checkRound = '/fd/Check Round.svg';
const verified = '/verified-tick.svg'
const stopwatch = '/fd/Stopwatch.svg'
const verifiedYellow = '/fd/verified_yellow.svg'

import BookAppointmentDrawer from "../../../components/Appointment/BookAppointmentDrawer.jsx";
import PauseQueueModal from "../../../components/PauseQueueModal.jsx";
import TerminateQueueModal from "../../../components/TerminateQueueModal.jsx";
import OutOfOfficeDrawer from "../../Components/OutOfOfficeDrawer.jsx";
import SessionTimer from "../../../components/SessionTimer";
import {
  RotateCcw,
  CalendarMinus,
  CalendarX,
  User,
  BedDouble,
  CheckCheck,
  Bell,
  CalendarPlus,
  UserX,
  ArrowRight,
  Play,
  PauseCircle,
} from "lucide-react";

// Walk-in Appointment Drawer (full version replicated from Front Desk)
const WalkInAppointmentDrawer = ({
  show,
  onClose,
  doctorId,
  clinicId,
  hospitalId,
  onBookedRefresh,
}) => {
  const [isExisting, setIsExisting] = useState(false);
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
  const [apptDate, setApptDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const apptDateRef = useRef(null);
  const suggestions = [
    "New Consultation",
    "Follow-up Consultation",
    "Review Visit",
  ];
  const reasonSuggestions = [
    "Cough",
    "Cold",
    "Headache",
    "Nausea",
    "Dizziness",
    "Muscle Pain",
    "Sore Throat",
  ];
  const genders = ["Male", "Female", "Other"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDobCalendar, setShowDobCalendar] = useState(false);
  const [showApptDateCalendar, setShowApptDateCalendar] = useState(false);
  // Local slots state
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
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!show) return;
      if (!doctorId || (!clinicId && !hospitalId)) return;
      setSelectedSlotId(null);
      setGrouped({ morning: [], afternoon: [], evening: [], night: [] });
      setTimeBuckets([]);
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const resp = await findPatientSlots({
          doctorId,
          date: apptDate,
          clinicId,
          hospitalId,
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
  }, [show, apptDate, doctorId, clinicId, hospitalId]);

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

  const canBook = () => !booking;
  const handleBook = async () => {
    if (!canBook()) return;
    setBooking(true);
    setErrorMsg("");
    setFieldErrors({});
    try {
      const mapBloodGroup = (bg) => {
        if (!bg) return undefined;
        const base = bg.toUpperCase();
        if (base.endsWith("+")) return base.replace("+", "_POSITIVE");
        if (base.endsWith("-")) return base.replace("-", "_NEGATIVE");
        return base;
      };
      const apiBloodGroup = mapBloodGroup(bloodGroup);
      let payload;
      if (isExisting) {
        // Existing patient flow remains as-is (backend contract may differ)
        payload = {
          method: "EXISTING",
          bookingMode: "WALK_IN",
          patientId: mobile.trim(),
          reason: reason.trim(),
          slotId: selectedSlotId,
          bookingType: apptType?.toLowerCase().includes("follow")
            ? "FOLLOW_UP"
            : "NEW",
          doctorId,
          clinicId,
          hospitalId,
          date: apptDate,
        };
      } else {
        // Modify payload to match required API format for walk-in NEW_USER
        // Expected:
        // { method, firstName, lastName, phone, emailId, dob, gender, bloodGroup, reason, slotId, bookingType }
        payload = {
          method: "NEW_USER",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: mobile.trim(),
          emailId: (email || "").trim() || undefined,
          dob: dob.trim(),
          gender: (gender || "").toUpperCase(),
          bloodGroup: apiBloodGroup,
          reason: reason.trim(),
          slotId: selectedSlotId,
          bookingType: apptType?.toUpperCase().includes("REVIEW")
            ? "FOLLOW_UP"
            : "NEW",
        };
      }
      try {
        console.debug("[Doctor] walk-in booking payload:", payload);
      } catch { }
      await bookWalkInAppointment(payload);
      onBookedRefresh?.();
      onClose();
    } catch (e) {
      const msg = e?.message || "Booking failed";
      const errs = e?.validation || e?.response?.data?.errors || null;
      if (errs && typeof errs === "object") setFieldErrors(errs);
      setErrorMsg(String(msg));
    } finally {
      setBooking(false);
    }
  };
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ${show
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />
      <div
        className={`fixed z-50 transition-transform duration-500 ${show ? "translate-x-0" : "translate-x-full"
          }`}
        style={{
          top: 24,
          right: show ? 24 : 0,
          bottom: 24,
          width: 520,
          maxWidth: "100vw",
          background: "white",
          borderTopLeftRadius: 14,
          borderBottomLeftRadius: 14,
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[18px] font-semibold">
              Book Walk-In Appointment
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBook}
                disabled={!canBook()}
                className={`text-sm font-medium rounded px-3 py-1.5 border ${canBook()
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                  }`}
              >
                {booking ? "Booking..." : "Book Appointment"}
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <RadioGroup
            value={isExisting ? "existing" : "new"}
            onValueChange={(value) => setIsExisting(value === "existing")}
            className="flex items-center gap-6 mt-2 mb-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="existing" id="queue-existing" />
              <label
                htmlFor="queue-existing"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Existing Patients
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="new" id="queue-new" />
              <label
                htmlFor="queue-new"
                className="text-sm text-gray-700 cursor-pointer"
              >
                New Patient
              </label>
            </div>
          </RadioGroup>
          {errorMsg && (
            <div className="mb-3 p-2 rounded border border-red-200 bg-red-50 text-[12px] text-red-700">
              {errorMsg}
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {isExisting ? (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Search Patient by name, Abha id, Patient ID or Contact Number"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.firstName
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                        }`}
                      placeholder="Enter First Name"
                    />
                    {fieldErrors.firstName && (
                      <div className="text-[11px] text-red-600 mt-1">
                        {String(fieldErrors.firstName)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.lastName
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                        }`}
                      placeholder="Enter Last Name"
                    />
                    {fieldErrors.lastName && (
                      <div className="text-[11px] text-red-600 mt-1">
                        {String(fieldErrors.lastName)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        type="text"
                        placeholder="Select Date of Birth"
                        className={`w-full rounded-md border px-3 py-2 text-sm pr-8 focus:outline-none ${fieldErrors.dob
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDobCalendar(!showDobCalendar)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        <img
                          src={calendarMinimalistic}
                          alt="Calendar"
                          className="w-4 h-4"
                        />
                      </button>
                      {showDobCalendar && (
                        <div className="shadcn-calendar-dropdown absolute z-[9999] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          <ShadcnCalendar
                            mode="single"
                            selected={dob ? new Date(dob) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(
                                  date.getMonth() + 1
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0"
                                );
                                setDob(`${year}-${month}-${day}`);
                              }
                              setShowDobCalendar(false);
                            }}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            className="rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    {fieldErrors.dob && (
                      <div className="text-[11px] text-red-600 mt-1">
                        {String(fieldErrors.dob)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.gender
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                        }`}
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      {genders.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.gender && (
                      <div className="text-[11px] text-red-600 mt-1">
                        {String(fieldErrors.gender)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.bloodGroup
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                        }`}
                    >
                      <option value="" disabled>
                        Select Blood Group
                      </option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.bloodGroup && (
                      <div className="text-[11px] text-red-600 mt-1">
                        {String(fieldErrors.bloodGroup)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      type="tel"
                      className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.phone || fieldErrors.mobile
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                        }`}
                      placeholder="Enter Mobile Number"
                    />
                    {(fieldErrors.phone || fieldErrors.mobile) && (
                      <div className="text-[11px] text-red-600 mt-1">
                        {String(fieldErrors.phone || fieldErrors.mobile)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.email || fieldErrors.emailId
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                      }`}
                    placeholder="Enter Email"
                  />
                  {(fieldErrors.email || fieldErrors.emailId) && (
                    <div className="text-[11px] text-red-600 mt-1">
                      {String(fieldErrors.email || fieldErrors.emailId)}
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="mb-3 mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={apptType}
                onChange={(e) => setApptType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {suggestions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => setApptType(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                type="text"
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${fieldErrors.reason || fieldErrors.reasonForVisit
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
                  }`}
                placeholder="Enter Reason for Visit"
              />
              {(fieldErrors.reason || fieldErrors.reasonForVisit) && (
                <div className="text-[11px] text-red-600 mt-1">
                  {String(fieldErrors.reason || fieldErrors.reasonForVisit)}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {reasonSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => setReason(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm pr-8 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowApptDateCalendar(!showApptDateCalendar)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <img
                      src={calendarMinimalistic}
                      alt="Calendar"
                      className="w-4 h-4"
                    />
                  </button>
                  {showApptDateCalendar && (
                    <div className="shadcn-calendar-dropdown absolute z-[9999] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
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
                        className="rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                {(() => {
                  const all = [
                    ...(grouped.morning || []),
                    ...(grouped.afternoon || []),
                    ...(grouped.evening || []),
                    ...(grouped.night || []),
                  ];
                  let current = null;
                  if (selectedSlotId) {
                    current =
                      all.find(
                        (s) => (s.id || s.slotId || s._id) === selectedSlotId
                      ) || null;
                  } else {
                    const g = grouped[bucketKey] || [];
                    current = g[0] || null;
                  }
                  const avail =
                    current?.availableTokens ??
                    current?.tokensAvailable ??
                    current?.remainingTokens ??
                    current?.available ??
                    current?.tokensLeft;
                  const total =
                    current?.totalTokens ??
                    current?.capacity ??
                    current?.maxTokens;
                  const label =
                    (avail ?? "") !== ""
                      ? `${avail}${total != null ? ` of ${total}` : ""
                      } Tokens available`
                      : loadingSlots
                        ? "Loading slots…"
                        : slotsError
                          ? "Slots unavailable"
                          : "Tokens info unavailable";
                  return (
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Slot <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-xs ${avail > 0 ? "text-green-600" : "text-amber-600"
                          }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })()}
                <select
                  className={`w-full rounded-md border px-3 py-2 text-sm ${fieldErrors.slotId
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                    }`}
                  value={bucketKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setBucketKey(key);
                    const group = grouped[key] || [];
                    if (group.length) {
                      const first = group[0];
                      const id = first.id || first.slotId || first._id;
                      setSelectedSlotId(id || null);
                    } else {
                      setSelectedSlotId(null);
                    }
                  }}
                >
                  {timeBuckets.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label} ({t.time})
                    </option>
                  ))}
                </select>
                {fieldErrors.slotId && (
                  <div className="mt-1 text-[11px] text-red-600">
                    {String(fieldErrors.slotId)}
                  </div>
                )}
                {!selectedSlotId && (
                  <div className="mt-2 text-xs text-amber-600">
                    {loadingSlots
                      ? "Loading slots for date…"
                      : "Select a slot to enable booking."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Queue = () => {
  const [slotEnding, setSlotEnding] = useState(false);

  // Queue is restricted to Checked-In only for both Doctor & FD views
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentDate, setCurrentDate] = useState(new Date());
  // Auth (Using useDoctorAuthStore for Doctor module)
  const { user: doctorDetails, loading: doctorLoading, fetchMe: fetchDoctorDetails } = useDoctorAuthStore();
  useEffect(() => {
    if (!doctorDetails && !doctorLoading) {
      fetchDoctorDetails();
    }
  }, [doctorDetails, doctorLoading, fetchDoctorDetails]);
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `${age}Y` : "";
  };

  const formatSlotTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const mapAppointmentToRow = (appt) => {
    const p = appt.patientDetails || {};
    return {
      token: appt.tokenNo,
      patientName: p.name || `${p.firstName} ${p.lastName}`.trim(),
      gender: p.gender === "MALE" ? "M" : p.gender === "FEMALE" ? "F" : "O",
      dob: p.dob ? new Date(p.dob).toLocaleDateString() : "",
      age: p.age ? `${p.age}Y` : calculateAge(p.dob),
      appointmentType:
        appt.appointmentType === "NEW"
          ? "New Consultation"
          : "Follow-up Consultation",
      expectedTime: appt.expectedTime ? formatSlotTime(appt.expectedTime) : "",
      startTime: appt.startTime ? formatSlotTime(appt.startTime) : "",
      endTime: appt.endTime ? formatSlotTime(appt.endTime) : "",
      bookingType: appt.bookingMode === "WALK_IN" ? "Walk-In" : "Online",
      reason: appt.reason,
      reasonForVisit: appt.reason, // for active card
      id: appt.id,
    };
  };

  const [queueData, setQueueData] = useState([]);
  const { addToast } = useToastStore();

  // Slot store
  const {
    slots,
    slotsLoading,
    selectedSlotId,
    selectSlot,
    loadSlots,
    loadAppointmentsForSelectedSlot,
    slotAppointments,
  } = useSlotStore();
  const doctorId = doctorDetails?.id || doctorDetails?._id || doctorDetails?.userId;
  const clinicId =
    doctorDetails?.associatedWorkplaces?.clinic?.id || doctorDetails?.clinicId;
  const hospitalId =
    (Array.isArray(doctorDetails?.associatedWorkplaces?.hospitals) &&
      doctorDetails?.associatedWorkplaces?.hospitals[0]?.id) ||
    doctorDetails?.hospitalId ||
    undefined;

  useEffect(() => {
    if (!doctorId || (!clinicId && !hospitalId)) return;
    const d = currentDate;
    const dateIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    loadSlots({ doctorId, date: dateIso, clinicId, hospitalId });
  }, [doctorId, clinicId, hospitalId, currentDate, loadSlots]);
  useEffect(() => {
    if (selectedSlotId) {
      loadAppointmentsForSelectedSlot();
    }
  }, [selectedSlotId, loadAppointmentsForSelectedSlot]);



  // Session + patient timer
  const [sessionStarted, setSessionStarted] = useState(false);
  const [slotStarting, setSlotStarting] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Pin the currently active token when a session is running so UI interactions don't change it
  const pinnedTokenRef = useRef(null);
  const [runStartAt, setRunStartAt] = useState(null);
  const [baseElapsed, setBaseElapsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const wasRunningOnPauseRef = useRef(false);
  const [queuePaused, setQueuePaused] = useState(false);
  const [pauseEndsAt, setPauseEndsAt] = useState(null);
  const [pauseRemaining, setPauseRemaining] = useState(0);
  const pauseTickerRef = useRef(null);
  const autoResumeTimerRef = useRef(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMinutes, setPauseMinutes] = useState(null);
  const [pauseSubmitting, setPauseSubmitting] = useState(false);
  const [pauseError, setPauseError] = useState("");
  const [resumeSubmitting, setResumeSubmitting] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminateSubmitting, setTerminateSubmitting] = useState(false);
  const [isOOOOpen, setIsOOOOpen] = useState(false);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false); // New animation state
  // NEW: Strict Active Patient from Polling
  const [backendCurrentToken, setBackendCurrentToken] = useState(null); // Restore backendCurrentToken state
  const [polledActivePatient, setPolledActivePatient] = useState(null);

  // IF polledActivePatient is null, the card hides. 
  // EXCEPT when isAnimationRunning is true, we preserve the LAST patient details to show "Completed"
  const lastPatientRef = useRef(null);
  const activePatient = useMemo(() => {
    if (polledActivePatient) {
      lastPatientRef.current = polledActivePatient;
      return polledActivePatient;
    }
    if (isAnimationRunning) return lastPatientRef.current;
    return null;
  }, [polledActivePatient, isAnimationRunning]);

  // Removed old currentIndex-based activePatient logic and old backendActiveDetails


  // Timer interval
  useEffect(() => {
    if (!runStartAt || !sessionStarted || queuePaused) {
      setElapsed(baseElapsed);
      return;
    }
    const id = setInterval(() => {
      setElapsed(
        baseElapsed + Math.max(0, Math.floor((Date.now() - runStartAt) / 1000))
      );
    }, 1000);
    setElapsed(
      baseElapsed + Math.max(0, Math.floor((Date.now() - runStartAt) / 1000))
    );
    return () => clearInterval(id);
  }, [runStartAt, sessionStarted, queuePaused, baseElapsed]);
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  // REMOVED 'sync' effect. Logic consolidated into pollQueueStatus below.


  // Map appointments to queueData after sessionStarted & backend token state available
  useEffect(() => {
    const categories = slotAppointments?.appointments;
    if (!categories) {
      setQueueData([]);
      return;
    }
    const engaged = categories.engaged || [];
    const checked = categories.checkedIn || [];
    const admitted = categories.admitted || [];
    const noShowObj = categories.noShow || {};
    const noShow = Array.isArray(noShowObj) ? noShowObj : (noShowObj.all || []);

    // Construct 'All' from relevant categories, excluding 'In Waiting'
    const all = [
      ...(categories.engaged || []),
      ...(categories.checkedIn || []),
      ...(categories.admitted || []),
      ...noShow,
    ];
    const mapAppt = (appt) => {
      if (!appt) return null;
      const p = appt.patientDetails || appt.patient || {};
      const name =
        p.name ||
        [p.firstName, p.lastName].filter(Boolean).join(" ") ||
        "Patient";
      const genderRaw = p.gender || appt.gender || "";
      const gender = genderRaw ? genderRaw[0].toUpperCase() : "—";
      let ageStr = "";
      try {
        if (p.dob) {
          const d = new Date(p.dob);
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yyyy = d.getFullYear();
          const now = new Date();
          let age =
            now.getFullYear() -
            yyyy -
            (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())
              ? 1
              : 0);
          ageStr = `${dd}/${mm}/${yyyy} (${age}Y)`;
        }
      } catch { }
      const apptTypeMap = {
        NEW: "New Consultation",
        FOLLOW_UP: "Follow-up Consultation",
        REVIEW: "Review Visit",
        SECOND_OPINION: "Second Opinion",
      };
      const appointmentType =
        apptTypeMap[appt.appointmentType] ||
        appt.appointmentType ||
        "Consultation";
      const expectedTime = appt.expectedTime
        ? new Date(appt.expectedTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
        : "";
      const startTime = appt.appointmentStartTime
        ? new Date(appt.appointmentStartTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
        : "";
      const endTime = appt.appointmentEndTime
        ? new Date(appt.appointmentEndTime).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
        : "";
      const bookingType =
        appt.bookingMode === "ONLINE"
          ? "Online"
          : appt.bookingMode === "WALK_IN"
            ? "Walk-In"
            : appt.bookingType || "";
      const reason = appt.reason || appt.reasonForVisit || "";
      return {
        id: appt.id || appt.appointmentId,
        token:
          appt.tokenNo != null
            ? Number(appt.tokenNo)
            : appt.token != null
              ? Number(appt.token)
              : undefined,
        patientName: name,
        gender,
        age: ageStr,
        appointmentType,
        expectedTime,
        startTime,
        endTime,
        bookingType,
        reasonForVisit: reason,
        status: appt.status || "Waiting",
        startedAt: appt.startedAt || null,
      };
    };
    // Filter queue data based on activeFilter
    let base = [];
    if (activeFilter === "Engaged") base = engaged;
    else if (activeFilter === "Checked In") base = checked;
    else if (activeFilter === "No Show") {
      if (!Array.isArray(noShowObj)) {
        // New grouped format
        const within = (noShowObj.withinGracePeriod || []).map(mapAppt).filter(Boolean);
        const outside = (noShowObj.outsideGracePeriod || []).map(mapAppt).filter(Boolean);

        const result = [];
        if (within.length > 0) {
          result.push({ isSeparator: true, label: "Within Grace Period" });
          result.push(...within);
        }
        if (outside.length > 0) {
          result.push({ isSeparator: true, label: "Outside Grace Period" });
          result.push(...outside);
        }
        setQueueData(result);
        return;
      }
      base = noShow;
    } else if (activeFilter === "Admitted") base = admitted;
    else if (activeFilter === "All") base = all;
    else base = checked; // Default fallback

    const mapped = base.map(mapAppt).filter(Boolean);
    setQueueData(mapped);
    // Maintain current token selection: prefer backend currentToken, else pinned token during session
    let desiredToken = null;
    if (backendCurrentToken != null) {
      desiredToken = Number(backendCurrentToken);
    } else if (sessionStarted && pinnedTokenRef.current != null) {
      desiredToken = Number(pinnedTokenRef.current);
    }
    if (desiredToken != null) {
      const idx = mapped.findIndex(
        (item) => Number(item?.token) === desiredToken
      );
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
      // clear backend token once applied
      if (backendCurrentToken != null) setBackendCurrentToken(null);
    }
    // Sync timer with backend startedAt if available
    if (categories && categories.engaged && categories.engaged.length > 0) {
      const active = categories.engaged[0];
      if (active && active.startedAt) {
        const backendStart = new Date(active.startedAt).getTime();
        setRunStartAt(backendStart);
        setBaseElapsed(Math.floor((Date.now() - backendStart) / 1000));
      }
    }
  }, [slotAppointments, sessionStarted, backendCurrentToken, activeFilter]);

  // Consolidated Poll Logic
  const pollQueueStatus = async () => {
    if (!selectedSlotId) return;
    try {
      const st = await getSlotEtaStatus(selectedSlotId);
      if (st.message || st.success) {
        const msg = st.message || st;

        const slotStatus = msg?.slotStatus;
        const currentToken = msg?.currentToken;
        const pauseDurationMinutes = msg?.pauseDurationMinutes;
        const pauseStartedAt = msg?.pauseStartedAt;
        const activeDetails = msg?.activePatientDetails;

        // 1. Sync Session Status
        const isStarted = slotStatus === "STARTED" || slotStatus === "PAUSED";

        // Avoid fluctuation: only set if changed
        if (isStarted !== sessionStarted) {
          setSessionStarted(isStarted);
        }

        // 2. Sync Pause
        const isPaused = slotStatus === "PAUSED";
        if (isPaused !== queuePaused) setQueuePaused(isPaused);
        if (isPaused && pauseStartedAt && pauseDurationMinutes) {
          const start = new Date(pauseStartedAt).getTime();
          const ends = start + (pauseDurationMinutes * 60 * 1000);
          // Only update if significantly different to avoid timer jitter
          if (!pauseEndsAt || Math.abs(pauseEndsAt - ends) > 2000) {
            setPauseEndsAt(ends);
          }
        } else if (!isPaused) {
          if (pauseEndsAt) setPauseEndsAt(null);
        }

        // 3. Sync Current Token (Backend)
        if (currentToken != null) {
          setBackendCurrentToken(currentToken);
        }

        // 4. Mapped Active Patient (Strict)
        if (activeDetails) {
          const p = activeDetails;
          const genderMap = { MALE: "M", FEMALE: "F", OTHER: "O" };
          let ageStr = "";
          try {
            if (p.dob) {
              const d = new Date(p.dob);
              const today = new Date();
              let age = today.getFullYear() - d.getFullYear();
              const m = today.getMonth() - d.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
                age--;
              }
              const dd = String(d.getDate()).padStart(2, "0");
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const yyyy = d.getFullYear();
              ageStr = `${dd}/${mm}/${yyyy} (${age}Y)`;
            }
          } catch { }

          const newActive = {
            patientName: `${p.firstName} ${p.lastName}`.trim(),
            token: p.tokenNumber,
            gender: genderMap[(p.gender || "").toUpperCase()] || (p.gender || "—")[0] || "—",
            age: ageStr,
            reasonForVisit: p.reason || "",
            appointmentStatus: p.appointmentStatus || p.status || (isPaused ? 'PAUSED' : 'ONGOING'),
            startedAt: p.startedAt,
            // Add any other fields needed
          };

          // Deep compare to avoid fluctuation
          if (JSON.stringify(newActive) !== JSON.stringify(polledActivePatient)) {
            setPolledActivePatient(newActive);
          }

          // Timer Sync
          if (p.startedAt) {
            const ts = new Date(p.startedAt).getTime();
            if (!isNaN(ts)) {
              // Only sync if runStartAt is null or drifted
              const drift = Math.abs(Date.now() - ts - (runStartAt ? Date.now() - runStartAt : 0));
              if (!runStartAt || drift > 2000) {
                setRunStartAt(ts);
                setBaseElapsed(Math.floor((Date.now() - ts) / 1000));
              }
            }
          }
        } else {
          if (polledActivePatient !== null) setPolledActivePatient(null);
          // If no active patient but session started, maybe handle idle state?
          // FDQueue logic just sets null.
        }

      }
    } catch (e) {
      console.error("Poll failed", e);
    }
  };

  useEffect(() => {
    if (!selectedSlotId) return;
    pollQueueStatus();
    loadAppointmentsForSelectedSlot();

    const id = setInterval(() => {
      pollQueueStatus();
      loadAppointmentsForSelectedSlot();
    }, 60000); // 60s Interval

    return () => clearInterval(id);
  }, [selectedSlotId, doctorId, clinicId, sessionStarted, queuePaused]); // Include state deps to refresh closure


  const resetLocalQueueState = () => {
    setSessionStarted(false);
    setQueuePaused(false);
    setRunStartAt(null);
    setBaseElapsed(0);
    setElapsed(0);
    wasRunningOnPauseRef.current = false;
    setCurrentIndex(0);
    pinnedTokenRef.current = null;
  };

  const handleToggleSession = async () => {
    if (sessionStarted) {
      setPauseMinutes(null);
      setShowPauseModal(true);
      return;
    }
    if (!selectedSlotId) {
      addToast({ title: "Error", message: "Select a slot first", type: "error" });
      return;
    }
    setSlotStarting(true);
    setIsStartingSession(true);
    setQueuePaused(false);
    setRunStartAt(null);
    setBaseElapsed(0);
    setElapsed(0);
    wasRunningOnPauseRef.current = false;
    setCurrentIndex(0);
    try {
      await startSlotEta(selectedSlotId);
      setSessionStarted(true);
      addToast({ title: "Session Started", message: "Queue session started.", type: "success" });

      // Auto-start first patient if available
      // We should load appointments first to ensure we have the latest list
      try {
        await loadAppointmentsForSelectedSlot();

        // Use store state directly to avoid waiting for component re-render/useEffect
        const latestSlots = useSlotStore.getState().slotAppointments;
        const checkedInList = latestSlots?.appointments?.checkedIn || [];

        if (checkedInList.length > 0) {
          const firstAppt = checkedInList[0];
          // Map to a usable format or just extract token
          const token = firstAppt.tokenNo || firstAppt.token;
          if (token != null) {
            await startPatientSessionEta(selectedSlotId, token);
            await pollQueueStatus(); // Get the active details immediately
          }
        }
      } catch (e) {
        console.error("Auto-start patient failed", e);
      }
    } catch (e) {
      console.error("Start slot failed", e?.response?.data || e.message);
      const msg = e?.response?.data?.message || e.message || "Failed to start session";
      addToast({ title: "Error", message: msg, type: "error" });
      setSessionStarted(false);
    } finally {
      setSlotStarting(false);
      setIsStartingSession(false);
    }
  };

  // Doctor actions: Mark No-Show from actions menu, then refresh the slot appointments
  const [isMarkingNoShowState, setIsMarkingNoShowState] = useState(false);
  const [isEndingPatient, setIsEndingPatient] = useState(false); // New loading state for End Session
  const [isStartingPatient, setIsStartingPatient] = useState(false); // New loading state for Start Session

  const handleStartPatientSession = async (token) => {
    if (!selectedSlotId || token == null) return;
    setIsStartingPatient(token);
    try {
      const res = await startPatientSessionEta(selectedSlotId, token);
      if (res.data?.success || res.success) {
        addToast({ title: "Session Started", message: `Session started for Token ${token}`, type: "success" });
        setRunStartAt(Date.now());
        pinnedTokenRef.current = token;
        await pollQueueStatus();
      }
    } catch (e) {
      console.error("Manual patient start failed", e?.response?.data || e.message);
      addToast({ title: "Error", message: "Failed to start patient session", type: "error" });
    } finally {
      setIsStartingPatient(false);
    }
  };

  const completeCurrentPatient = async () => {
    const active = activePatient;
    if (!active || !selectedSlotId) return;

    setIsEndingPatient(true);
    try {
      const res = await endPatientSessionEta(selectedSlotId, active.token);
      if (res.data?.success || res.success) {
        const msg = res.data?.message || "Patient session ended successfully.";
        addToast({ title: "Session Ended", message: msg, type: "success" });

        // Phase 1: Show animation
        setIsAnimationRunning(true);
        // We assume activePatient still points to the same object because polledActivePatient stays unchanged until the next poll.

        // Phase 2: Wait for animation duration
        setTimeout(async () => {
          setIsAnimationRunning(false);
          // Phase 3: Refresh status immediately after animation
          await pollQueueStatus();
          await loadAppointmentsForSelectedSlot();
        }, 2000); // 2 seconds animation
      }
    } catch (e) {
      console.error("End patient ETA failed", e?.response?.data || e.message);
      addToast({ title: "Error", message: "Failed to end patient session", type: "error" });
    } finally {
      setIsEndingPatient(false);
      // setRunStartAt(null); // Let polling clean these up
      // setBaseElapsed(0);
      // setElapsed(0);
      wasRunningOnPauseRef.current = false;
      setCurrentIndex(0);
      pinnedTokenRef.current = null;
    }
  };

  const handleMarkNoShow = async (row) => {
    try {
      let id = row?.id;
      if (!id) {
        const found = queueData.find((p) => p.token === row?.token);
        id = found?.id;
      }
      if (!id) return;

      setIsMarkingNoShowState(true);
      const res = await markNoShowAppointment(id);
      if (res.data?.success || res.success) {
        if (selectedSlotId) {
          await loadAppointmentsForSelectedSlot();
        }
        addToast({
          title: "Marked as No-Show",
          message: "The patient has been marked as No-Show.",
          type: "success",
          duration: 3000,
        });
      }
    } catch (e) {
      console.error("No-show failed", e?.response?.data || e.message);
      addToast({
        title: "Error",
        message:
          e?.response?.data?.message ||
          e.message ||
          "Failed to mark as No-Show",
        type: "error",
      });
    } finally {
      setIsMarkingNoShowState(false);
    }
  };

  // Pause handling
  useEffect(() => {
    if (!queuePaused || !pauseEndsAt) return;
    const tick = () => {
      setPauseRemaining(
        Math.max(0, Math.floor((pauseEndsAt - Date.now()) / 1000))
      );
    };
    tick();
    pauseTickerRef.current = setInterval(tick, 1000);
    return () => {
      if (pauseTickerRef.current) {
        clearInterval(pauseTickerRef.current);
        pauseTickerRef.current = null;
      }
    };
  }, [queuePaused, pauseEndsAt]);
  const resumeQueue = async () => {
    if (!selectedSlotId) return;
    setResumeError("");
    setResumeSubmitting(true);
    try {
      await resumeSlotEta(selectedSlotId);
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
        autoResumeTimerRef.current = null;
      }
      if (pauseTickerRef.current) {
        clearInterval(pauseTickerRef.current);
        pauseTickerRef.current = null;
      }
      setPauseEndsAt(null);
      setPauseRemaining(0);
      if (wasRunningOnPauseRef.current) setRunStartAt(Date.now());
      setQueuePaused(false);
    } catch (e) {
      setResumeError(
        e?.response?.data?.message || e.message || "Failed to resume"
      );
    } finally {
      setResumeSubmitting(false);
    }
  };

  const handlePauseConfirm = async () => {
    if (!pauseMinutes || !selectedSlotId) return;
    setPauseError("");
    setPauseSubmitting(true);
    try {
      const resp = await pauseSlotEta(selectedSlotId, pauseMinutes);
      const serverEnds = resp?.data?.pauseEndsAt || resp?.pauseEndsAt || null;
      const wasRunning = !!runStartAt;
      if (wasRunning) {
        const delta = Math.floor((Date.now() - runStartAt) / 1000);
        setBaseElapsed((b) => b + Math.max(0, delta));
        setRunStartAt(null);
      }
      wasRunningOnPauseRef.current = wasRunning;
      setQueuePaused(true);
      setShowPauseModal(false);
      const ends = serverEnds
        ? new Date(serverEnds).getTime()
        : Date.now() + pauseMinutes * 60 * 1000;
      setPauseEndsAt(ends);
      setPauseRemaining(Math.max(0, Math.floor((ends - Date.now()) / 1000)));
      if (autoResumeTimerRef.current) clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = setTimeout(() => {
        if (wasRunningOnPauseRef.current) setRunStartAt(Date.now());
        setQueuePaused(false);
        if (pauseTickerRef.current) {
          clearInterval(pauseTickerRef.current);
          pauseTickerRef.current = null;
        }
        setPauseEndsAt(null);
        setPauseRemaining(0);
        autoResumeTimerRef.current = null;
      }, pauseMinutes * 60 * 1000);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "";
      // If backend requires ending current patient first, do it automatically then retry pause
      if (
        msg.includes(
          "Cannot pause session while a patient is currently being served"
        )
      ) {
        try {
          if (selectedSlotId && activePatient?.token != null) {
            await endPatientSessionEta(selectedSlotId, activePatient.token);
            await loadAppointmentsForSelectedSlot();
          }
          const resp2 = await pauseSlotEta(selectedSlotId, pauseMinutes);
          const serverEnds =
            resp2?.data?.pauseEndsAt || resp2?.pauseEndsAt || null;
          const wasRunning = !!runStartAt;
          if (wasRunning) {
            const delta = Math.floor((Date.now() - runStartAt) / 1000);
            setBaseElapsed((b) => b + Math.max(0, delta));
            setRunStartAt(null);
          }
          wasRunningOnPauseRef.current = wasRunning;
          setQueuePaused(true);
          setShowPauseModal(false);
          const ends = serverEnds
            ? new Date(serverEnds).getTime()
            : Date.now() + pauseMinutes * 60 * 1000;
          setPauseEndsAt(ends);
          setPauseRemaining(
            Math.max(0, Math.floor((ends - Date.now()) / 1000))
          );
          if (autoResumeTimerRef.current)
            clearTimeout(autoResumeTimerRef.current);
          autoResumeTimerRef.current = setTimeout(() => {
            if (wasRunningOnPauseRef.current) setRunStartAt(Date.now());
            setQueuePaused(false);
            if (pauseTickerRef.current) {
              clearInterval(pauseTickerRef.current);
              pauseTickerRef.current = null;
            }
            setPauseEndsAt(null);
            setPauseRemaining(0);
            autoResumeTimerRef.current = null;
          }, pauseMinutes * 60 * 1000);
        } catch (e2) {
          setPauseError(
            e2?.response?.data?.message || e2.message || "Failed to pause"
          );
        }
      } else {
        setPauseError(msg || "Failed to pause");
      }
    } finally {
      setPauseSubmitting(false);
    }
  };

  const handleTerminateConfirm = async ({ sessions, reason }) => {
    if (!selectedSlotId || sessions.length === 0) return;
    setTerminateSubmitting(true);
    try {
      await terminateQueue({ slotIds: sessions, cancellationReason: reason });

      // For now, just end the session
      if (sessionStarted) {
        // This stops local tracking
        resetLocalQueueState();
      }

      setShowTerminateModal(false);
      addToast({
        title: "Queue Terminated",
        message: "Selected sessions have been terminated successfully.",
        type: "success"
      });
      // Refresh appointments after termination
      if (selectedSlotId) {
        await loadAppointmentsForSelectedSlot();
        await pollQueueStatus();
      }
    } catch (e) {
      console.error("Terminate queue error:", e?.response?.data || e.message);
      addToast({
        title: "Error",
        message: e?.response?.data?.message || "Failed to terminate queue",
        type: "error"
      });
    } finally {
      setTerminateSubmitting(false);
    }
  };

  // Show all tabs as before, but queue remains bound to Checked-In.
  const filters = ["All", "Checked In", "Engaged", "No Show", "Admitted"];
  const getFilterCount = (filter) => {
    const categories = slotAppointments?.appointments || {};
    const checkedIn = Array.isArray(categories.checkedIn)
      ? categories.checkedIn.length
      : 0;
    const engaged = Array.isArray(categories.engaged)
      ? categories.engaged.length
      : 0;

    // Handle new noShow count structure
    let noShowCount = 0;
    if (categories.noShow) {
      if (Array.isArray(categories.noShow)) {
        noShowCount = categories.noShow.length;
      } else if (typeof categories.noShow === 'object') {
        // Look for the new format counts if available in response, but usually counts are in Data.counts
        // Let's use slotAppointments.counts if it exists, otherwise fall back to data lengths
        const totalNoShow = slotAppointments?.counts?.noShow?.total;
        if (totalNoShow !== undefined) {
          noShowCount = totalNoShow;
        } else {
          noShowCount = (categories.noShow.withinGracePeriod?.length || 0) +
            (categories.noShow.outsideGracePeriod?.length || 0);
        }
      }
    }

    const admitted = Array.isArray(categories.admitted)
      ? categories.admitted.length
      : 0;
    const all = checkedIn + engaged + noShowCount + admitted; // exclude inWaiting from All
    switch (filter) {
      case "Checked In":
        return checkedIn;
      case "Engaged":
        return engaged;
      case "No Show":
        return noShowCount;
      case "Admitted":
        return admitted;
      case "All":
        return all;
      default:
        return 0;
    }
  };

  // Slot dropdown UI from slots
  const [activeActionMenuToken, setActiveActionMenuToken] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleActionMenuClick = (e, token) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    // For slot_dropdown, left-align with button. For others, align right edge.
    const menuWidth = token === "slot_dropdown" ? 300 : 220;
    const left = token === "slot_dropdown"
      ? rect.left + window.scrollX
      : rect.left + window.scrollX - menuWidth + rect.width;

    setDropdownPosition({
      top: rect.bottom + window.scrollY + 8,
      left: left,
    });
    setActiveActionMenuToken(activeActionMenuToken === token ? null : token);
  };
  const getIconForTime = (hour) => {
    if (hour < 12) return Morning;
    if (hour < 17) return Afternoon;
    if (hour < 20) return Evening;
    return Night;
  };

  const getLabelForTime = (hour) => {
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 20) return "Evening";
    return "Night";
  };

  const timeSlots = useMemo(() => {
    return (slots || []).map((slot) => {
      const startIso = slot.startTime || slot.slotStartTime || slot.start || slot.timeStart;
      const endIso = slot.endTime || slot.slotEndTime || slot.end || slot.timeEnd;
      const startRaw = new Date(startIso);
      const hour = startRaw.getHours();

      return {
        key: slot.id || slot.slotId || slot._id,
        label: getLabelForTime(hour),
        time: buildISTRangeLabel(startIso, endIso),
        Icon: getIconForTime(hour),
        raw: slot,
      };
    });
  }, [slots]);

  const [slotValue, setSlotValue] = useState("");
  useEffect(() => {
    if (selectedSlotId) {
      setSlotValue(selectedSlotId);
    }
  }, [selectedSlotId]);

  const [showWalkIn, setShowWalkIn] = useState(false);
  useEffect(() => {
    const onClick = () => {
      setActiveActionMenuToken(null);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setActiveActionMenuToken(null);
      }
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <div className="h-screen overflow-hidden bg-gray-50">
        <div className="sticky top-0 z-10 bg-white px-4 py-1 flex items-center">
          <div className="relative mr-6">
            <button
              type="button"
              className="flex w-[300px] items-center bg-white gap-1 text-[16px] text-secondary-grey400 hover:bg-gray-50 transition-all"
              onMouseDown={(e) => handleActionMenuClick(e, "slot_dropdown")}
            >
              <span className="mr-1">
                {timeSlots.find((t) => t.key === slotValue)?.label || (timeSlots.length > 0 ? timeSlots[0].label : "Morning")} ({timeSlots.find((t) => t.key === slotValue)?.time || (timeSlots.length > 0 ? timeSlots[0].time : "10:00am-12:00pm")})
              </span>
              <ChevronDown className="pl-1 h-4 border-l-[0.5px] border-secondary-grey100/50 text-gray-500" />
            </button>
            {activeActionMenuToken === "slot_dropdown" &&
              createPortal(
                <div
                  className="fixed z-[100] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden py-2 px-2"
                  style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: 300,
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ul>
                    {timeSlots.map(({ key, label, time, Icon }, idx) => (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => {
                            setSlotValue(key);
                            selectSlot(key);
                            setActiveActionMenuToken(null);
                          }}
                          className={`flex items-center gap-3 p-2 text-sm text-left w-full transition-colors ${slotValue === key
                            ? "bg-blue-primary250 text-white"
                            : "text-secondary-grey400 hover:bg-gray-50"
                            }`}
                        >
                          <div className="p-[2px]">
                            <Icon
                              className="h-6 w-6"
                              style={{
                                fill: "#BFD6FF", // blue-primary150
                                color: slotValue === key ? "#FFFFFF" : "#9CA3AF", // white vs grey-400
                              }}
                            />
                          </div>


                          <span className="flex-1">
                            <span
                              className={`font-medium mr-1 ${slotValue === key
                                ? "text-white"
                                : "text-gray-900"
                                }`}
                            >
                              {label}
                            </span>
                            <span
                              className={`${slotValue === key
                                ? "text-white"
                                : "text-secondary-grey400"
                                }`}
                            >
                              ({time})
                            </span>
                          </span>
                        </button>
                        {idx < timeSlots.length - 1 && (
                          <div className="h-px bg-gray-100 mx-4" />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>,
                document.body
              )}
          </div>
          <div className="flex-1 flex justify-center">
            <QueueDatePicker date={currentDate} onChange={setCurrentDate} />
          </div>
          <div className="flex ml-auto items-center gap-4">
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const current = new Date(currentDate);
              current.setHours(0, 0, 0, 0);
              return current.getTime() !== today.getTime() ? (
                <>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-2 py-1 font-inter font-normal text-[14px] leading-[120%] text-secondary-grey400 hover:text-blue-primary250 transition-colors group"
                  >
                    <span className="flex items-center gap-1.5 border-b-[1.5px] border-transparent group-hover:border-dashed group-hover:border-blue-primary250">
                      <img
                        src={queueUndo}
                        alt="Back to Today"
                        className="w-3 h-3 group-hover:hidden"
                      />
                      <img
                        src={calenderUndo}
                        alt="Back to Today"
                        className="w-4 h-4 hidden group-hover:block"
                      />
                      <span>Back to Today</span>
                    </span>
                  </button>
                  <div className="w-[0.5px] h-5 bg-secondary-grey150"></div>
                </>
              ) : null;
            })()}
            <div className="flex gap-2 items-center">
              <span
                className="text-secondary-grey300"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "120%",
                  verticalAlign: "middle",
                }}
              >
                {(() => {
                  const activeSlot = timeSlots.find((s) => s.key === slotValue);
                  return activeSlot?.raw?.slotStatus === "COMPLETED"
                    ? "Tokens Booked"
                    : "Tokens available";
                })()}
              </span>
              <span className={`px-2 py-1 rounded font-inter font-normal text-[14px] leading-[120%] text-center border border-transparent transition-colors ${(() => {
                const activeSlot = timeSlots.find((s) => s.key === slotValue);
                return activeSlot?.raw?.slotStatus === "COMPLETED"
                  ? "bg-secondary-grey50 text-secondary-grey200 "
                  : "bg-success-100 text-success-300 hover:border-success-300 hover:border-[0.5px]";
              })()
                }`}>
                {(() => {
                  const activeSlot = timeSlots.find((s) => s.key === slotValue);
                  const availableTokens = activeSlot?.raw?.availableTokens || 0;
                  const maxTokens = activeSlot?.raw?.maxTokens || 0;
                  const bookedTokens = maxTokens - availableTokens;

                  return activeSlot?.raw?.slotStatus === "COMPLETED"
                    ? `${bookedTokens} Out of ${maxTokens}`
                    : `${availableTokens} out of ${maxTokens}`;
                })()}
              </span>
            </div>
            {(() => {
              const activeSlot = timeSlots.find((s) => s.key === slotValue);
              const isCompleted = activeSlot?.raw?.slotStatus === "COMPLETED";
              if (isCompleted) return null;
              return (
                <>
                  <img src={vertical} alt="" className="h-6" />
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={sessionStarted}
                      onChange={(!isStartingSession && !isEndingSession) ? handleToggleSession : undefined}
                      className={(isStartingSession || isEndingSession) ? "opacity-50 cursor-not-allowed" : ""}
                    />
                    <span className={`text-sm font-medium ${sessionStarted ? 'text-gray-700' : 'text-secondary-grey300'}`}>
                      {isStartingSession ? (
                        <div className="flex items-center gap-1">
                          <UniversalLoader size={14} className="text-secondary-grey300" />
                          <span className="text-secondary-grey300">Starting...</span>
                        </div>
                      ) : isEndingSession ? (
                        <div className="flex items-center gap-1">
                          <UniversalLoader size={14} className="text-secondary-grey300" />
                          <span className="text-secondary-grey300">Ending...</span>
                        </div>
                      ) : sessionStarted ? (
                        "Session Started"
                      ) : (
                        "Start Session"
                      )}
                    </span>
                  </div>
                  <img src={vertical} alt="" className="h-6" />
                  <button
                    type="button"
                    className="relative w-4 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                    onMouseDown={(e) => handleActionMenuClick(e, "queue_actions_dropdown")}
                  >
                    <img src={action_dot} alt="Actions" className="w-4" />
                  </button>
                  {activeActionMenuToken === "queue_actions_dropdown" &&
                    createPortal(
                      <div
                        className="fixed z-[9999] bg-white rounded-lg border border-gray-100 shadow-xl overflow-hidden py-1 flex flex-col min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
                        style={{
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            if (selectedSlotId) {
                              loadAppointmentsForSelectedSlot();
                            }
                            setActiveActionMenuToken(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
                        >
                          <RotateCcw className="h-4 w-4" /> Refresh Queue
                        </button>

                        <button
                          onClick={() => {
                            setIsOOOOpen(true);
                            setActiveActionMenuToken(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
                        >
                          <CalendarMinus className="h-4 w-4" /> Set Doctor Out of Office
                        </button>

                        <div className="my-1 border-t border-gray-100"></div>

                        <button
                          onClick={() => {
                            setShowTerminateModal(true);
                            setActiveActionMenuToken(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"
                        >
                          <CalendarX className="h-4 w-4" /> Terminate Queue
                        </button>
                      </div>,
                      document.body
                    )}
                </>
              );
            })()}
          </div>
        </div>

        <div className="px-0 pt-0 pb-2 h-[calc(100vh-100px)] flex flex-col overflow-hidden no-scrollbar">
          {(() => {
            const activeSlot = timeSlots.find((s) => s.key === slotValue);
            const isCompleted = activeSlot?.raw?.slotStatus === "COMPLETED";

            if (isCompleted && !sessionStarted) {
              return (
                <div className="w-full bg-error-50 text-error-400 h-[40px] px-4 flex items-center justify-center relative z-20 gap-2">
                  <img src={terminate} alt="" className="w-4 h-4" />
                  <span className="font-medium text-[14px]">Queue Terminated</span>
                  <Info className="w-4 h-4 ml-1" />
                </div>
              );
            }
            return null;
          })()}

          {sessionStarted && (
            <div className={`w-full ${queuePaused ? 'bg-warning-50 text-warning-400' : 'bg-[#27CA40] text-white'} h-[40px] px-4 flex items-center justify-between relative z-20`}>
              <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 ${queuePaused ? 'text-secondary-grey200' : 'text-white'}`}>
                <span className=' text-[20px] mr-3'>Current Token Number</span>
                <span className={`w-4 h-4 rounded-full animate-colorBlink ${queuePaused ? 'bg-warning-400' : 'bg-white '} transition-all duration-1000`}
                  style={!queuePaused ? {
                    '--blink-on': '#22c55e',
                    '--blink-off': '#ffffff',
                  } : {
                    '--blink-on': '#EC7600',
                    '--blink-off': '#ffffff',
                  }}></span>
                <span className={`font-bold text-[20px] ${queuePaused ? 'text-warning-400' : 'text-white'}`}>{activePatient?.token || '-'}</span>
                {queuePaused && (
                  <div className='flex items-center ml-2 border border-warning-400 py-[2px] rounded px-[6px] bg-white gap-1'>
                    <img src={stopwatch} alt="" className='w-[14px] h-[14px]' />
                    <span className="text-[14px] text-warning-400 ">
                      Paused ({String(Math.floor(pauseRemaining / 60)).padStart(2, "0")}:{String(pauseRemaining % 60).padStart(2, "0")} Mins)
                    </span>
                  </div>
                )}
              </div>
              {/* Right Actions */}
              <div className="ml-auto">
                {!queuePaused ? (
                  <button
                    onClick={() => { setPauseMinutes(null); setShowPauseModal(true); }}
                    className='bg-white text-[#ef4444] h-[24px] py-1 px-[6px] rounded text-[12px] font-medium border border-error-200/50 flex items-center gap-2 hover:bg-error-400 hover:text-white transition-colors '
                  >
                    <img src={pauseIconRed} alt="" className='' /> Pause Queue
                  </button>
                ) : (
                  <button
                    onClick={resumeQueue}
                    disabled={resumeSubmitting}
                    className='bg-blue-primary250 text-white h-[24px] py-1 px-[6px] rounded text-[12px] font-medium flex items-center gap-1.5 hover:bg-blue-primary300 transition-colors disabled:opacity-50'
                  >
                    {resumeSubmitting ? (
                      <UniversalLoader size={12} className="text-white" />
                    ) : (
                      <RotateCcw className='w-[14px] h-[14px] -scale-y-100 rotate-180' />
                    )}
                    {resumeSubmitting ? 'Resuming...' : 'Restart Queue'}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="p-2 flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-2">
              <h3
                className="text-secondary-grey400"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "20px",
                  lineHeight: "120%",
                  verticalAlign: "middle",
                }}
              >
                Overview
              </h3>
              {(() => {
                const categories = slotAppointments?.appointments || {};
                const checkedInCount = Array.isArray(categories.checkedIn)
                  ? categories.checkedIn.length
                  : 0;
                const engagedCount = Array.isArray(categories.engaged)
                  ? categories.engaged.length
                  : 0;
                const admittedCount = Array.isArray(categories.admitted)
                  ? categories.admitted.length
                  : 0;

                let noShowCount = 0;
                if (categories.noShow) {
                  if (Array.isArray(categories.noShow)) {
                    noShowCount = categories.noShow.length;
                  } else if (typeof categories.noShow === 'object') {
                    const totalNoShow = slotAppointments?.counts?.noShow?.total;
                    if (totalNoShow !== undefined) {
                      noShowCount = totalNoShow;
                    } else {
                      noShowCount = (categories.noShow.withinGracePeriod?.length || 0) +
                        (categories.noShow.outsideGracePeriod?.length || 0);
                    }
                  }
                }

                // All should exclude inWaiting in doctor queue
                const allCount =
                  checkedInCount + engagedCount + admittedCount + noShowCount;
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <OverviewStatCard
                      title="All Appointments"
                      value={allCount}
                    />
                    <OverviewStatCard
                      title="Checked In"
                      value={checkedInCount}
                    />
                    <OverviewStatCard title="Engaged" value={engagedCount} />
                    <OverviewStatCard
                      title="No Show/Cancelled"
                      value={noShowCount}
                    />
                  </div>
                );
              })()}
            </div>

            {sessionStarted && activePatient && (
              <>
                <span className="text-[20px] font-medium text-secondary-grey400 mb-2 px-2">Ongoing Consultation</span>
                <div className="px-2 mb-2">
                  <div
                    className={`
                      flex items-center justify-between
                      rounded-xl
                      px-4 py-3
                      bg-white
                      ${activePatient.appointmentStatus === 'COMPLETED'
                        ? 'border border-success-200 bg-[linear-gradient(90deg,rgba(39,202,64,0.08)_0%,rgba(39,202,64,0)_25%,rgba(39,202,64,0)_75%,rgba(39,202,64,0.08)_100%)]'
                        : activePatient.appointmentStatus === 'ADMITTED'
                          ? 'border border-[#D4AF37] bg-[linear-gradient(90deg,rgba(212,175,55,0.15)_0%,rgba(212,175,55,0.05)_25%,rgba(212,175,55,0.05)_75%,rgba(212,175,55,0.15)_100%)]'
                          : 'border border-blue-primary250 bg-[linear-gradient(90deg,rgba(35,114,236,0.08)_0%,rgba(35,114,236,0)_25%,rgba(35,114,236,0)_75%,rgba(35,114,236,0.08)_100%)]'
                      }
                    `}
                  >
                    <div className='flex items-center gap-3'>
                      <AvatarCircle name={activePatient.patientName} size="lg" className="h-12 w-12 text-lg" />
                      <div className="flex gap-6 items-center">
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className="font-semibold text-secondary-grey400 text-[16px]">{activePatient.patientName}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400 -rotate-45" />
                          </div>
                          <div className='text-xs text-secondary-grey300'>{activePatient.gender} | {activePatient.age}</div>
                        </div>
                        <div className="h-10 w-px bg-secondary-grey100/50"></div>
                        <div className="flex flex-col gap-1 text-sm text-secondary-grey200">
                          <div className="flex items-center gap-2">
                            <span className="">Token Number</span>
                            <span className="bg-blue-primary50 text-blue-primary250 h-[22px] px-[6px] py-[2px] rounded-sm border border-blue-primary250/50 text-center flex items-center justify-center ">{activePatient.token}</span>
                          </div>
                          <div className="">Reason for Visit : <span className="text-secondary-grey400">{activePatient.reasonForVisit}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2 items-center'>
                      {(activePatient.startedAt || runStartAt) && !isAnimationRunning && activePatient.appointmentStatus !== 'COMPLETED' && (
                        <div className="flex items-center gap-3">
                          <SessionTimer startTime={activePatient.startedAt || runStartAt} paused={queuePaused} />
                        </div>
                      )}

                      {(activePatient.appointmentStatus === 'COMPLETED' || isAnimationRunning) ? (
                        <div className="flex items-center gap-2 text-success-300 font-medium text-sm mr-6">
                          <img src={verified} alt="" className="w-5 h-5" />
                          <span>Visit Completed</span>
                        </div>
                      ) : activePatient.appointmentStatus === 'ADMITTED' ? (
                        <div className="flex items-center gap-2 text-[#D4AF37] font-medium text-sm mr-6">
                          <img src={verifiedYellow} alt="" className='w-5 h-5' />
                          <span>Patient Admitted</span>
                        </div>
                      ) : (activePatient.startedAt || polledActivePatient) ? (
                        // Ongoing or Started
                        <button
                          onClick={completeCurrentPatient}
                          disabled={isEndingPatient}
                          className="flex items-center gap-2 bg-white border border-secondary-grey200/50 px-4 py-2 rounded-md text-sm font-medium text-secondary-grey400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEndingPatient ? (
                            <UniversalLoader size={12} className="text-secondary-grey200" />
                          ) : (
                            <img src={checkRound} alt="" />
                          )}
                          <span>{isEndingPatient ? 'Ending...' : 'End Session'}</span>
                        </button>
                      ) : (
                        // Not yet started (Idle on card)
                        <button
                          onClick={() => handleStartPatientSession(activePatient.token)}
                          disabled={isStartingPatient}
                          className="flex items-center gap-2 bg-blue-primary250 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-primary300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isStartingPatient ? (
                            <UniversalLoader size={12} className="text-white" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span>{isStartingPatient ? 'Starting...' : 'Start Session'}</span>
                        </button>
                      )}

                      {/* Action Menu if not completed/admitted/animating */}
                      {activePatient.appointmentStatus !== 'COMPLETED' &&
                        activePatient.appointmentStatus !== 'ADMITTED' &&
                        !isAnimationRunning && (
                          <button
                            onClick={(e) => handleActionMenuClick(e, 'active_patient_card')}
                            className="px-2 rounded-full transition-colors hover:bg-gray-100"
                          >
                            <img src={more} alt="" />
                          </button>
                        )}
                      {activeActionMenuToken === 'active_patient_card' && createPortal(
                        <div
                          className="fixed z-[99999] bg-white rounded-lg shadow-xl border border-gray-100 py-1 flex flex-col min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
                          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
                            onClick={() => setActiveActionMenuToken(null)}
                          >
                            <User className="h-4 w-4" /> View Profile
                          </button>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
                            onClick={() => setActiveActionMenuToken(null)}
                          >
                            <Calendar className="h-4 w-4" /> Reschedule
                          </button>
                          <button
                            onClick={() => {
                              // Mark as Admitted logic if needed
                              setActiveActionMenuToken(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
                          >
                            <BedDouble className="h-4 w-4" /> Mark as Admitted
                          </button>
                          <button
                            onClick={() => {
                              completeCurrentPatient();
                              setActiveActionMenuToken(null);
                            }}
                            disabled={isEndingPatient}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full disabled:opacity-50"
                          >
                            {isEndingPatient ? (
                              <UniversalLoader size={12} className="text-secondary-grey200" />
                            ) : (
                              <CheckCheck className="h-4 w-4" />
                            )}
                            <span>End Visit</span>
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between px-1 py-3">
              <div className="flex gap-3">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-[6px] py-1 font-medium text-sm transition-colors ${activeFilter === f
                      ? "bg-blue-primary50 border border-blue-primary150 text-blue-primary250 shadow-sm"
                      : "text-secondary-grey300 hover:text-gray-800"
                      }`}
                    style={{ borderRadius: "4px" }}
                  >
                    {f}{" "}
                    <span
                      className={`ml-1 ${activeFilter === f
                        ? "border-blue-primary150"
                        : "border-gray-200"
                        } border  py-[.15rem] px-[.55rem] bg-white rounded-md text-xs`}
                      style={{ borderRadius: "4px" }}
                    >
                      {getFilterCount(f)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-6">
                {/* <div className='flex items-center space-x-2'>
                <span className='text-gray-600 text-sm'>Tokens</span>
                <Badge size='small' type='ghost' color='green' hover>{queueData.length}</Badge>
              </div> */}
                <img src={downloadIcon} alt="" className="w-4" />
                <img src={vertical} alt="" className="h-6" />
                <button
                  onClick={() => setShowWalkIn(true)}
                  className="inline-flex items-center gap-2 h-[32px] min-w-[32px] p-2 rounded-md border text-sm border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors"
                >
                  <span>Walk-in Appointment</span>
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
                {queueData.length ? (
                  <QueueTable
                    hideCheckIn={true}
                    prescreeningEnabled={false}
                    allowSampleFallback={false}
                    items={queueData}
                    removingToken={null}
                    incomingToken={null}
                    checkedInToken={null}
                    checkedInTokens={new Set()}
                    onCheckIn={() => { }}
                    onRevokeCheckIn={() => { }}
                    onMarkNoShow={handleMarkNoShow}
                    isMarkingNoShowState={isMarkingNoShowState}
                    onStartSession={handleStartPatientSession}
                    isStartingPatient={isStartingPatient}
                    sessionStarted={sessionStarted}
                    activeFilter={activeFilter}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-[15px] font-semibold text-gray-800 mb-1">
                        No patients checked in yet
                      </div>
                      <div className="text-[12px] text-gray-500">
                        Once Front Desk checks in patients they will appear here
                        automatically.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
      <PauseQueueModal
        show={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        pauseMinutes={pauseMinutes}
        setPauseMinutes={setPauseMinutes}
        pauseSubmitting={pauseSubmitting}
        pauseError={pauseError}
        onConfirm={handlePauseConfirm}
      />
      <TerminateQueueModal
        show={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        onConfirm={handleTerminateConfirm}
        isSubmitting={terminateSubmitting}
        sessions={timeSlots.map((slot) => ({
          id: slot.key,
          label: `${slot.label} (${slot.time})`,
        }))}
      />
      <BookAppointmentDrawer
        open={showWalkIn}
        onClose={() => setShowWalkIn(false)}
        doctorId={doctorId}
        clinicId={clinicId}
        hospitalId={hospitalId}
        onBookedRefresh={() => {
          if (selectedSlotId) {
            try {
              loadAppointmentsForSelectedSlot();
            } catch { }
          }
        }}
      />
      <OutOfOfficeDrawer
        isOpen={isOOOOpen}
        onClose={() => setIsOOOOpen(false)}
        onSave={() => {
          // Refresh data if needed
        }}
      />
    </>
  );
};

export default Queue;
