import { Search, Mail, Phone, User, HelpCircle, LogOut, ChevronRight, Contact, UserCircle, Users } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bell, chevdown, patientunselect, appointement } from '../../../public/index.js';
import useFrontDeskAuthStore from '../../store/useFrontDeskAuthStore';
import AvatarCircle from '../../components/AvatarCircle';
import { logoutAll } from '../../utils/authUtils';
import NotificationDrawer from '../../components/NotificationDrawer.jsx';
import AddPatientDrawer from '../../components/PatientList/AddPatientDrawer.jsx';
import BookAppointmentDrawer from '../../components/Appointment/BookAppointmentDrawer.jsx';

const Partition = () => (
	<div className='w-[8.5px] h-[20px] flex gap-[10px] items-center justify-center'>
		<div className='w-[0.5px] h-full bg-[#B8B8B8]'></div>
	</div>
);

const AddNewDropdown = ({ isOpen, onClose, onAddPatient, onBookAppointment, onAddStaff }) => {
	if (!isOpen) return null;

	return (
		<div className="absolute top-full right-0 mt-1 w-[190px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden p-2 z-[60]">
			<div className="flex flex-col gap-1">
				<button
					onClick={() => { onAddPatient?.(); onClose(); }}
					className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
				>
					<div className="w-4 h-4 flex items-center justify-center ml-1">
						<img src={patientunselect} alt="Add Patient" />
					</div>
					<span className="text-[#424242] font-normal text-sm">Add Patient</span>
				</button>

				<button
					onClick={() => { onAddStaff?.(); onClose(); }}
					className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
				>
					<div className="w-4 h-4 flex items-center justify-center ml-1">
						<Users className="w-4 h-4 text-blue-500" />
						{/* Placeholder icon for Staff */}
					</div>
					<span className="text-[#424242] font-normal text-sm">Add Staff</span>
				</button>

				<button
					onClick={() => { onBookAppointment?.(); onClose(); }}
					className="w-full rounded-md flex items-center gap-2 hover:bg-gray-50 h-8 transition-colors"
				>
					<div className="w-4 h-4 flex items-center justify-center ml-1">
						<img src={appointement} alt="Book Appointment" />
					</div>
					<span className="text-[#424242] font-normal text-sm">Book Appointment</span>
				</button>
			</div>
		</div>
	);
};

