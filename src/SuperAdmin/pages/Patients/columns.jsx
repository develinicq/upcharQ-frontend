import React from 'react';
import { createPortal } from 'react-dom';
import TableHeader from '../../../components/TableHeader';
import AvatarCircle from '../../../components/AvatarCircle';
import pending from '../../../../public/pending.png';
import { action_calendar, action_dot, action_heart, vertical } from '../../../../public';

const tick = '/tick.png';

const ActionCell = ({ row, onOpenLog, onSchedule }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const menuRef = React.useRef(null);
    const buttonRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleScroll = () => { if (isOpen) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + 8, left: rect.right - 225 }); // Wider menu matching screenshot
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (action, e) => {
        e.stopPropagation();
        console.log(action, row);
        setIsOpen(false);
    };

    return (
        <div className=" flex items-center justify-center gap-4 text-gray-600 relative">
            <button className="hover:opacity-75" onClick={(e) => { e.stopPropagation(); onSchedule?.(row); }}>
                <img src={action_calendar} alt="" className="w-[18px]" />
            </button>
            <div className='h-4 border-l border-secondary-grey100/50 '></div>

            <button className="hover:opacity-75" onClick={(e) => { e.stopPropagation(); if (onOpenLog) onOpenLog(row); }}>
                <img src={pending} alt="" className="w-[18px]" />
            </button>
            <div className='h-4 border-r border-secondary-grey100/50 '></div>

            <button
                ref={buttonRef}
                className="hover:bg-secondary-grey100/50 py-2 px-1 cursor-pointer transition-colors"
                onClick={toggleMenu}
            >
                <img src={action_dot} alt="" className="w-[17px]" />
            </button>

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{ top: position.top, left: position.left, position: 'fixed', zIndex: 9999, width: '225px' }}
                    className="bg-white rounded-[10px] shadow-[0px_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-100 transform origin-top-right text-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-[18px] py-2 text-xs font-medium text-secondary-grey200 uppercase">
                        More Actions
                    </div>
                    <button
                        onClick={(e) => handleAction('Add Dependents', e)}
                        className="w-full text-left px-[18px] py-2 text-sm text-secondary-grey400 hover:bg-gray-50 flex items-center gap-3"
                    >
                        <img src="/superAdmin/patient_list/staff.svg" alt="" className="w-5 h-5" />
                        Add Dependents
                    </button>
                    <button
                        onClick={(e) => handleAction('Edit Profile', e)}
                        className="w-full text-left px-[18px] py-2 text-sm text-secondary-grey400 hover:bg-gray-50 flex items-center gap-3"
                    >
                        <img src="/superAdmin/patient_list/Pen.svg" alt="" className="w-5 h-5" />
                        Edit Profile
                    </button>
                    <div className="mx-2 h-px bg-[#E0E7FF] my-1.5"></div>
                    <button
                        onClick={(e) => handleAction('Delete Patient', e)}
                        className="w-full text-left px-[18px] py-2 text-sm text-[#F04438] hover:bg-red-50 flex items-center gap-3"
                    >
                        <img src="/superAdmin/doctor_list_dropdown/bin.svg" alt="" className="w-5 h-5" />
                        Delete Patient
                    </button>
                </div>
                ,
                document.body
            )}


        </div>
    );
};

export const getPatientColumns = (onOpenLog, onSchedule) => [
    {
        key: 'name',
        header: <TableHeader label="Patient" />,
        width: 260,
        sticky: 'left',
        headerClassName: 'pl-[52px]',
        render: (row) => {
            const isActive = row.status === 'Active';
            return (
                <div className="flex items-center gap-2">

                    <AvatarCircle name={row.name} size="s" color={row.isActive ? "blue" : "grey"} />

                    <div className='flex flex-col text-sm'>
                        <p className="font-medium text-secondary-grey400 leading-5">
                            {row.name}
                        </p>
                        <p className="text-secondary-grey300">
                            {row.gender ? (row.gender.charAt(0).toUpperCase() + row.gender.slice(1).toLowerCase()) : '-'} | {row.dob} ({row.age})
                        </p>
                    </div>
                </div>
            )
        },
    },
    {
        key: 'id',
        header: <TableHeader label="Patient ID" />,
        width: 140,
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.id}</span>
    },
    {
        key: 'contact',
        header: <TableHeader label="Contact Number" />,
        width: 160,
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.contact}</span>
    },
    {
        key: 'email',
        header: <TableHeader label="Email" />,
        width: 190,
        cellClass: "whitespace-normal break-words",
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.email}</span>
    },
    {
        key: 'location',
        header: <TableHeader label="Location" />,
        width: 160,
        render: (row) => (
            <div className='h-[22px] px-[6px] flex bg-secondary-grey50 rounded-sm w-fit'>
                <span className="text-secondary-grey400">{row.location}</span>
            </div>
        )
    },
    {
        key: 'lastVisit',
        header: <TableHeader label="Last Visit Date & Time" />,
        width: 200,
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.lastVisit}</span>
    },
    {
        key: 'reason',
        header: <TableHeader label="Reason for Last Visit" />,
        width: 689,

        render: (row) => <span className="text-secondary-grey300 text-sm " title={row.reason}>{row.reason}</span>
    },
    {
        key: 'actions',
        header: <TableHeader label="Actions" showIcon={false} />,
        width: 160,
        sticky: 'right',
        align: 'center',
        render: (row) => <ActionCell row={row} onOpenLog={onOpenLog} onSchedule={onSchedule} />,
    },
];
