import React, { useEffect, useRef, useState } from "react";
import { X, Calendar, MoreHorizontal, ChevronDown, CheckCircle2, Phone, Mail, MapPin, Globe, Droplet, User, ArrowRight, ArrowUp, Pencil, Plus, AlertTriangle, Heart, Meh, Syringe, Trash2, Users } from "lucide-react";
import { drawerCross } from "../../../../public/index.js";
import AvatarCircle from "../../../components/AvatarCircle";
import Badge from "../../../components/Badge.jsx";
import ScheduleAppointmentDrawer2 from "../../../components/PatientList/ScheduleAppointmentDrawer2";
import { getPatientDetailsForStaff } from "../../../services/patientService";
import useFrontDeskAuthStore from "../../../store/useFrontDeskAuthStore";
import useClinicStore from "../../../store/settings/useClinicStore";
import UniversalLoader from "../../../components/UniversalLoader";

function Row({ label, value }) {
    return (
        <div className="flex items-center text-sm text-secondary-grey300">
            <div className="w-[251px]">{label}</div>
            <div className="font-medium">{value}</div>
        </div>
    );
}

function SectionCard({ title, children, editButtonGroup }) {
    return (
        <div className="">
            <div className="text-sm font-semibold text-secondary-grey400 flex items-center justify-between">
                <div>{title}</div>
                {editButtonGroup ? <div>{editButtonGroup}</div> : null}
            </div>
            <div className="border-b border-secondary-grey100/50 mt-1" />
            <div className="flex flex-col gap-2 mt-2">{children}</div>
        </div>
    );
}

