
import React, { useState } from 'react';
import { Calendar, Clock, ChevronRight, Play, ArrowRight, ClipboardList, CheckCircle } from 'lucide-react';
import SessionTimer from '../../../components/SessionTimer';
import AvatarCircle from '../../../components/AvatarCircle';
import Button from '../../../components/Button';
import UniversalLoader from '../../../components/UniversalLoader';
const more = '/superAdmin/Doctors/Threedots.svg'
const CalendarMinimalistic = '/fd/Calendar Minimalistic.svg'
const ClockCircle = '/fd/Clock Circle.svg'

// Dummy Data matching the screenshot
const DUMMY_ACTIVE_SESSIONS = [
    {
        id: 1,
        doctor: { name: "Dr. Arvind Mehta", specialty: "General Physician" },
        patient: { name: "Rahul Sharma", gender: "M", dob: "12/05/1985 (39Y)", token: 1 }
    },
    {
        id: 2,
        doctor: { name: "Dr. Sneha Deshmukh", specialty: "Pediatrician" },
        patient: { name: "Kunal Joshi", gender: "M", dob: "12/05/1985 (39Y)", token: 5 }
    }
];

export default function RightQueueSidebar({
    activeTab = 'appt_request', // Prop from parent
    expanded,
    onExpand,
    appointmentRequests,
    activeSessions = [], // You might need to pass active sessions data here or fetch it in future
    onApprove,
    onReject,
    approvingId,
    rejectingId,
    loading,
    error
}) {
    // Internal activeTab state removed, controlled by parent HFDQueue
    const [startedSessions, setStartedSessions] = useState({});

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Tabs Header REMOVED - Rendered by Logic in HFDQueue (Parent) */}

            {/* Content Area */}
            {expanded ? (
                <div className="flex-1 overflow-y-auto pb-20">
                    {activeTab === 'appt_request' && (
                        <div className="flex flex-col relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 z-10 flex flex-col items-center justify-center gap-2">
                                    <UniversalLoader size={32} />
                                    <span className="text-sm text-gray-500 font-medium">Refreshing list...</span>
                                </div>
                            )}

                            {!loading && appointmentRequests.length === 0 && (
                                <div className="p-8 text-center text-gray-500 text-sm">No new appointment requests</div>
                            )}

                            <div className={`flex flex-col transition-opacity duration-200 ${loading && appointmentRequests.length === 0 ? 'opacity-0' : 'opacity-100'}`}>
                                {appointmentRequests.map((request, index) => (
                                    <div key={request.id || index} className="border-b border-gray-100 flex flex-col gap-3 last:border-0 p-3 bg-white transition-colors">
                                        {/* Patient Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <AvatarCircle name={request.name?.replace(/^Dr\.\s*/i, '')} size="l" />
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[16px] font-semibold text-secondary-grey400">{request.name}</span>
                                                        <ArrowRight className="h-3 w-3 text-gray-400 -rotate-45" />
                                                    </div>
                                                    <div className="text-[12px] text-secondary-grey300">{request.gender} | {request.dob}</div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:bg-secondary-grey50">
                                                <img src={more} alt="" />
                                            </button>
                                        </div>

                                        {/* Date & Time */}
                                        <div className="flex flex-col gap-1">
                                            <div className='flex flex-col gap-1 text-sm text-secondary-grey400'>
                                                <div className="flex items-center gap-2">
                                                    <img src={CalendarMinimalistic} alt="" />
                                                    <span>{request.date}</span>
                                                </div>
                                                {request.time && (
                                                    <div className="flex items-center gap-2 ">
                                                        <img src={ClockCircle} alt="" />
                                                        <span>{request.time}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Request For */}
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-secondary-grey200">Request For</div>
                                                <div className="flex items-center gap-2">
                                                    <AvatarCircle
                                                        name={request.doctorName?.replace(/^Dr\.\s*/i, '') || 'Doctor'}
                                                        size="s"
                                                        className="shrink-0 text-orange-500 border border-orange-200 bg-orange-50"
                                                        color="orange"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-secondary-grey400 leading-tight">{request.doctorName}</div>
                                                        <div className="text-xs text-secondary-grey300">{request.doctorSpecialty}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3">
                                            <Button
                                                size="small"
                                                variant="primary"
                                                className={`flex-1 font-medium py-2 h-9 rounded-md transition-all ${approvingId === request.id ? 'bg-blue-primary400' : 'bg-blue-primary250 hover:bg-blue-primary400'}`}
                                                disabled={approvingId === request.id}
                                                onClick={() => onApprove(request)}
                                            >
                                                {approvingId === request.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <UniversalLoader size={16} color="white" style={{ width: 'auto', height: 'auto' }} />
                                                        <span>Accepting...</span>
                                                    </div>
                                                ) : 'Accept'}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="secondary"
                                                className="flex-1 border border-gray-300 text-gray-700 hover:bg-secondary-grey50 font-medium py-2 h-9 rounded-md disabled:opacity-50"
                                                disabled={approvingId === request.id}
                                            >
                                                Ask to Reschedule
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'active_sessions' && (
                        <div className="flex flex-col">
                            {DUMMY_ACTIVE_SESSIONS.map((session) => (
                                <div key={session.id} className="border-b border-gray-100 last:border-0">
                                    {/* Doctor Header */}
                                    <div className="p-2 bg-warning-50 flex items-center gap-2">
                                        <AvatarCircle name={session.doctor.name} size="xs" className=" text-orange-500 border border-orange-200" color="orange" />
                                        <div className='flex flex-col gap-0'>
                                            <span className="text-sm font-bold text-secondary-grey400 leading-tight">{session.doctor.name}</span>
                                            <div className="text-xs text-secondary-grey300">{session.doctor.specialty}</div>
                                        </div>
                                    </div>

                                    {/* Patient Card */}
                                    <div className="p-3 bg-white flex flex-col gap-3 border-b border-secondary-grey100/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-2">
                                                <AvatarCircle name={session.patient.name} size="md" />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[16px] font-semibold text-secondary-grey400">{session.patient.name}</span>
                                                        <ArrowRight className="h-3 w-3 text-gray-400 -rotate-45" />
                                                    </div>
                                                    <div className="text-[12px] text-secondary-grey300 leading-tight">{session.patient.gender} | {session.patient.dob}</div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:bg-secondary-grey50">
                                                <img src={more} alt="" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-secondary-grey200">Token Number</span>
                                                <div className="h-[22px] min-w-[22px] px-[6px] rounded-[4px] flex text-center items-center justify-center text-sm text-blue-primary250 bg-blue-primary50 border border-blue-primary250/50 ">
                                                    {session.patient.token}
                                                </div>
                                            </div>
                                            {!startedSessions[session.id] ? (
                                                <Button
                                                    variant="primary"
                                                    size="small"
                                                    onClick={() => setStartedSessions(prev => ({ ...prev, [session.id]: true }))}
                                                    className=" text-white flex items-center gap-2 px-4 py-2 font-medium"
                                                >
                                                    <Play className="w-3.5 h-3.5 " />
                                                    Start Session
                                                </Button>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <SessionTimer />
                                                    <button
                                                        onClick={() => setStartedSessions(prev => ({ ...prev, [session.id]: false }))}
                                                        className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-[7px] rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-green-500 fill-current text-white bg-green-500 rounded-full" />
                                                        <span>End Session</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // Collapsed State Icons (already handled in HFDQueue but safe to keep minimal fallback)
                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Icons are usually rendered by parent when collapsed */}
                </div>
            )}
        </div>
    );
}