const FDNavbar = ({ useAuthStore = useFrontDeskAuthStore, BookDrawer = BookAppointmentDrawer }) => {
	const navigate = useNavigate();
	const searchRef = useRef(null);
	const { user, clearAuth, fetchMe } = useAuthStore();
	const [showProfile, setShowProfile] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const profileRef = useRef(null);
	const dropdownRef = useRef(null);

	useEffect(() => {
		if (fetchMe) {
			fetchMe();
		}
	}, [fetchMe]);

	const [addPatientOpen, setAddPatientOpen] = useState(false);
	const [bookApptOpen, setBookApptOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	useEffect(() => {
		const handler = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === '/') {
				e.preventDefault();
				searchRef.current?.focus();
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
		};
		const onKey = (e) => {
			if (e.key === 'Escape') {
				setShowProfile(false);
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		window.addEventListener('keydown', onKey);
		return () => { document.removeEventListener('mousedown', handleClickOutside); window.removeEventListener('keydown', onKey); };
	}, []);

	const handleLogout = () => {
		logoutAll();
		navigate('/doc/signin');
	};

	const displayName = user?.name || 'FrontDesk';
	const position = user?.position || 'Receptionist';
	const email = user?.email || '—';
	const phone = user?.phone || '—';
	const staffId = user?.staffId || '—';
	const role = user?.role || 'Front Desk User';

	return (
		<div className='w-full h-12 border-b-[0.5px] border-[#D6D6D6] flex items-center px-4 gap-3'>
			<div className='shrink-0'>
				<span className='text-sm text-[#424242]'>Dashboard</span>
			</div>
			<div className='ml-auto'>
				<div className='relative w-[360px] max-w-[60vw]'>
					<Search className='absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#959595]' />
					<input
						ref={searchRef}
						type='text'
						placeholder='Search Patients'
						className='w-full h-8 rounded border border-[#E3E3E3] bg-[#F9F9F9] pl-8 pr-16 text-sm text-[#424242] placeholder:text-[#959595] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2372EC]'
					/>
					<div className='absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280] border border-[#E5E7EB] rounded px-1 py-0.5 bg-white'>
						Ctrl+/
					</div>
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<div className="relative" ref={dropdownRef}>
					<button
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className='flex items-center bg-[#2372EC] p-2 h-8 min-w-8 rounded-[4px] gap-2 hover:bg-blue-600 transition-colors'
					>
						<span className='text-white text-sm font-medium'>Add New</span>
						<div className='flex border-l border-blue-400 pl-1'>
							<img src={chevdown} alt="Dropdown" />
						</div>
					</button>
					<AddNewDropdown
						isOpen={isDropdownOpen}
						onClose={() => setIsDropdownOpen(false)}
						onAddPatient={() => setAddPatientOpen(true)}
						onBookAppointment={() => setBookApptOpen(true)}
						onAddStaff={() => { /* Placeholder for Staff Logic */ }}
					/>
				</div>

				<Partition />
				<div className='w-7 h-7 p-1 relative'>
					<div className='absolute -top-1 -right-1 flex items-center justify-center rounded-full w-[14px] h-[14px] bg-[#F04248]'>
						<span className='font-medium text-[10px] text-white'>8</span>
					</div>
					<button onClick={() => setShowNotifications(true)} style={{ background: 'none', border: 'none', padding: 0 }}>
						<img src={bell} alt='Notifications' className='w-5 h-5' />
					</button>
				</div>
				<Partition />
				<div className='relative flex items-center gap-2' ref={profileRef}>
					<span className='font-semibold text-base text-[#424242]'>{displayName?.split(' ')?.[0] || 'FrontDesk'}</span>
					<button type='button' onClick={() => setShowProfile(v => !v)} className='cursor-pointer'>
						<AvatarCircle name={displayName || 'FD'} size='s' color='orange' />
					</button>
					{showProfile && (
						<div className='absolute top-10 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50'>
							<div className='p-4 flex items-start gap-3'>
								<AvatarCircle name={displayName || 'FD'} size='md' color='orange' />
								<div className='flex flex-col'>
									<div className='text-sm font-semibold text-gray-900'>{displayName}</div>
									<div className='text-xs text-gray-600'>{position}</div>
								</div>
							</div>
							<div className='px-4 pb-3 space-y-2 text-xs'>
								<div className='flex items-center gap-2 text-gray-700'>
									<Mail className='w-4 h-4 text-[#597DC3]' />
									<span className='truncate'>{email}</span>
								</div>
								<div className='flex items-center gap-2 text-gray-700'>
									<Phone className='w-4 h-4 text-[#597DC3]' />
									<span>{phone}</span>
								</div>
								<div className='flex items-center gap-2 text-gray-700'>
									<Contact className='w-4 h-4 text-[#597DC3]' />
									<span className='truncate'>{staffId}</span>
								</div>
								<div className='flex items-center gap-2 text-gray-700'>
									<UserCircle className='w-4 h-4 text-[#597DC3]' />
									<span className='truncate'>{role}</span>
								</div>
							</div>
							<div className='border-t border-gray-200 divide-y text-sm'>
								<button className='w-full flex items-center justify-between px-4 h-10 hover:bg-gray-50 text-gray-700'>
									<span className='flex items-center gap-2 text-[13px]'><HelpCircle className='w-4 h-4 text-gray-500' /> Edit Profile</span>
									<ChevronRight className='w-4 h-4 text-gray-400' />
								</button>
								<button onClick={handleLogout} className='w-full flex items-center justify-between px-4 h-10 hover:bg-gray-50 text-gray-700'>
									<span className='flex items-center gap-2 text-[13px]'><LogOut className='w-4 h-4 text-gray-500' /> Logout</span>
									<ChevronRight className='w-4 h-4 text-gray-400' />
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			<NotificationDrawer show={showNotifications} onClose={() => setShowNotifications(false)} />
			<AddPatientDrawer open={addPatientOpen} onClose={() => setAddPatientOpen(false)} onSave={() => setAddPatientOpen(false)} />
			<BookDrawer
				open={bookApptOpen}
				onClose={() => setBookApptOpen(false)}
				// Pass doctor/clinic IDs from store if available, typically FD store might need to have them or pass placeholders
				// For now passing undefined lets the drawer handle it or defaults.
				// user object in FD store might have location IDs.
				doctorId={user?.doctorId}
				clinicId={user?.clinicId}
				hospitalId={undefined}
				onSave={() => setBookApptOpen(false)}
			/>
		</div>
	);
};

export default FDNavbar;