function AppointmentCard({ title, date, type, reason, status, statusColor = "green", duration, hasPrescription }) {
    return (
        <div className="flex flex-col gap-1 bg-white ">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-secondary-grey400">{title}</h3>
                <div className="flex items-center gap-2">
                    {hasPrescription && (
                        <>
                            <button className="text-blue-primary250 flex items-center gap-1 text-xs hover:underline">
                                View Prescription <ArrowRight size={12} />
                            </button>
                            <div className="h-4 w-px mx-1 bg-secondary-grey100"></div>
                        </>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                        <img
                            src="/icons/Menu Dots.svg"
                            alt="options"
                            width={17}
                            height={17}
                        />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm border-t border-secondary-grey100/50 p-2 text-secondary-grey300 ">
                <div className="flex flex-col gap-1">
                    <div className="">Date:</div>
                    <div className="font-medium">{date}</div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="">Type:</div>
                    <div className="font-medium">{type}</div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="">Reason:</div>
                    <div className="font-medium">{reason}</div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="">Status:</div>
                    <div className={`px-1 py-0.5 rounded w-fit ${statusColor === "green" ? "text-success-300 bg-success-100" : "text-error-400 bg-error-50"
                        }`}>
                        {status} {duration && `(${duration})`}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PatientDetailsDrawer({
    isOpen,
    onClose,
    patient,
}) {
    const panelRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);
    const [activeTab, setActiveTab] = useState("Overview");
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(true);
    const [isLastVisitOpen, setIsLastVisitOpen] = useState(true);
    const actionMenuRef = useRef(null);

    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setIsActionMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const { user: fdUser } = useFrontDeskAuthStore();
    const { clinic: clinicData } = useClinicStore();

    useEffect(() => {
        const patientId = patient?.patientId || patient?.id;
        const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
        const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;

        if (isOpen && patientId && (clinicId || doctorId)) {
            setLoadingDetails(true);
            getPatientDetailsForStaff({ patientId, doctorId, clinicId })
                .then(res => {
                    if (res && res.success && res.data) {
                        setDetails(res.data);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch patient details in FD", err);
                })
                .finally(() => {
                    setLoadingDetails(false);
                });
        } else {
            setDetails(null);
        }
    }, [isOpen, patient, fdUser, clinicData]);


    const requestClose = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            setMounted(false);
            onClose?.();
        }, 220);
    };

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            setClosing(false);
            return;
        }
        if (mounted) {
            setClosing(true);
            const t = setTimeout(() => {
                setClosing(false);
                setMounted(false);
            }, 220);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") requestClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    useEffect(() => {
        if (!mounted) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mounted]);

    if (!mounted && !closing) return null;

    const pInfo = details?.personalInfo || {};
    const name = pInfo.firstName ? `${pInfo.firstName} ${pInfo.lastName || ''}`.trim() : (patient?.name || "-");

    const formatDate = (d) => {
        if (!d) return '-';
        const date = new Date(d);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const dob = pInfo.dob ? formatDate(pInfo.dob) : (patient?.dob || "-");
    const age = (pInfo.age !== undefined && pInfo.age !== null) ? `${pInfo.age}Y` : (patient?.age || "-");
    const gender = pInfo.gender ? (pInfo.gender.charAt(0).toUpperCase() + pInfo.gender.slice(1).toLowerCase()) : (patient?.gender || "-");
    const mrn = pInfo.patientCode || patient?.patientCode || "-";
    const bloodGroup = pInfo.bloodGroup ? pInfo.bloodGroup.replace('_', ' ') : "B+";

    const contact = pInfo.phone || patient?.contact || "-";
    const secondaryPhone = pInfo.secondaryPhone || "-";
    const emailAddr = pInfo.email || patient?.email || "-";

    const addr = pInfo.address || {};
    const street = [addr.blockNo, addr.areaStreet, addr.landmark].filter(Boolean).join(', ');
    const cityState = [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
    const fullAddress = [street, cityState].filter(Boolean).join(', ') || (patient?.location || "-");

    const primaryLang = pInfo.languages?.primary || "-";
    const secondaryLangs = pInfo.languages?.secondary?.join(', ') || "";
    const languages = [primaryLang, secondaryLangs].filter(Boolean).join('/') || "-";

    const dependants = details?.dependents || [];
    const recentAppointments = details?.recentAppointments || [];
    const lastVisitData = recentAppointments.length > 0 ? recentAppointments[0] : null;

    const formatTime = (t) => {
        if (!t) return '';
        return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const lastVisitFull = lastVisitData ? `${formatDate(lastVisitData.date)} at ${formatTime(lastVisitData.time)}` : (patient?.lastVisit || "-");
    const lastVisitReason = lastVisitData?.reason || "-";
    const lastVisitDoctor = lastVisitData?.doctor || "-";
    const lastVisitType = lastVisitData?.type ? lastVisitData.type.replace('_', ' ') : "Consultation";
    const lastVisitStatus = lastVisitData?.status || "Completed";

    const tabs = ["Overview", "Demographics", "Past Visits"];

    return (
        <div className="fixed inset-0 z-[5000] font-sans antialiased text-gray-900">
            <style>{`
        @keyframes drawerIn { from { transform: translateX(100%); opacity: 0.6; } to { transform: translateX(0%); opacity: 1; } }
        @keyframes drawerOut { from { transform: translateX(0%); opacity: 1; } to { transform: translateX(100%); opacity: 0.6; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: .3; } }
        @keyframes fadeOut { from { opacity: .3; } to { opacity: 0; } }
      `}</style>

            <div
                className={`absolute inset-0 bg-black/40 ${closing
                    ? "animate-[fadeOut_.2s_ease-in_forwards]"
                    : "animate-[fadeIn_.25s_ease-out_forwards]"
                    }`}
                onClick={requestClose}
                style={{ zIndex: 5001 }}
            />

            <aside
                className={`absolute top-2 right-2 bottom-2  bg-blue-primary50 shadow-2xl border border-gray-200 rounded-lg overflow-hidden flex flex-col ${closing
                    ? "animate-[drawerOut_.22s_ease-in_forwards]"
                    : "animate-[drawerIn_.25s_ease-out_forwards]"
                    }`}
                ref={panelRef}
                style={{ zIndex: 5002 }}
            >
                {loadingDetails ? (
                    <div className="h-full w-[554px] flex items-center justify-center bg-white/50 z-50">
                        <UniversalLoader size={32} />
                    </div>
                ) : (
                    <>
                        <div className="">
                            <div className="flex bg-white p-3 gap-[10px] items-center border-b border-secondary-grey100">
                                <div className="flex gap-3">
                                    <AvatarCircle name={name} size="l" color="blue" className="w-14 h-14 text-xl" />
                                    <div className="flex flex-col ">
                                        <h2 className="text-[20px] font-semibold text-secondary-grey400">{name}</h2>
                                        <div className="flex items-center gap-1 text-sm text-secondary-grey300 ">
                                            <span>{dob} ({age})</span>
                                            <span className="h-4 mx-1 w-px bg-gray-300"></span>
                                            <span className="flex items-center gap-1 text-sm text-secondary-grey300">
                                                <img src="/superAdmin/patient_list/gender.svg" alt="" className="w-[14px]" /> {gender}
                                            </span>
                                            <span className="h-4 mx-1 w-px bg-gray-300"></span>
                                            <span className="flex items-center gap-1 text-sm text-secondary-grey300">
                                                <img src="/superAdmin/patient_list/blood.svg" alt="" className="w-[14px]" /> {bloodGroup}
                                            </span>
                                            <span className="h-4 mx-1 w-px bg-gray-300"></span>
                                            <span className="bg-secondary-grey50 px-1 py-0.5 rounded text-xs text-secondary-grey400">MRN: {mrn}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="p-2 ml-1 mb-4 hover:bg-gray-100 rounded-lg text-gray-500"
                                    onClick={() => setIsScheduleDrawerOpen(true)}
                                >
                                    <img src='/superAdmin/patient_list/reschedule.svg' alt="" className="w-[18px]" />
                                </button>
                                <span className="h-4 mb-[14px] mx-[2px] w-px bg-gray-300"></span>
                                <div className="relative" ref={actionMenuRef}>
                                    <button
                                        className="p-2 py-3 mb-4 hover:bg-gray-100 rounded-lg text-gray-500"
                                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                                    >
                                        <img src="/action-icon.svg" alt="" className="w-[17px]" />
                                    </button>
                                    {isActionMenuOpen && (
                                        <div className="absolute right-0 top-[calc(100%-10px)] w-[240px] bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-2">
                                            <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                                More Actions
                                            </div>
                                            <div className="flex flex-col">
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <AlertTriangle size={16} strokeWidth={1.5} /> Add Problems
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Heart size={16} strokeWidth={1.5} /> Add Condition
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Meh size={16} strokeWidth={1.5} /> Add Allergies
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Users size={16} strokeWidth={1.5} /> Add Family History
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Globe size={16} strokeWidth={1.5} /> Add Social History
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Syringe size={16} strokeWidth={1.5} /> Add Immunization
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Users size={16} strokeWidth={1.5} /> Add Dependents
                                                </button>
                                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                                    <Pencil size={16} strokeWidth={1.5} /> Edit Profile
                                                </button>
                                            </div>
                                            <div className="my-1 border-t border-gray-100"></div>
                                            <button className="w-full text-left px-4 py-2 text-sm text-error-400 hover:bg-error-50 flex items-center gap-3">
                                                <Trash2 size={16} strokeWidth={1.5} /> Delete Patient
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="flex gap-2 px-3">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`h-[40px] px-[6px]  text-sm border-b-2 transition-colors ${activeTab === tab
                                            ? "text-blue-primary250 border-blue-primary250"
                                            : "text-gray-500 border-transparent hover:text-gray-700"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className=" overflow-y-auto bg-white  no-scrollbar">

                            {activeTab === "Overview" && (
                                <>
                                    <div className="bg-warning2-50 p-[10px] border-t border-b border-warning2-400/50 text-sm text-secondary-grey150">
                                        Add Sticky Notes of Patient's Quick Updates
                                    </div>

                                    <div className="flex flex-col gap-4 pt-3 px-3 pb-3">

                                        <div className="flex flex-col gap-1">
                                            <div
                                                className="flex items-center gap-2 text-sm font-medium text-secondary-grey400 cursor-pointer group select-none"
                                                onClick={() => setIsContactOpen(!isContactOpen)}
                                            >
                                                <span className="flex items-center">Contact Info</span>
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform duration-200 ${isContactOpen ? 'rotate-180' : ''} opacity-0 group-hover:opacity-100`}
                                                />
                                            </div>
                                            {isContactOpen && (
                                                <div className="border-t border-secondary-grey100/50 pt-2 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <img src="/superAdmin/patient_list/contact.svg" alt="" className="w-5 h-5" />
                                                        <span className="text-secondary-grey300">{contact}</span>
                                                        <span className="min-w-[18px] px-1 py-0.5 rounded-sm text-xs border border-warning2-50 text-xs text-warning2-400 bg-warning2-50 hover:border-warning2-400/50 cursor-pointer">Primary</span>
                                                        <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <img src="/superAdmin/patient_list/contact.svg" alt="" className="w-5 h-5" />
                                                        <span className="text-secondary-grey300">{secondaryPhone}</span>
                                                        <span className="min-w-[18px] px-1 py-0.5 rounded-sm border text-xs border-secondary-grey50 bg-secondary-grey50 hover:border-secondary-grey400/50 cursor-pointer text-secondary-grey400">Secondary</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <img src="/superAdmin/patient_list/email.svg" alt="" className="w-5 h-5" />
                                                        <span className="text-secondary-grey300">{emailAddr}</span>
                                                        <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <img src="/superAdmin/patient_list/location.svg" alt="" className="w-5 h-5" />
                                                        <span className="text-secondary-grey300">{fullAddress}</span>
                                                        <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <img src="/superAdmin/patient_list/website.svg" alt="" className="w-5 h-5" />
                                                        <span className="text-secondary-grey300">{languages}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 pb-1">
                                            <div
                                                className="flex items-center gap-2 text-sm font-medium text-secondary-grey400 cursor-pointer group select-none"
                                                onClick={() => setIsLastVisitOpen(!isLastVisitOpen)}
                                            >
                                                <h3 className="flex items-center">Last Visit</h3>
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform duration-200 ${isLastVisitOpen ? 'rotate-180' : ''} opacity-0 group-hover:opacity-100`}
                                                />
                                            </div>
                                            {isLastVisitOpen && (
                                                <div className="border-t border-secondary-grey100/50 pt-2 flex flex-col gap-2 text-sm text-secondary-grey300">
                                                    <div className="flex items-center justify-between">
                                                        <div className="">Date:</div>
                                                        <div className="col-span-2 font-medium">
                                                            {lastVisitFull}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-secondary-grey300">Doctor:</div>
                                                        <div className="flex items-center gap-2">
                                                            <AvatarCircle size='xs' color='orange' name={lastVisitDoctor.charAt(0)} />
                                                            <div className="col-span-2 font-medium">
                                                                {lastVisitDoctor}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-secondary-grey300">Type:</div>
                                                        <div className="col-span-2 font-medium">
                                                            {lastVisitType}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-secondary-grey300">Reason:</div>
                                                        <div className="col-span-2 font-medium">
                                                            {lastVisitReason}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-secondary-grey300">Status:</div>
                                                        <div className="col-span-2 text-success-300 bg-success-100 px-1 rounded-sm">
                                                            {lastVisitStatus}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3 text-xs text-blue-primary250">
                                                        <button className="">View Prescription →</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </>
                            )}

                            {activeTab === "Demographics" && (
                                <div className="flex flex-col gap-4 pt-3  px-3 pb-3">
                                    <SectionCard
                                        title="Basic Info"
                                        editButtonGroup={
                                            <button
                                                className="font-inter text-xs font-normal leading-[1.2] tracking-normal align-middle text-[#2372EC] flex items-center gap-1"
                                            >
                                                <img
                                                    src="/icons/Pen.svg"
                                                    alt="edit icon"
                                                    width={14}
                                                    height={14}
                                                />
                                                <div>Edit</div>
                                            </button>
                                        }
                                    >
                                        <Row label="Name:" value={name} />
                                        <Row label="Date Of Birth:" value={dob} />
                                        <Row label="Age:" value={age} />
                                        <Row label="Gender:" value={gender} />
                                        <Row label="Blood Group:" value={bloodGroup} />
                                        <Row label="Marital Status:" value={pInfo.maritalStatus || "-"} />
                                    </SectionCard>

                                    <SectionCard title="Contact Details">
                                        <Row label="Primary Phone:" value={contact} />
                                        <Row label="Secondary Phone:" value={secondaryPhone} />
                                        <Row label="Email Address:" value={emailAddr} />
                                        <Row label="Emergency Contact:" value={pInfo.emergencyContact || "-"} />
                                        <Row label="Primary Language:" value={primaryLang} />
                                        <Row label="Secondary Language:" value={secondaryLangs || "-"} />
                                    </SectionCard>

                                    <SectionCard title="Address Details">
                                        <div
                                            className=" text-blue-primary300  text-sm leading-[22px] tracking-[0px]"
                                        >
                                            Permanent Address
                                        </div>
                                        <Row label="Address:" value={street || "-"} />
                                        <Row label="City:" value={addr.city || "-"} />
                                        <Row label="State:" value={addr.state || "-"} />
                                        <Row label="Zip Code:" value={addr.pincode || "-"} />
                                    </SectionCard>

                                    <SectionCard
                                        title="Dependant"
                                        editButtonGroup={
                                            <div className="flex items-center justify-end">
                                                <button
                                                    className=" text-[#2372EC] font-inter text-xs font-normal leading-[1.2] tracking-normal align-middle"
                                                >
                                                    + Add New
                                                </button>
                                            </div>
                                        }
                                    >
                                        {dependants.length > 0 ? dependants.map((dep, idx) => (
                                            <div key={idx} className="flex items-center gap-3 py-1 text-sm text-secondary-grey400">
                                                <AvatarCircle
                                                    size='s'
                                                    name={dep.name?.charAt(0) || 'D'}>

                                                </AvatarCircle>
                                                <div className="flex flex-col ">
                                                    <div className="flex items-center gap-1">
                                                        {dep.name}{" "}
                                                        <span className="text-xs bg-secondary-grey50 px-1 py-0.5 rounded-sm">{dep.relation}</span>
                                                    </div>
                                                    <div className="text-xs text-secondary-grey300">
                                                        {dep.relation} | {dep.phone || "-"}
                                                    </div>
                                                </div>
                                                <div className="ml-auto">
                                                    <button className="p-1.5 rounded hover:bg-gray-100">
                                                        <img
                                                            src="/icons/Menu Dots.svg"
                                                            alt="options"
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-sm text-gray-400 italic">No dependents found</div>
                                        )}
                                    </SectionCard>
                                </div>
                            )}

                            {activeTab === "Past Visits" && (

                                <div className="">
                                    <div className="bg-warning2-50 p-[10px] border-t border-b border-warning2-400/50 text-sm text-secondary-grey150">
                                        Add Sticky Notes of Patient's Quick Updates
                                    </div>

                                    <div className="flex flex-col gap-4 p-3">
                                        {recentAppointments.length > 0 ? recentAppointments.map((appt, idx) => (
                                            <AppointmentCard
                                                key={idx}
                                                title={`Appointment ${idx + 1}`}
                                                date={`${formatDate(appt.date)} at ${formatTime(appt.time)}`}
                                                type={appt.type ? appt.type.replace('_', ' ') : "-"}
                                                reason={appt.reason || "-"}
                                                status={appt.status || "Completed"}
                                                statusColor={appt.status === "ENGAGED" ? "green" : "gray"}
                                                hasPrescription={false}
                                            />
                                        )) : (
                                            <div className="text-sm text-gray-400 p-2 text-center">No past visits found</div>
                                        )}
                                    </div>

                                </div>
                            )}

                        </div>
                    </>
                )}
            </aside>
            {isScheduleDrawerOpen && (
                <ScheduleAppointmentDrawer2
                    open={isScheduleDrawerOpen}
                    onClose={() => setIsScheduleDrawerOpen(false)}
                    patient={patient || { name, dob, age, gender, contact }}
                    doctorId={fdUser?.doctorId || fdUser?.doctor?.id}
                    clinicId={fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId}
                    onSchedule={() => {
                        // Refresh details after scheduling
                        const patientId = patient?.patientId || patient?.id;
                        const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
                        const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;
                        if (patientId && (clinicId || doctorId)) {
                            getPatientDetailsForStaff({ patientId, doctorId, clinicId })
                                .then(res => {
                                    if (res && res.success && res.data) {
                                        setDetails(res.data);
                                    }
                                });
                        }
                    }}
                    zIndex={6000}
                />
            )}
        </div>
    );
}
