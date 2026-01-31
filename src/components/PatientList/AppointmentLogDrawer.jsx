import React, { useState } from 'react';
import GeneralDrawer from '../GeneralDrawer/GeneralDrawer';
import Badge from '../Badge'; // Assuming a badge component exists, or use generic divs
import { ChevronDown, ChevronUp, Clock, CheckCircle2, User, XCircle, MessageSquare } from 'lucide-react';

// Sample Data matching the screenshot
const sampleLogs = [
    {
        month: 'Oct 2025',
        logs: [
            {
                id: 1,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Online',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Completed',
                duration: '5:30 min',
                feeStatus: 'Service Fee Paid',
                details: [
                    { time: '10:30am', title: 'Appointment Requested', desc: 'Dr. Milind Chachun | Morning Slot (10:30PM - 12:30PM) | 12/10/2025 | 10:30am | Online | Service Fee Paid' },
                    { time: '10:30am', title: 'Appointment Confirmed & Token Generated', desc: '12/10/2025 | 10:30am | Staff: Alok Verma | Token No: 17 (Morning Slot)' },
                    { time: '10:30am', title: 'Patient Checked In', desc: '12/10/2025 | 10:30am | Staff: Alok Verma' },
                    { time: '10:30am', title: 'Appointment Started', desc: '12/10/2025 | 10:30am | Dr. Milind Chachun' },
                    { time: '10:30am', title: 'Appointment Completed', desc: '12/10/2025 | 10:30am | Dr. Milind Chachun' },
                    { time: '10:30am', title: 'Feedback Submitted', desc: '12/10/2025 | 10:30am | ⭐ 4' },
                ]
            },
            {
                id: 2,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Walkin',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Completed',
                duration: '5:30 min',
                feeStatus: 'Service Fee Paid',
                details: []
            },
            {
                id: 3,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Online',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Cancelled',
                feeStatus: 'Service Fee Paid',
                details: []
            },
            {
                id: 4,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Online',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Requested',
                feeStatus: 'Service Fee Paid',
                details: []
            }
        ]
    },
    {
        month: 'Sept 2025',
        logs: [
            {
                id: 5,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Walkin',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Completed',
                duration: '5:30 min',
                details: []
            },
            {
                id: 6,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Online',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Cancelled',
                feeStatus: 'Service Fee Paid',
                details: []
            },
            {
                id: 7,
                date: '12/10/2025',
                time: '12:20pm',
                type: 'Online',
                title: 'Appointment Booked with Dr. Milind Chachun',
                status: 'Requested',
                feeStatus: 'Service Fee Paid',
                details: []
            }
        ]
    }
];

const TimelineItem = ({ log }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="grid grid-cols-[16px_1fr] gap-2  ">
            {/* timeline column */}
            <div className="relative flex justify-center">
                <span className="absolute top-0 bottom-0 w-px bg-secondary-grey100" />
                <span className="absolute top-10 w-[8px] h-[8px] rounded-full bg-secondary-grey200" />

            </div>

            <div className="flex flex-col gap-[2px] py-2">
                <div className="flex items-center gap-2 text-sm text-secondary-grey200 ">
                    <span>{log.date}</span>
                    <span className="text-gray-300">|</span>
                    <span>{log.time}</span>
                    <span className="text-gray-300">|</span>
                    <span>{log.type}</span>
                </div>

                <span className="text-sm  text-secondary-grey400">{log.title}</span>

                <div className="flex items-center gap-1 flex-wrap">
                    {log.status === 'Completed' && (
                        <Badge color="success" size="xs" className="text-xs">Completed in {log.duration}</Badge>
                    )}
                    {log.status === 'Cancelled' && (
                        <Badge color="red" size="xs" className="text-xs">Cancelled</Badge>
                    )}
                    {log.status === 'Requested' && (
                        <Badge color="warning" size="xs" className="text-xs">Requested</Badge>
                    )}

                  

                    {log.feeStatus && (
                        <div className=''>
  <span className="text-gray-300 ">|</span>
                        
                        <span className="text-sm ml-1 text-gray-500">
                            {log.feeStatus}
                        </span>
                        </div>
                    )}
                    <span className="text-gray-300">|</span>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm text-blue-600 flex items-center gap-0.5 hover:underline ml-1"
                    >
                        {expanded ? 'View Details' : 'View Details'}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>

                {expanded && log.details && log.details.length > 0 && (
                    <div className="mt-1  rounded-lg p-2 bg-blue-primary50">
                        <div className="">
                            <span className="min-w-[18px] text-xs bg-secondary-grey50 text-secondary-grey400 px-1 py-[2px] border border-secondary-grey200/20 rounded-sm">Badge</span>
                        </div>
                        <div className="">
                            {log.details.map((detail, idx) => {
                                const isLast = idx === log.details.length - 1;
                                return (
                                    <div key={idx} className={`flex flex-col  relative ml-3 pl-5 border-l border-secondary-grey100/50  ${!isLast ? '' : ''}`}>
                                        <div className="absolute -left-[5.5px] top-5 w-[8px] h-[8px] rounded-full bg-secondary-grey200"></div>

                                        <div className='flex flex-col gap-[2px] pt-3 pb-1'>
                                            <div className="text-sm font-medium text-secondary-grey400 leading-none">{detail.title}</div>
                                        <div className="text-xs text-secondary-grey300">{detail.desc}</div>
                                        </div>
                                        
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AppointmentLogDrawer({ open, onClose }) {
    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Appointment Log Details Activity Log"
            width={600}
            showPrimaryAction={false} // No save button in design
        >
            <div className="flex flex-col ">
                {sampleLogs.map((group, idx) => (
                    <div key={idx} className=''>
                        <div className='h-[22px] px-[6px] flex bg-secondary-grey50 rounded-sm w-fit '>
                            <span className="text-secondary-grey400">{group.month}</span>
                        </div>
                        <div className="pl-4">
                            {group.logs.map((log) => (
                                <TimelineItem key={log.id} log={log} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </GeneralDrawer>
    )
}
