import React, { useEffect, useRef, useState } from "react";
import { X, Calendar, MoreHorizontal, ChevronDown, CheckCircle2, Phone, Mail, MapPin, Globe, Droplet, User, ArrowRight, ArrowUp, Pencil, Plus, AlertTriangle, Heart, Meh, Syringe, Trash2, Users } from "lucide-react";
import AvatarCircle from "../../../components/AvatarCircle";
import Badge from "../../../components/Badge.jsx";
import ScheduleAppointmentDrawer2 from "../../../components/PatientList/ScheduleAppointmentDrawer2";
import { getPatientDetailsForHospitalStaff } from "../../../services/patientService";
import useHospitalFrontDeskAuthStore from "../../../store/useHospitalFrontDeskAuthStore";
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
    const actionMenuRef = useRef(null);

    const { user } = useHospitalFrontDeskAuthStore();
    const hospitalId = user?.hospitalId || user?.hospital?.id;
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

    useEffect(() => {
        const idToFetch = patient?.patientId || patient?.id;
        if (isOpen && idToFetch && hospitalId) {
            setLoadingDetails(true);
            getPatientDetailsForHospitalStaff(hospitalId, idToFetch)
                .then(res => {
                    if (res && res.success && res.data) {
                        setDetails(res.data);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch patient details", err);
                })
                .finally(() => {
                    setLoadingDetails(false);
                });
        } else {
            setDetails(null);
        }
    }, [isOpen, patient, hospitalId]);

    if (!mounted && !closing) return null;

    const basicInfo = details?.basicInfo || {};
    const contactInfo = details?.contactInfo || {};
    const addressDetails = details?.addressDetails?.permanentAddress || {};

    const name = basicInfo.name || patient?.name || "-";

    const formatDate = (d) => {
        if (!d) return '-';
        const date = new Date(d);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const dob = basicInfo.dob ? formatDate(basicInfo.dob) : (patient?.dob || "-");
    const age = basicInfo.age ? `${basicInfo.age} Years` : (patient?.age || "-");
    const gender = basicInfo.gender ? (basicInfo.gender.charAt(0).toUpperCase() + basicInfo.gender.slice(1).toLowerCase()) : (patient?.gender || "-");
    const bloodGroup = basicInfo.bloodGroup ? basicInfo.bloodGroup.replace('_', ' ') : (patient?.bloodGroup || "-");
    const patientCode = basicInfo.patientCode || patient?.patientCode || "-";

    const contact = contactInfo.primaryPhone || patient?.contact || "-";
    const secondaryPhone = contactInfo.secondaryPhone || "-";
    const emailAddr = contactInfo.email || patient?.email || "-";
    const fullAddress = [addressDetails.address, addressDetails.city, addressDetails.state, addressDetails.zipCode].filter(Boolean).join(', ') || (patient?.location || "-");

    const recentAppointments = details?.recentAppointments || [];
    const dependents = details?.dependents || [];

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
                className={`absolute top-2 right-2 bottom-2 bg-blue-primary50 shadow-2xl border border-gray-200 rounded-lg overflow-hidden flex flex-col ${closing
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
                                            <span className="flex items-center gap-1 text-sm text-secondary-grey300"><User size={14} className="text-blue-500" /> {gender}</span>
                                            <span className="h-4 mx-1 w-px bg-gray-300"></span>
                                            <span className="flex items-center gap-1 text-sm text-secondary-grey300"><Droplet size={14} className="text-blue-500 fill-blue-500" /> {bloodGroup}</span>
                                            <span className="h-4 mx-1 w-px bg-gray-300"></span>
                                            {patientCode && <span className="bg-secondary-grey50 px-1 py-0.5 rounded text-xs text-secondary-grey400">MRN: {patientCode}</span>}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="p-2 ml-1 mb-4 hover:bg-gray-100 rounded-lg text-gray-500"
                                    onClick={() => setIsScheduleDrawerOpen(true)}
                                >
                                    <img src='/reschedule.png' alt="" className="w-[18px]" />
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
                                            <div className="flex items-center text-sm font-medium text-secondary-grey400">
                                                <span className="flex items-center ">Contact Info</span>
                                            </div>
                                            <div className="border-t border-secondary-grey100/50 pt-2 flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone size={16} className="text-gray-400" />
                                                    <span className="text-secondary-grey300">{contact}</span>
                                                    <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail size={16} className="text-gray-400" />
                                                    <span className="text-secondary-grey300">{emailAddr}</span>
                                                    <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin size={16} className="text-gray-400" />
                                                    <span className="text-secondary-grey300">{fullAddress}</span>
                                                    <CheckCircle2 size={14} className="ml-auto text-green-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 pb-1">
                                            <h3 className="flex items-center text-sm font-medium text-secondary-grey400">Last Visit</h3>
                                            <div className="border-t border-secondary-grey100/50 pt-2 flex flex-col gap-2 text-sm text-secondary-grey300">
                                                {recentAppointments.length > 0 ? (
                                                    <>
                                                        <div className="flex items-center justify-between">
                                                            <div className="">Date:</div>
                                                            <div className="col-span-2 font-medium">
                                                                {formatDate(recentAppointments[0].date)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-secondary-grey300">Type:</div>
                                                            <div className="col-span-2 font-medium">
                                                                {recentAppointments[0].type || "Consultation"}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-secondary-grey300">Status:</div>
                                                            <div className="col-span-2 text-success-300 bg-success-100 px-1 rounded-sm">
                                                                {recentAppointments[0].status || "Completed"}
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-xs text-gray-400">No recent visit</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === "Demographics" && (
                                <div className="flex flex-col gap-4 pt-3 px-3 pb-3">
                                    <SectionCard title="Basic Info">
                                        <Row label="Name:" value={name} />
                                        <Row label="Date Of Birth:" value={dob} />
                                        <Row label="Age:" value={age} />
                                        <Row label="Gender:" value={gender} />
                                        <Row label="Blood Group:" value={bloodGroup} />
                                    </SectionCard>

                                    <SectionCard title="Contact Details">
                                        <Row label="Primary Phone:" value={contact} />
                                        <Row label="Secondary Phone:" value={secondaryPhone} />
                                        <Row label="Email Address:" value={emailAddr} />
                                    </SectionCard>

                                    <SectionCard title="Address Details">
                                        <Row label="Address:" value={fullAddress} />
                                    </SectionCard>
                                </div>
                            )}

                            {activeTab === "Past Visits" && (
                                <div className="flex flex-col gap-4 p-3">
                                    {recentAppointments.length > 0 ? recentAppointments.map((appt, idx) => (
                                        <AppointmentCard
                                            key={idx}
                                            title={`Appointment ${idx + 1}`}
                                            date={`${formatDate(appt.date)}`}
                                            type={appt.type || "-"}
                                            reason={appt.reason || "-"}
                                            status={appt.status || "Completed"}
                                            statusColor={appt.status === "No-Show" ? "red" : "green"}
                                            hasPrescription={false}
                                        />
                                    )) : (
                                        <div className="text-sm text-gray-400 p-2 text-center">No past visits found</div>
                                    )}
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
                    zIndex={6000}
                />
            )}
        </div>
    );
}
