import React from 'react';
import { createPortal } from 'react-dom';
import TableHeader from '../../../components/TableHeader';
import AvatarCircle from '../../../components/AvatarCircle';
import Badge from '../../../components/Badge';
import pending from '../../../../public/pending.png';
import { action_calendar, action_dot, action_heart, vertical } from '../../../../public';
import { Users, Pencil, Trash2 } from 'lucide-react';

// Icons placeholders if not imported, but using Lucide for now as user didn't provide assets
// Based on image: Calendar (Schedule?), History (RotateCcw?), More (MoreVertical)

const tick = '/tick.png';

// Dummy Action renderer
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
            setPosition({ top: rect.bottom + 4, left: rect.right - 192 }); // w-48 is 192px
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
            <div className='h-4 border-l border-secondary-grey100/50 '></div>

            <button
                ref={buttonRef}
                className="hover:opacity-75 py-2"
                onClick={toggleMenu}
            >
                <img src={action_dot} alt="" className="w-[17px]" />
            </button>

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{ top: position.top, left: position.left, position: 'fixed', zIndex: 9999 }}
                    className="w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-100 transform origin-top-right text-left"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        More Actions
                    </div>
                    <button
                        onClick={(e) => handleAction('Add Dependents', e)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Users className="w-4 h-4 text-gray-400" />
                        Add Dependents
                    </button>
                    <button
                        onClick={(e) => handleAction('Edit Profile', e)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4 text-gray-400" />
                        Edit Profile
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                        onClick={(e) => handleAction('Delete Patient', e)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Patient
                    </button>
                </div>,
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

                    <AvatarCircle name={row.name} size="s" color={isActive ? "blue" : "grey"} />

                    <div className='flex flex-col text-sm'>
                        <p className="font-medium text-secondary-grey400 leading-5">
                            {row.name}
                        </p>
                        <p className="text-secondary-grey300 uppercase">
                            {row.genderInitial || row.gender} | {row.dob ? new Date(row.dob).toLocaleDateString() : '—'} ({row.age}Y)
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
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.patientCode}</span>
    },
    {
        key: 'contact',
        header: <TableHeader label="Contact Number" />,
        width: 160,
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.contactNumber}</span>
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
                <span className="text-secondary-grey400">{row.location || '—'}</span>
            </div>
        )
    },
    {
        key: 'lastVisit',
        header: <TableHeader label="Last Visit Date & Time" />,
        width: 200,
        render: (row) => <span className="text-secondary-grey300 text-sm">{row.lastVisitDate ? `${new Date(row.lastVisitDate).toLocaleDateString()} ${row.lastVisitTime || ''}` : '—'}</span>
    },
    {
        key: 'reason',
        header: <TableHeader label="Reason for Last Visit" />,
        width: 689,

        render: (row) => <span className="text-secondary-grey300 text-sm " title={row.reasonForLastVisit}>{row.reasonForLastVisit || '—'}</span>
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
