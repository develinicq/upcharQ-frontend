import React, { useState, useEffect } from 'react';
import GeneralDrawer from '../GeneralDrawer/GeneralDrawer';
import InputWithMeta from '../GeneralDrawer/InputWithMeta';
import Dropdown from '../GeneralDrawer/Dropdown';
import { ChevronDown, Sunrise, Moon, Sun, Sunset } from 'lucide-react';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import calendarWhite from "../../../public/Doctor_module/sidebar/calendar_white.png";
import AvatarCircle from '../AvatarCircle';

const ScheduleAppointmentDrawer = ({ open, onClose, patient, onSchedule, zIndex }) => {
    const [apptType, setApptType] = useState("New Consultation");
    const [reason, setReason] = useState("");
    const [doctor, setDoctor] = useState("");
    const [category, setCategory] = useState("No Category Available");
    const [apptDate, setApptDate] = useState(new Date().toISOString().slice(0, 10));
    const [grouped, setGrouped] = useState({ morning: [], afternoon: [], evening: [], night: [] });
    const [timeBuckets, setTimeBuckets] = useState([]);
    const [bucketKey, setBucketKey] = useState("morning");
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState("");


    // Dropdown states
    const [openApptTypeDD, setOpenApptTypeDD] = useState(false);
    const [openDoctorDD, setOpenDoctorDD] = useState(false);
    const [openCategoryDD, setOpenCategoryDD] = useState(false);

    const [openSlotDD, setOpenSlotDD] = useState(false);
    const [showApptDateCalendar, setShowApptDateCalendar] = useState(false);

    const CalendarWhiteIcon = () => (
        <img src={calendarWhite} alt="Calendar" className="w-4 h-4" />
    );

    const suggestions = ["New Consultation", "Follow-up Consultation", "Review Visit"];
    const reasonSuggestions = ["Cough", "Cold", "Headache", "Nausea", "Dizziness", "Muscle Pain", "Sore Throat"];

    const doctorsList = [
        { value: "dr_arvind", name: "Dr. Arvind Mehta", specialty: "General Physician", color: "orange" },
        { value: "dr_sneha", name: "Dr. Sneha Deshmukh", specialty: "Paediatrician", color: "orange" },
        { value: "dr_priya", name: "Dr. Priya Sharma", specialty: "Neurologist", color: "orange" },
        { value: "dr_anil", name: "Dr. Anil Kapoor", specialty: "Orthopaedic Surgeon", color: "orange" },
        { value: "dr_anjali", name: "Dr. Anjali Verma", specialty: "Dermatologist", color: "orange" }
    ];

    const doctorItems = doctorsList.map(d => ({
        value: d.value,
        label: (
            <div className="flex items-center gap-3">
                <AvatarCircle name={d.name} size="s" color={d.color} />
                <div className="flex flex-col text-left">
                    <span className="font-medium text-secondary-grey400 text-sm leading-tight">{d.name}</span>
                    <span className="text-[11px] text-secondary-grey300 leading-tight">{d.specialty}</span>
                </div>
            </div>
        )
    }));



    const toggleOpen = (which) => {
        setOpenApptTypeDD(which === 'appt' ? !openApptTypeDD : false);
        setOpenDoctorDD(which === 'doctor' ? !openDoctorDD : false);
        setOpenCategoryDD(which === 'category' ? !openCategoryDD : false);
        setOpenSlotDD(which === 'slot' ? !openSlotDD : false);
    };

    const handleSave = () => {
        console.log("Scheduling for:", patient?.name, {
            apptType, reason, doctor, category, apptDate, bucketKey, selectedSlotId
        });
        onSchedule?.();
        onClose();
    };

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Schedule Appointment"
            primaryActionLabel="Schedule"
            onPrimaryAction={handleSave}
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
                                {patient ? `${patient.name} (${patient.gender?.charAt(0)} | ${patient.dob} (${patient.age}) | ${patient.contact})` : ""}
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
                        placeholder="Enter Reason for Visit"
                    />
                    <div className="flex gap-2 items-center mt-1">
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

                <div className="bg-secondary-grey150 w-full h-[1px] my-1"></div>

                {/* Doctor & Category */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <InputWithMeta
                            label="Doctor"
                            requiredDot
                            value={doctorsList.find(d => d.value === doctor)?.name || doctor}
                            onChange={() => { }}
                            placeholder="Select Doctor"
                            RightIcon={ChevronDown}
                            onFieldOpen={() => toggleOpen("doctor")}
                            dropdownOpen={openDoctorDD}
                        />
                        <Dropdown
                            open={openDoctorDD}
                            onClose={() => setOpenDoctorDD(false)}
                            items={doctorItems}
                            onSelect={(it) => setDoctor(it.value)}
                            className="w-full"
                            selectedValue={doctor}
                        />
                    </div>

                    <div className="relative">
                        <InputWithMeta
                            label="Category"
                            value={category}
                            onChange={setCategory}
                            placeholder="Select Category"
                            RightIcon={ChevronDown}
                            onFieldOpen={() => toggleOpen("category")}
                            dropdownOpen={openCategoryDD}
                            disabled // Matching "No Category Available" usually disabled or just plain input
                        />
                        {/* Dropdown if needed */}
                    </div>
                </div>

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
                                const t = cur?.time || "loading...";
                                return `${cur.label} - (${t})`;
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
                                    items={timeBuckets.map(({ key, label, time }) => ({
                                        label: `${label} - (${time || "loading..."})`,
                                        value: key,
                                    }))}
                                    onSelect={(it) => {
                                        const key = it.value;
                                        setBucketKey(key);
                                        // mock select first slot
                                        const firstSlot = (grouped[key] || [])[0] || null;
                                        setSelectedSlotId(firstSlot ? firstSlot.id : null);
                                        setOpenSlotDD(false);
                                    }}
                                    className="w-full"
                                    selectedValue={bucketKey}
                                />
                            }
                        />
                        {loadingSlots && <div className="text-xs text-gray-500">Loading slots...</div>}
                    </div>
                </div>

            </div>
        </GeneralDrawer>
    );
};

export default ScheduleAppointmentDrawer;
