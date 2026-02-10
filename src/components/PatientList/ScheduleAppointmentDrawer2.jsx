import React, { useState, useEffect } from 'react';
import GeneralDrawer from '../GeneralDrawer/GeneralDrawer';
import InputWithMeta from '../GeneralDrawer/InputWithMeta';
import Dropdown from '../GeneralDrawer/Dropdown';
import { ChevronDown, Sunrise, Moon, Sun, Sunset } from 'lucide-react';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import calendarWhite from "../../../public/Doctor_module/sidebar/calendar_white.png";
import AvatarCircle from '../AvatarCircle';

import { findPatientSlots, bookWalkInAppointment } from '../../services/authService';
import { classifyISTDayPart, buildISTRangeLabel, calculateAge } from '../../lib/timeUtils';
import useToastStore from '@/store/useToastStore';
import UniversalLoader from '../../components/UniversalLoader';

const ScheduleAppointmentDrawer2 = ({ open, onClose, patient, onSchedule, zIndex, doctorId, clinicId, hospitalId }) => {
    const { addToast } = useToastStore();
    const [apptType, setApptType] = useState("New Consultation");
    const [reason, setReason] = useState("");
    const [apptDate, setApptDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [grouped, setGrouped] = useState({ morning: [], afternoon: [], evening: [], night: [] });
    const [timeBuckets, setTimeBuckets] = useState([]);
    const [bucketKey, setBucketKey] = useState("morning");
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    // Load slots
    useEffect(() => {
        let ignore = false;
        const load = async () => {
            if (!open) return;
            if (!open) return;
            // if (!doctorId || (!clinicId && !hospitalId)) return;
            console.log("ScheduleAppointmentDrawer2: Loading slots...", { doctorId, clinicId, hospitalId, open });

            setLoadingSlots(true);
            setSlotsError("");
            setGrouped({ morning: [], afternoon: [], evening: [], night: [] });
            setTimeBuckets([]);
            setSelectedSlotId(null);

            try {
                // const resp = await findPatientSlots({
                //     doctorId,
                //     date: apptDate,
                //     clinicId,
                //     hospitalId,
                // });
                // let arr = Array.isArray(resp) ? resp : (resp?.data || resp?.slots || []);

                // FORCE MOCK DATA FOR UI VERIFICATION
                console.log("FORCING MOCK SLOTS");
                const baseDate = apptDate || new Date().toISOString().split('T')[0];
                const arr = [
                    { id: 'm1', startTime: `${baseDate}T10:00:00Z`, endTime: `${baseDate}T10:30:00Z`, availableTokens: 25 },
                    { id: 'm2', startTime: `${baseDate}T11:00:00Z`, endTime: `${baseDate}T11:30:00Z`, availableTokens: 15 },
                    { id: 'a1', startTime: `${baseDate}T14:00:00Z`, endTime: `${baseDate}T14:30:00Z`, availableTokens: 10 },
                    { id: 'a2', startTime: `${baseDate}T15:00:00Z`, endTime: `${baseDate}T15:30:00Z`, availableTokens: 5 },
                    { id: 'e1', startTime: `${baseDate}T18:00:00Z`, endTime: `${baseDate}T18:30:00Z`, availableTokens: 20 },
                    { id: 'e2', startTime: `${baseDate}T19:00:00Z`, endTime: `${baseDate}T19:30:00Z`, availableTokens: 25 },
                    { id: 'n1', startTime: `${baseDate}T20:30:00Z`, endTime: `${baseDate}T21:00:00Z`, availableTokens: 8 },
                    { id: 'n2', startTime: `${baseDate}T21:30:00Z`, endTime: `${baseDate}T22:00:00Z`, availableTokens: 12 },
                ];

                if (ignore) return;

                const grp = arr.reduce((acc, s) => {
                    const part = classifyISTDayPart(s.startTime);
                    if (!acc[part]) acc[part] = [];
                    acc[part].push(s);
                    return acc;
                }, { morning: [], afternoon: [], evening: [], night: [] });

                setGrouped(grp);

                const tb = [];
                if (grp.morning.length) {
                    const f = grp.morning[0], l = grp.morning[grp.morning.length - 1];
                    tb.push({ key: "morning", label: "Morning", time: buildISTRangeLabel(f.startTime, l.endTime), Icon: Sunrise });
                }
                if (grp.afternoon.length) {
                    const f = grp.afternoon[0], l = grp.afternoon[grp.afternoon.length - 1];
                    tb.push({ key: "afternoon", label: "Afternoon", time: buildISTRangeLabel(f.startTime, l.endTime), Icon: Sun });
                }
                if (grp.evening.length) {
                    const f = grp.evening[0], l = grp.evening[grp.evening.length - 1];
                    tb.push({ key: "evening", label: "Evening", time: buildISTRangeLabel(f.startTime, l.endTime), Icon: Sunset });
                }
                if (grp.night.length) {
                    const f = grp.night[0], l = grp.night[grp.night.length - 1];
                    tb.push({ key: "night", label: "Night", time: buildISTRangeLabel(f.startTime, l.endTime), Icon: Moon });
                }

                setTimeBuckets(tb);
                const firstNonEmpty = tb[0]?.key || "morning";
                setBucketKey(firstNonEmpty);
                const firstSlot = (grp[firstNonEmpty] || [])[0] || null;
                setSelectedSlotId(firstSlot ? (firstSlot.id || firstSlot.slotId || firstSlot._id) : null);

            } catch (e) {
                if (!ignore) setSlotsError(e?.response?.data?.message || e.message || "Failed to load slots");
            } finally {
                if (!ignore) setLoadingSlots(false);
            }
        };
        load();
        return () => { ignore = true; };
    }, [open, apptDate, doctorId, clinicId, hospitalId]);

    // Dropdown states
    const [openApptTypeDD, setOpenApptTypeDD] = useState(false);
    const [openSlotDD, setOpenSlotDD] = useState(false);
    const [showApptDateCalendar, setShowApptDateCalendar] = useState(false);

    const CalendarWhiteIcon = () => (
        <img src={calendarWhite} alt="Calendar" className="w-4 h-4" />
    );

    const suggestions = ["New Consultation", "Follow-up Consultation", "Review Visit"];
    const reasonSuggestions = ["Cough", "Cold", "Headache", "Nausea", "Dizziness", "Muscle Pain", "Sore Throat"];

    const toggleOpen = (which) => {
        setOpenApptTypeDD(which === 'appt' ? !openApptTypeDD : false);
        setOpenSlotDD(which === 'slot' ? !openSlotDD : false);
    };

    const handleSave = async () => {
        if (!selectedSlotId || booking || reason.trim().length < 10 || !apptType) return;

        setBooking(true);
        try {
            const payload = {
                method: "EXISTING",
                patientId: patient?.patientId || patient?.id,
                reason: reason.trim(),
                slotId: selectedSlotId,
                bookingType: apptType?.toUpperCase().includes("FOLLOW")
                    ? "FOLLOW_UP"
                    : apptType?.toUpperCase().includes("REVIEW")
                        ? "FOLLOW_UP"
                        : "NEW"
            };

            await bookWalkInAppointment(payload);

            addToast({
                title: "Appointment Scheduled",
                message: "Appointment successfully scheduled.",
                type: "success",
                duration: 3000
            });

            onSchedule?.();
            onClose();
        } catch (e) {
            const msg = e?.message || "Scheduling failed";
            addToast({
                title: "Scheduling Failed",
                message: msg,
                type: "error",
                duration: 4000
            });
        } finally {
            setBooking(false);
        }
    };

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Schedule Appointment"
            primaryActionLabel={booking ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} color="white" />
                    <span>Scheduling...</span>
                </div>
            ) : "Schedule"}
            onPrimaryAction={handleSave}
            primaryActionDisabled={loadingSlots || !selectedSlotId || booking || reason.trim().length < 10 || !apptType}
            width={600}
            zIndex={zIndex}
        >
            <div className="flex flex-col gap-4 ">
                {/* Patient Info Read-only */}
                <div>
                    <InputWithMeta
                        label="Patient"
                        requiredDot
                        showInput={false}
                    >
                        <div className={`w-full rounded-md border-[0.5px] border-secondary-grey150 h-9 text-sm text-secondary-grey400 bg-secondary-grey50 flex items-center px-2 select-none gap-2`}>
                            {patient && <AvatarCircle name={patient.name} size="xs" color="blue" />}
                            <span className="truncate">
                                {patient ? `${patient.name} (${patient.gender?.charAt(0)} | ${patient.dob} (${calculateAge(patient.dob)}Y) | ${patient.contact})` : ""}
                            </span>
                        </div>
                    </InputWithMeta>
                </div>

                {/* Appt Type */}
                <div className="relative">
                    <InputWithMeta
                        label="Appointment Type"
                        requiredDot
                        value={apptType}
                        onChange={setApptType}
                        placeholder="Select Appointment Type"
                        RightIcon={ChevronDown}
                        onFieldOpen={() => toggleOpen("appt")}
                        dropdownOpen={openApptTypeDD}
                    />
                    <Dropdown
                        open={openApptTypeDD}
                        onClose={() => setOpenApptTypeDD(false)}
                        items={["New Consultation", "Follow-up Consultation", "Review Visit"].map(t => ({ label: t, value: t }))}
                        onSelect={(it) => setApptType(it.value)}
                        className="w-full"
                        selectedValue={apptType}
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

                {/* Reason */}
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

                <div className="bg-secondary-grey150 w-full h-[1px] my-1"></div>

                {/* Date & Slot */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <InputWithMeta
                            label="Appointment Date"
                            requiredDot
                            value={apptDate}
                            placeholder="Select Date"
                            RightIcon={CalendarWhiteIcon}
                            onIconClick={() => setShowApptDateCalendar(!showApptDateCalendar)}
                            dropdownOpen={showApptDateCalendar}
                            onRequestClose={() => setShowApptDateCalendar(false)}
                        />
                        {showApptDateCalendar && (
                            <div className="shadcn-calendar-dropdown absolute z-[10000] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 left-0 top-full">
                                <ShadcnCalendar
                                    mode="single"
                                    selected={apptDate ? new Date(apptDate) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                            const day = String(date.getDate()).padStart(2, "0");
                                            setApptDate(`${year}-${month}-${day}`);
                                        }
                                        setShowApptDateCalendar(false);
                                    }}
                                    className="rounded-lg p-1"
                                    fromYear={new Date().getFullYear() - 1}
                                    toYear={new Date().getFullYear() + 1}
                                    classNames={{
                                        day_selected:
                                            "bg-blue-primary250 text-white hover:bg-blue-primary250",
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <InputWithMeta
                            label="Available Slot"
                            requiredDot
                            value={(() => {
                                if (loadingSlots) return "Loading...";
                                if (!timeBuckets.length) return "No slots available";
                                const cur = timeBuckets.find((tb) => tb.key === bucketKey) || timeBuckets[0];
                                if (!cur) return "Select Slot";
                                const t = cur?.time || "loading...";
                                return `${cur.label} - (${t})`;
                            })()}
                            rightMeta={(() => {
                                const curSlots = grouped[bucketKey] || [];
                                const curSlot = curSlots[0];
                                if (!curSlot) return null;
                                const avail = curSlot.availableTokens !== undefined ? curSlot.availableTokens : (curSlot.maxTokens || 0);
                                return `${avail} Tokens Available`;
                            })()}
                            onChange={() => { }}
                            placeholder="Select"
                            RightIcon={ChevronDown}
                            onFieldOpen={() => toggleOpen("slot")}
                            dropdownOpen={openSlotDD}
                            onRequestClose={() => setOpenSlotDD(false)}
                            dropdown={
                                <Dropdown
                                    open={openSlotDD}
                                    onClose={() => setOpenSlotDD(false)}
                                    useAnchorWidth={false}
                                    items={timeBuckets.map(({ key, label, time, Icon }) => {
                                        const bucketSlots = grouped[key] || [];
                                        const firstSlot = bucketSlots[0];
                                        const avail = firstSlot ? (firstSlot.availableTokens !== undefined ? firstSlot.availableTokens : (firstSlot.maxTokens || 0)) : 0;

                                        return {
                                            label: (
                                                <div className="flex items-center gap-3 w-full py-1">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0 border border-blue-100">
                                                        {Icon && <Icon size={20} strokeWidth={1.5} />}
                                                    </div>
                                                    <div className="flex flex-col items-start gap-0.5 w-full min-w-0">
                                                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                                                            {label}
                                                            <span className="font-normal text-gray-500 text-xs">({time || "loading..."})</span>
                                                        </div>
                                                        <div className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded text-center font-medium border border-green-200 inline-block mt-0.5">
                                                            {avail} Tokens Available
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                            value: key,
                                        };
                                    })}
                                    itemClassName="!py-1.5 !px-2 hover:!bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    className="w-[350px]"
                                    onSelect={(it) => {
                                        const key = it.value;
                                        setBucketKey(key);
                                        const firstSlot = (grouped[key] || [])[0] || null;
                                        setSelectedSlotId(firstSlot ? (firstSlot.id || firstSlot.slotId || firstSlot._id) : null);
                                        setOpenSlotDD(false);
                                    }}
                                    selectedValue={bucketKey}
                                />
                            }
                        />
                        {loadingSlots && <div className="text-xs text-gray-500">Loading slots...</div>}
                        {slotsError && <div className="text-xs text-red-600 mt-1">{slotsError}</div>}
                    </div>
                </div>

            </div>
        </GeneralDrawer>
    );
};

export default ScheduleAppointmentDrawer2;
