import React from 'react';
import TableHeader from '../../../components/TableHeader';
import AvatarCircle from '../../../components/AvatarCircle';
import Badge from '../../../components/Badge';
import { MoreVertical, Eye, CalendarClock, Briefcase, Link, UserX, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const eye = '/black_eye.png';
const more = '/more_black.png';
const tick = '/tick.png';

const ActionCell = ({ row }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const menuRef = React.useRef(null);
    const buttonRef = React.useRef(null);

    const openDoctor = (e) => {
        e.stopPropagation();
        navigate(`/hospital/doctor/${encodeURIComponent(row.userId || row.id)}`, { state: { doctor: row } });
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: rect.right - 224 // 224px is w-56
            });
        }
        setIsOpen(!isOpen);
    };

    const handleAction = (action, e) => {
        e.stopPropagation();
        console.log(`Action: ${action}`, row);
        setIsOpen(false);
    };

    return (
        <div className="flex items-center justify-center gap-2 relative">
            <button
                className="p-2 rounded hover:bg-gray-100"
                aria-label="View"
                onClick={openDoctor}
            >
                <img src={eye} alt="" className='h-3.5' />
            </button>

            <div className='h-4 border-l border-secondary-grey100/50 ml-1 mr-1'></div>

            <button
                ref={buttonRef}
                className={`p-2 py-2 rounded hover:bg-gray-100 ${isOpen ? 'bg-gray-100' : ''}`}
                aria-label="More"
                onClick={toggleMenu}
            >
                <img src={more} alt="" className='w-4' />
            </button>

            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        zIndex: 99999,
                        width: '14rem' // w-56
                    }}
                    className="bg-white rounded-lg shadow-lg border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => handleAction('Update Availability Timing', e)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <CalendarClock className="w-4 h-4 text-gray-500" />
                        Update Availability Timing
                    </button>
                    <button
                        onClick={(e) => handleAction('Set Out of Office', e)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        Set Out of Office
                    </button>
                    <button
                        onClick={(e) => handleAction('Send Magic Link', e)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Link className="w-4 h-4 text-gray-500" />
                        Send Magic Link
                    </button>
                    <button
                        onClick={(e) => handleAction('Mark as Inactive', e)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <UserX className="w-4 h-4 text-gray-500" />
                        Mark as Inactive
                    </button>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                        onClick={(e) => handleAction('Delete Profile', e)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Profile
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

export const doctorColumns = [
    {
        key: 'name',
        header: <TableHeader label="Doctors" />,
        width: 280,
        sticky: 'left',
        headerClassName: 'pl-[52px]',
        render: (row) => {
            const isActive = row.status === 'Active';
            return (
                <div className="flex items-center gap-2">
                    <div className='relative'>
                        <AvatarCircle name={row.name} size="s" color={isActive ? "blue" : "grey"} />
                    </div>
                    <div className='flex flex-col  text-sm'>
                        <p className="font-medium text-secondary-grey400 leading-5">{row.name}</p>
                        <p className=" text-secondary-grey300">
                            {row.gender ? `${String(row.gender).charAt(0).toUpperCase()} | ` : ''}
                            {row.exp} years of experience
                        </p>
                    </div>
                </div>
            )
        },
    },
    {
        key: 'id',
        header: <TableHeader label="Doc ID" />,
        width: 140,
    },
    {
        key: 'contact',
        header: <TableHeader label="Contact Number" />,
        width: 160,
        render: (row) => <span className="text-secondary-grey300">{row.contact}</span>
    },
    {
        key: 'email',
        header: <TableHeader label="Email" />,
        width: 190,
        cellClass: "whitespace-normal break-words text-secondary-grey400",
        render: (row) => <span className="text-secondary-grey300">{row.email}</span>
    },
    {
        key: 'location',
        header: <TableHeader label="Location" />,
        width: 160,
        render: (row) =>
            <div className='h-[22px] px-[6px] flex bg-secondary-grey50 rounded-sm w-fit'>
                <span className="text-secondary-grey400">{row.location}</span>
            </div>

    },
    {
        key: 'specialization',
        header: <TableHeader label="Specializations" />,
        width: 200,
        render: (row) => (
            <div className="flex items-center gap-2 flex-wrap">
                {row.specialization?.includes('/') ? (
                    <Badge size="s" type="ghost" color="gray" className="!h-6 !text-[12px] !px-2 whitespace-nowrap">
                        {row.specialization}
                    </Badge>
                ) : (
                    <span className="text-secondary-grey300">{row.specialization}</span>
                )}
                {row.specializationMore ? (
                    <Badge size="s" type="ghost" color="gray" className="!h-5 !text-[11px] !px-1.5">
                        +{row.specializationMore}
                    </Badge>
                ) : null}
            </div>
        ),
    },
    {
        key: 'designation',
        header: <TableHeader label="Designation" />,
        width: 200,
        cellClass: "whitespace-normal break-words text-secondary-grey400",
        render: (row) => <span className="text-secondary-grey300">{row.designation}</span>
    },
    {
        key: 'actions',
        header: <TableHeader label="Actions" showIcon={false} />,

        sticky: 'right',
        align: 'center',
        render: (row) => <ActionCell row={row} />,
    },
];
