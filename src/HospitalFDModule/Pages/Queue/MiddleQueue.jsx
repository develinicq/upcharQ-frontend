import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { bookWalkInAppointment, checkInAppointment, markNoShowAppointment, startSlotEta, endSlotEta, getSlotEtaStatus, startPatientSessionEta, endPatientSessionEta, findPatientSlots, pauseSlotEta, resumeSlotEta } from '../../../services/authService';
import { Calendar, ChevronDown, Sunrise, Sun, Sunset, Moon, X, Play, ArrowRight, User, BedDouble, CalendarPlus, UserX, RotateCcw, CheckCircle, HeartPulse, BriefcaseMedical, PauseCircle, CheckCheck, CalendarMinus, CalendarX, Bell, Clock, Info } from 'lucide-react';
import axiosInstance from '../../../lib/axios';
import { Morning, Afternoon, Evening, Night } from '../../../components/Icons/SessionIcons';
import UniversalLoader from '../../../components/UniversalLoader';
import useToastStore from '../../../store/useToastStore';
import QueueDatePicker from '../../../components/QueueDatePicker';
import AvatarCircle from '../../../components/AvatarCircle';
import BookWalkinAppointment2 from '../../../components/Appointment/BookWalkinAppointment2';
import Badge from '../../../components/Badge';
import Toggle from '../../../components/FormItems/Toggle';
import SampleTable from '../../../pages/SampleTable';
const more = '/superAdmin/Doctors/Threedots.svg'
import TerminateQueueModal from '../../../components/TerminateQueueModal';
import useSlotStore from '../../../store/useSlotStore';
import useAuthStore from '../../../store/useAuthStore';
import { getDoctorMe } from '../../../services/authService';
import useHospitalFrontDeskAuthStore from '../../../store/useHospitalFrontDeskAuthStore';
import { classifyISTDayPart, buildISTRangeLabel } from '../../../lib/timeUtils';
import Button from '@/components/Button';
import SessionTimer from '../../../components/SessionTimer';
const search = '/superAdmin/Doctors/SearchIcon.svg';
const pause = '/fd/Pause.svg';
const checkRound = '/fd/Check Round.svg';
const verified = '/verified-tick.svg'
const stopwatch = '/fd/Stopwatch.svg'
const verifiedYellow = '/fd/verified_yellow.svg'
const terminate = '/Doctor_module/patient/terminate.png';

const getIconForTime = (hour) => {
	if (hour < 12) return Morning;
	if (hour < 17) return Afternoon;
	if (hour < 20) return Evening;
	return Night;
};

const getLabelForTime = (hour) => {
	if (hour < 12) return 'Morning';
	if (hour < 17) return 'Afternoon';
	if (hour < 20) return 'Evening';
	return 'Night';
};

// Helpers

const formatSlotTime = (timeStr) => {
	if (!timeStr) return '';
	try {
		const date = new Date(timeStr);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
	} catch (e) {
		return '';
	}
};

const calculateAge = (dob) => {
	if (!dob) return '';
	const birthDate = new Date(dob);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age >= 0 ? `${age}Y` : '';
};




export default function MiddleQueue({ doctorId: propsDoctorId, sessionStarted = false, onPauseQueue, isPaused, pauseDuration, pauseStartTime, onResumeQueue, currentToken = 0, onStatusUpdate }) {
	// Timer Logic for Pause
	const [remainingTime, setRemainingTime] = useState('00:00');

	useEffect(() => {
		if (!isPaused || !pauseStartTime || !pauseDuration) return;

		const interval = setInterval(() => {
			const start = new Date(pauseStartTime).getTime();
			const now = new Date().getTime();
			const elapsedSec = Math.floor((now - start) / 1000);
			const totalSec = pauseDuration * 60;
			const remaining = Math.max(0, totalSec - elapsedSec);

			const m = Math.floor(remaining / 60);
			const s = remaining % 60;
			setRemainingTime(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);

			if (remaining <= 0) {
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [isPaused, pauseStartTime, pauseDuration]);

	const [activeFilter, setActiveFilter] = useState('In Waiting');
	const [currentDate, setCurrentDate] = useState(new Date());
	const [activeActionMenuToken, setActiveActionMenuToken] = useState(null);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const [sessionStatus, setSessionStatus] = useState('idle'); // 'idle' | 'ongoing' | 'completed'
	const { hospitalId } = useHospitalFrontDeskAuthStore();

	const [timeSlots, setTimeSlots] = useState([]);
	const [selectedSlotId, setSelectedSlotId] = useState('');
	const [slotLoading, setSlotLoading] = useState(false);
	const [slotError, setSlotError] = useState('');
	const [localSlotStatus, setLocalSlotStatus] = useState('CREATED');

	const [appointmentsData, setAppointmentsData] = useState({
		checkedIn: [],
		inWaiting: [],
		engaged: [],
		noShow: [],
		admitted: [],
		all: []
	});
	const [appointmentCounts, setAppointmentCounts] = useState({
		checkedIn: 0,
		inWaiting: 0,
		engaged: 0,
		noShow: 0,
		admitted: 0,
		all: 0
	});
	const [polledActivePatient, setPolledActivePatient] = useState(null);
	const [loading, setLoading] = useState(false);
	const [checkingInId, setCheckingInId] = useState(null);

	const { addToast } = useToastStore();

	const mapAppointmentToRow = (appt) => {
		const p = appt.patientDetails || {};
		return {
			token: appt.tokenNo,
			patientName: p.name || `${p.firstName} ${p.lastName}`.trim(),
			gender: p.gender === 'MALE' ? 'M' : p.gender === 'FEMALE' ? 'F' : 'O',
			dob: p.dob ? new Date(p.dob).toLocaleDateString() : '',
			age: calculateAge(p.dob),
			appointmentType: appt.appointmentType === 'NEW' ? 'New Consultation' : 'Follow-up Consultation',
			expectedTime: appt.expectedTime ? formatSlotTime(appt.expectedTime) : '',
			startTime: appt.startTime ? formatSlotTime(appt.startTime) : '',
			endTime: appt.endTime ? formatSlotTime(appt.endTime) : '',
			bookingType: appt.bookingMode === 'WALK_IN' ? 'Walk-In' : 'Online',
			reason: appt.reason,
			status: appt.status,
			id: appt.id
		};
	};

	const fetchAppointments = async (slotId) => {
		if (!slotId) return;
		setLoading(true);
		try {
			const res = await axiosInstance.get(`/appointments/slot/${slotId}`);
			if (res.data?.success) {
				const data = res.data.data;
				const counts = data.counts || {};
				const appointments = data.appointments || {};

				const normalizeCount = (val) => {
					if (typeof val === 'number') return val;
					if (val && typeof val === 'object' && val.total !== undefined) return val.total;
					return 0;
				};

				setAppointmentCounts({
					checkedIn: normalizeCount(counts.checkedIn),
					inWaiting: normalizeCount(counts.inWaiting),
					engaged: normalizeCount(counts.engaged),
					noShow: normalizeCount(counts.noShow),
					admitted: normalizeCount(counts.admitted),
					all: normalizeCount(counts.all)
				});

				const ensureArray = (val) => Array.isArray(val) ? val : [];

				const noShowRaw = appointments.noShow || {};
				const withinGrace = ensureArray(noShowRaw.withinGracePeriod).map(item => ({ ...mapAppointmentToRow(item), isGrace: true }));
				const outsideGrace = ensureArray(noShowRaw.outsideGracePeriod).map(item => ({ ...mapAppointmentToRow(item), isGrace: false }));

				const mappedNoShowStrict = [
					{ isHeader: true, label: "Within Grace Period" },
					...withinGrace,
					{ isHeader: true, label: "Outside Grace Period" },
					...outsideGrace
				];

				setAppointmentsData({
					checkedIn: ensureArray(appointments.checkedIn).map(mapAppointmentToRow),
					inWaiting: ensureArray(appointments.inWaiting).map(mapAppointmentToRow),
					engaged: ensureArray(appointments.engaged).map(mapAppointmentToRow),
					noShow: mappedNoShowStrict,
					admitted: ensureArray(appointments.admitted).map(mapAppointmentToRow),
					all: ensureArray(appointments.all).map(mapAppointmentToRow)
				});
			}
		} catch (error) {
			console.error("Failed to fetch appointments", error);
		} finally {
			setLoading(false);
		}
	};

	const pollSlotStatus = async () => {
		if (!selectedSlotId) return;
		try {
			const res = await axiosInstance.get(`/eta/slot/${selectedSlotId}/status`);
			if (res.data?.success) {
				// Handle variant response shapes
				const statusData = typeof res.data.message === 'object' ? res.data.message : res.data.data;

				if (statusData && typeof statusData === 'object') {
					const { activePatientDetails, currentToken: apiToken, slotStatus } = statusData;

					// Update active patient
					if (activePatientDetails) {
						const p = activePatientDetails;
						setPolledActivePatient({
							patientName: `${p.firstName} ${p.lastName}`.trim(),
							token: p.tokenNumber,
							gender: p.gender === 'MALE' ? 'M' : p.gender === 'FEMALE' ? 'F' : 'O',
							age: calculateAge(p.dob),
							reasonForVisit: p.reason,
							patientId: p.patientId,
							startedAt: p.startedAt
						});
					} else {
						setPolledActivePatient(null);
					}

					// Notify parent of status/token updates
					if (onStatusUpdate) {
						onStatusUpdate({
							currentToken: apiToken,
							status: slotStatus,
							slotId: selectedSlotId
						});
					}
					setLocalSlotStatus(slotStatus);
				}
			}
		} catch (error) {
			console.error("Failed to poll slot status", error);
		}
	};

	const fetchSlots = async () => {
		if (!propsDoctorId || !hospitalId) return;
		setSlotLoading(true);
		setSlotError('');
		try {
			const year = currentDate.getFullYear();
			const month = String(currentDate.getMonth() + 1).padStart(2, '0');
			const day = String(currentDate.getDate()).padStart(2, '0');
			const formattedDate = `${year}-${month}-${day}`;

			const payload = {
				doctorId: propsDoctorId,
				hospitalId: hospitalId,
				date: formattedDate
			};

			const res = await findPatientSlots(payload);
			const apiSlots = Array.isArray(res) ? res : (res?.data || []);

			if (apiSlots.length > 0) {
				apiSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
				const mappedSlots = apiSlots.map(slot => {
					const startRaw = new Date(slot.startTime);
					return {
						key: slot.id,
						label: getLabelForTime(startRaw.getHours()),
						time: buildISTRangeLabel(slot.startTime, slot.endTime),
						Icon: getIconForTime(startRaw.getHours()),
						slotId: slot.id,
						raw: slot
					};
				});
				setTimeSlots(mappedSlots);
				// Auto-select first slot
				setSelectedSlotId(mappedSlots[0].slotId);
			} else {
				setTimeSlots([]);
				setSelectedSlotId('');
			}
		} catch (err) {
			console.error("Failed to fetch slots", err);
			setSlotError("Failed to load slots");
		} finally {
			setSlotLoading(false);
		}
	};

	useEffect(() => {
		fetchSlots();
	}, [propsDoctorId, hospitalId, currentDate]);

	useEffect(() => {
		if (selectedSlotId) {
			fetchAppointments(selectedSlotId);
			pollSlotStatus();
		}
	}, [selectedSlotId]);

	useEffect(() => {
		if (selectedSlotId && sessionStarted) {
			fetchAppointments(selectedSlotId);
			pollSlotStatus();
		}
	}, [sessionStarted]);

	useEffect(() => {
		if (!selectedSlotId) return;
		const interval = setInterval(() => {
			fetchAppointments(selectedSlotId);
			pollSlotStatus();
		}, 60000); // 1-min refresh
		return () => clearInterval(interval);
	}, [selectedSlotId]);

	const selectedSlot = timeSlots.find(s => s.slotId === selectedSlotId) || null;

	useEffect(() => {
		const handleClickOutside = () => setActiveActionMenuToken(null);
		const handleScroll = () => setActiveActionMenuToken(null);
		window.addEventListener('mousedown', handleClickOutside);
		window.addEventListener('scroll', handleScroll, true);
		return () => {
			window.removeEventListener('mousedown', handleClickOutside);
			window.removeEventListener('scroll', handleScroll, true);
		};
	}, []);

	const handleActionMenuClick = (e, token) => {
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		// For slot_dropdown, left-align with button. For others, align right edge.
		const menuWidth = token === "slot_dropdown" ? 300 : 200;
		const left = token === "slot_dropdown"
			? rect.left + window.scrollX
			: rect.left + window.scrollX - menuWidth + rect.width;

		setDropdownPosition({
			top: rect.bottom + window.scrollY + 4,
			left: left,
		});
		setActiveActionMenuToken(activeActionMenuToken === token ? null : token);
	};

	const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
	const handleMarkNoShow = async () => {
		const appointment = queueData.find(item => item.token === activeActionMenuToken);
		if (!appointment?.id) return;

		setIsMarkingNoShow(true);
		try {
			const res = await axiosInstance.put(`/appointments/no-show/${appointment.id}`);
			if (res.data?.success) {
				fetchAppointments(selectedSlotId);
				setActiveActionMenuToken(null);
				addToast({
					title: "Marked as No-Show",
					message: "The patient has been marked as No-Show.",
					type: "success",
					duration: 3000
				});
			}
		} catch (error) {
			console.error("Failed to mark as no-show", error);
			addToast({ title: "Error", message: "Failed to mark as no-show", type: "error" });
		} finally {
			setIsMarkingNoShow(false);
		}
	};

	const [isTerminatingQueue, setIsTerminatingQueue] = useState(false);
	const [showTerminateModal, setShowTerminateModal] = useState(false);

	// Derived States
	const sessionActive = localSlotStatus === 'STARTED' || localSlotStatus === 'PAUSED' || !!polledActivePatient;
	const activePatient = polledActivePatient;

	const getTableData = () => {
		if (activeFilter === 'In Waiting') return appointmentsData.inWaiting;
		if (activeFilter === 'Checked-In') return appointmentsData.checkedIn;
		if (activeFilter === 'Engaged') return appointmentsData.engaged;
		if (activeFilter === 'No show') return appointmentsData.noShow;
		if (activeFilter === 'Admitted') return appointmentsData.admitted;
		return appointmentsData.all;
	};
	const queueData = getTableData();

	const [showWalkInDrawer, setShowWalkInDrawer] = useState(false);
	const filters = ['In Waiting', 'Checked-In', 'Engaged', 'No show', 'Admitted'];
	const getFilterCount = (f) => {
		let val = 0;
		if (f === 'In Waiting') val = appointmentCounts.inWaiting;
		else if (f === 'Checked-In') val = appointmentCounts.checkedIn;
		else if (f === 'Engaged') val = appointmentCounts.engaged;
		else if (f === 'No show') val = appointmentCounts.noShow;
		else if (f === 'Admitted') val = appointmentCounts.admitted;

		return typeof val === 'number' ? val : 0;
	};

	return (
		<div className='h-full overflow-hidden bg-gray-50 flex flex-col '>
			<div className='sticky top-0 z-10 bg-white border-b-[0.5px] border-secondary-grey100 px-4 py-2 shrink-0'>
				<div className='flex items-center justify-between'>
					{/* Slot Dropdown */}
					<div className='relative '>
						<button
							type='button'
							onMouseDown={(e) => handleActionMenuClick(e, 'slot_dropdown')}
							onClick={(e) => e.stopPropagation()}
							className='flex w-[300px] items-center bg-white gap-1 text-[16px] text-secondary-grey400 hover:bg-gray-50 transition-all outline-none'
						>
							<span className='mr-1'>
								{slotLoading ? 'Loading slots...' : selectedSlot ? `${selectedSlot.label} (${selectedSlot.time})` : 'No slots available'}
							</span>
							<ChevronDown className='pl-1 h-4 border-l-[0.5px] border-secondary-grey100/50 text-gray-500' />
						</button>
					</div>
					{/* Date Picker */}
					<div className='flex-1 flex justify-center'>
						<QueueDatePicker date={currentDate} onChange={setCurrentDate} />
					</div>
					{/* Walk-in */}
					<div className='flex items-center gap-[10px]'>
						<div className="flex items-center gap-1 text-sm text-secondary-grey300">
							<span>{selectedSlot?.raw?.slotStatus === 'COMPLETED' ? 'Tokens Booked' : 'Tokens Available'}</span>
							<span className={`px-2 rounded-sm h-[22px] text-sm border border-transparent transition-colors cursor-pointer ${selectedSlot?.raw?.slotStatus === 'COMPLETED'
								? 'bg-secondary-grey50 text-secondary-grey200'
								: 'bg-success-100 text-success-300 hover:border-success-300/50'
								}`}>
								{(() => {
									const available = selectedSlot?.raw?.availableTokens ?? 0;
									const max = selectedSlot?.raw?.maxTokens ?? 0;
									const booked = max - available;
									return selectedSlot?.raw?.slotStatus === 'COMPLETED'
										? `${booked} Out of ${max}`
										: `${available} Out of ${max}`;
								})()}
							</span>
						</div>
						{selectedSlot?.raw?.slotStatus !== 'COMPLETED' && (
							<>
								<div className='bg-secondary-grey100/50 h-5 w-[1px]'></div>
								<button
									onMouseDown={(e) => handleActionMenuClick(e, 'queue_actions_dropdown')}
									onClick={(e) => e.stopPropagation()}
									className='hover:bg-secondary-grey50 rounded-sm'
								>
									<img src={more} alt="" />
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Queue Content */}
			<div className='px-0 pt-0 pb-2 flex-1 flex flex-col overflow-hidden'>

				{/* Queue Terminated UI */}
				{(() => {
					const isCompleted = selectedSlot?.raw?.slotStatus === 'COMPLETED';
					if (isCompleted && !sessionActive) {
						return (
							<div className="w-full bg-error-50 text-error-400 h-[40px] px-4 flex items-center justify-center relative z-20 gap-2 shrink-0">
								<img src={terminate} alt="" className="w-4 h-4" />
								<span className="font-medium text-[14px]">Queue Terminated</span>
								<Info className="w-4 h-4 ml-1" />
							</div>
						);
					}
					return null;
				})()}

				{/* Session Bar - GREEN if session active */}
				{sessionActive && (
					<div className={`w-full ${isPaused ? 'bg-warning-50 text-warning-400' : 'bg-[#27CA40] text-white'} h-[40px] px-4 flex items-center justify-between relative z-20`}>
						<div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 ${isPaused ? 'text-secondary-grey200' : 'text-white'}`}>
							<span className=' text-[20px] mr-3'>Current Token Number</span>
							<span className={`w-4 h-4 rounded-full animate-colorBlink ${isPaused ? 'bg-warning-400' : 'bg-white '} transition-all duration-1000`}
								style={!isPaused ? { '--blink-on': '#22c55e', '--blink-off': '#ffffff' } : { '--blink-on': '#EC7600', '--blink-off': '#ffffff' }}></span>
							<span className={`font-bold text-[20px] ${isPaused ? 'text-warning-400' : 'text-white'}`}>
								{String(currentToken || 0).padStart(2, '0')}
							</span>
							{isPaused && (
								<div className='flex items-center ml-2 border border-warning-400 py-[2px] rounded px-[6px] bg-white gap-1'>
									<img src={stopwatch} alt="" className='w-[14px] h-[14px]' />
									<span className="text-[14px] text-warning-400 ">
										Paused ({remainingTime} Mins)
									</span>
								</div>
							)}
						</div>

						<div className="ml-auto">
							{!isPaused ? (
								<button
									onClick={() => onPauseQueue(selectedSlotId)}
									className='bg-white text-[#ef4444] h-[24px] py-1 px-[6px] rounded text-[12px] font-medium border border-error-200/50 flex items-center gap-2 hover:bg-error-400 hover:text-white transition-colors '
								>
									<img src={pause} alt="" className='' /> Pause Queue
								</button>
							) : (
								<button
									onClick={() => onResumeQueue(selectedSlotId)}
									className='bg-blue-primary250 text-white h-[24px] py-1 px-[6px] rounded text-[12px] font-medium flex items-center gap-1.5 hover:bg-blue-primary300 transition-colors '
								>
									<RotateCcw className='w-[14px] h-[14px] -scale-y-100 rotate-180' /> Restart Queue
								</button>
							)}
						</div>
					</div>
				)}

				<div className='p-3 flex flex-col flex-1 min-h-0'>
					{sessionActive && (
						<span className="text-[20px] font-medium text-secondary-grey400 mb-2">Ongoing Consulation</span>
					)}

					{/* Active Patient Card */}
					{sessionActive && activePatient && (
						<div
							className={`flex items-center justify-between rounded-xl px-4 py-3 mb-4 bg-white border ${sessionStatus === 'completed'
								? 'border-success-200 bg-[linear-gradient(90deg,rgba(39,202,64,0.08)_0%,rgba(39,202,64,0)_25%,rgba(39,202,64,0)_75%,rgba(39,202,64,0.08)_100%)]'
								: sessionStatus === 'admitted'
									? 'border border-[#D4AF37] bg-[linear-gradient(90deg,rgba(212,175,55,0.15)_0%,rgba(212,175,55,0.05)_25%,rgba(212,175,55,0.05)_75%,rgba(212,175,55,0.15)_100%)]'
									: 'border-blue-primary250 bg-[linear-gradient(90deg,rgba(35,114,236,0.08)_0%,rgba(35,114,236,0)_25%,rgba(35,114,236,0)_75%,rgba(35,114,236,0.08)_100%)]'
								}`}
						>
							<div className='flex items-center gap-3'>
								<AvatarCircle name={activePatient.patientName} size="lg" className="h-12 w-12 text-lg" />
								<div className="flex gap-6 items-center">
									<div>
										<div className='flex items-center gap-2'>
											<span className="font-semibold text-secondary-grey400 text-[16px]">{activePatient.patientName}</span>
											<ArrowRight className="h-4 w-4 text-gray-400 -rotate-45" />
										</div>
										<div className='text-xs text-secondary-grey300'>{activePatient.gender} | {activePatient.age}</div>
									</div>
									<div className="h-10 w-px bg-secondary-grey100/50"></div>
									<div className="flex flex-col gap-1 text-sm text-secondary-grey200">
										<div className="flex items-center gap-2">
											<span className="">Token Number</span>
											<span className="bg-blue-primary50 text-blue-primary250 h-[22px] px-[6px] py-[2px] rounded-sm border border-blue-primary250/50 text-center flex items-center justify-center ">{activePatient.token}</span>
										</div>
										<div className="">Reason for Visit : <span className="text-secondary-grey400">{activePatient.reasonForVisit}</span></div>
									</div>
								</div>
							</div>
							<div className='flex gap-2 items-center'>
								{sessionStatus === 'idle' && (
									<Button
										variant="primary"
										size="small"
										onClick={() => setSessionStatus('ongoing')}
										className=" text-white flex items-center gap-2 px-4 py-2 font-medium"
									>
										<Play className="w-3.5 h-3.5 " />
										Start Session
									</Button>
								)}
								{sessionStatus === 'ongoing' && (
									<div className="flex items-center gap-3">
										<SessionTimer />
										<button
											onClick={() => setSessionStatus('completed')}
											className="flex items-center gap-2 bg-white border border-secondary-grey200/50 px-4 py-2 rounded-md text-sm font-medium text-secondary-grey400 hover:bg-gray-50 transition-colors"
										>
											<img src={checkRound} alt="" />
											<span>End Session</span>
										</button>
									</div>
								)}
								{sessionStatus === 'admitted' && (
									<div className="flex items-center gap-2 text-[#D4AF37] font-medium text-sm mr-6">
										<img src={verifiedYellow} alt="" className='w-5 h-5' />
										<span>Patient Admitted</span>
									</div>
								)}
								{sessionStatus === 'completed' && (
									<div className="flex items-center gap-2 text-success-300 font-medium text-sm mr-6">
										<img src={verified} alt="" className="w-5 h-5" />
										<span>Visit Completed</span>
									</div>
								)}
								{sessionStatus !== 'completed' && sessionStatus !== 'admitted' && (
									<button
										onClick={(e) => handleActionMenuClick(e, 'active_patient_card')}
										className={`px-2 rounded-full transition-colors ${activeActionMenuToken === 'active_patient_card' ? 'bg-gray-100' : ''}`}
									>
										<img src={more} alt="" />
									</button>
								)}
							</div>
						</div>
					)}

					{/* Filters & Actions */}
					<div className='flex items-center justify-between pb-2 '>
						<div className='flex gap-3 items-center'>
							{filters.map(f => (
								<button key={f} onClick={() => setActiveFilter(f)} className={`px-[6px] flex items-center gap-2  border h-[28px] rounded-md text-sm font-medium transition-colors ${activeFilter === f ? 'border-blue-primary150 bg-blue-primary50 text-blue-primary250' : 'text-gray-500 hover:border-secondary-grey150 border-secondary-grey50'}`}>
									{f} <span className={`min-w-[16px] text-[10px] h-[16px] rounded-sm px-1 border  flex ${activeFilter === f ? 'border-blue-primary150 bg-blue-primary50 text-blue-primary250' : 'text-gray-500 bg-white border-secondary-grey100'}  items-center justify-center`}>{getFilterCount(f)}</span>
								</button>
							))}
						</div>

						<div className='flex items-center gap-2'>
							<button>
								<img src={search} alt="" className='' />
							</button>

							<div className='h-6 bg-secondary-grey100/50 mx-1 w-[1px]'></div>
							<button
								onClick={() => setShowWalkInDrawer(true)}
								className='inline-flex items-center gap-2 h-[32px] min-w-[32px] p-2 rounded-sm border-[1px] text-sm font-medium border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors'
							>
								Walk-In Appointment
							</button>
						</div>
					</div>

					{/* Table or Loader */}
					{loading ? (
						<div className="w-full flex-1 flex flex-col items-center justify-center gap-2 bg-white rounded-lg border border-gray-200">
							<UniversalLoader size={30} />
							<span className="text-secondary-grey300 font-medium">Fetching appointments...</span>
						</div>
					) : (
						<div className='w-full flex flex-col flex-1 min-h-0 overflow-hidden bg-white rounded-lg border border-gray-200 relative'>
							<div className='absolute inset-0 overflow-auto'>
								<SampleTable
									columns={activeFilter === 'Engaged' ? [
										{
											key: "token",
											header: 'T.no',
											icon: true,
											width: 80,
											render: (row) => (
												<span className="text-secondary-grey400 items-center flex justify-center font-medium text-[14px] ">{String(row.token).padStart(2, '0')}</span>
											)
										},
										{
											key: "patient",
											header: "Patient",
											icon: true,
											width: 250,
											render: (row) => (
												<div className="flex items-center gap-2 ">
													<AvatarCircle name={row.patientName} size="md" className="shrink-0 bg-blue-50 text-blue-600" />
													<div>
														<div className="text-secondary-grey400 font-semibold text-sm">{row.patientName}</div>
														<div className="text-secondary-grey300 text-xs">{row.gender} | {row.dob} ({row.age})</div>
													</div>
												</div>
											)
										},
										{ key: "appointmentType", header: "Appt. Type", icon: true, width: 156 },
										{ key: "startTime", header: "Start Time", icon: true, width: 120 },
										{ key: "endTime", header: "End Time", icon: true, width: 120 },
										{ key: "bookingType", header: "Booking Type", icon: true, width: 156 },
										{ key: "reason", header: "Reason For Visit", icon: false, width: 200 },
										{
											key: "actions",
											header: "Actions",
											icon: false,
											sticky: "right",
											width: 180,
											render: (row) => (
												<div className="flex items-center justify-between">
													<button className="bg-[#2372EC] w-full text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
														Mark as Paid
													</button>
													<button
														onClick={(e) => handleActionMenuClick(e, row.token)}
														className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
													>
														<img src={more} alt="" className='w-8 h-8' />
													</button>
												</div>
											)
										}
									] : activeFilter === 'No show' ? [
										{
											key: "token",
											header: <div className="w-full text-center text-secondary-grey400 font-medium">Token</div>,
											icon: false,
											width: 80,
											render: (row) => (
												<span className="text-blue-primary250 items-center flex justify-center font-medium text-[20px] ">{String(row.token).padStart(2, '0')}</span>
											)
										},
										{
											key: "patient",
											header: "Patient",
											icon: true,
											width: 205,
											render: (row) => (
												<div className="flex items-center gap-2 ">
													<AvatarCircle name={row.patientName} size="md" color={!row.isGrace ? "grey" : "blue"} className="shrink-0" />
													<div>
														<div className="text-secondary-grey400 font-medium text-sm">{row.patientName}</div>
														<div className="text-secondary-grey300 text-xs">{row.gender} | {row.dob} ({row.age})</div>
													</div>
												</div>
											)
										},
										{ key: "appointmentType", header: "Appt. Type", icon: true, width: 156 },
										{ key: "expectedTime", header: "Expt. Time", icon: true, width: 140 },
										{ key: "bookingType", header: "Booking Type", icon: true, width: 156 },
										{ key: "reason", header: "Reason For Visit", icon: false, width: 200 },
										{
											key: "actions",
											header: "Actions",
											icon: false,
											sticky: "right",
											width: 100,
											render: (row) => (
												<div className="flex items-center justify-center">
													<button
														onClick={(e) => handleActionMenuClick(e, row.token)}
														className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
													>
														<img src={more} alt="" />
													</button>
												</div>
											)
										}
									] : [
										{
											key: "token",
											header: <div className="w-full text-center text-secondary-grey400 font-medium whitespace-nowrap">Token No</div>,
											icon: false,
											width: 80,
											render: (row) => (
												<span className="text-blue-primary250 items-center flex justify-center font-medium text-[20px] ">{String(row.token).padStart(2, '0')}</span>
											)
										},
										{
											key: "patient",
											header: "Patient",
											icon: true,
											width: 250,
											render: (row) => (
												<div className="flex items-center gap-2 ">
													<AvatarCircle name={row.patientName} size="md" className="shrink-0" />
													<div>
														<div className="text-secondary-grey400 font-medium text-sm">{row.patientName}</div>
														<div className="text-secondary-grey300 text-xs">{row.gender} | {row.dob} ({row.age})</div>
													</div>
												</div>
											)
										},
										{ key: "appointmentType", header: "Appt. Type", icon: true, width: 156 },
										{ key: "expectedTime", header: "Expt. Time", icon: true, width: 140 },
										{ key: "bookingType", header: "Booking Type", icon: true, width: 156 },
										{ key: "reason", header: "Reason For Visit", icon: false, width: 212 },
										{
											key: "actions",
											header: "Actions",
											icon: false,
											sticky: "right",
											width: 180,
											render: (row) => (
												<div className="flex items-center justify-between">
													{row.status === 'Waiting' ? (
														<button
															disabled={checkingInId === row.id}
															onClick={(e) => { e.stopPropagation(); handleCheckIn(row.id); }}
															className="bg-[#2372EC] w-full text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center min-h-[32px]"
														>
															{checkingInId === row.id ? <UniversalLoader size={16} /> : "Check-In"}
														</button>
													) : (
														<span className="text-success-300 font-medium text-sm flex justify-center w-full">Checked In</span>
													)}
													<button
														onClick={(e) => handleActionMenuClick(e, row.token)}
														className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
													>
														<img src={more} alt="" />
													</button>
												</div>
											)
										}
									]}
									data={queueData}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			<TerminateQueueModal
				show={showTerminateModal}
				onClose={() => setShowTerminateModal(false)}
				isTerminating={isTerminatingQueue}
				onConfirm={async () => {
					if (!selectedSlotId) return;
					setIsTerminatingQueue(true);
					try {
						const res = await endSlotEta(selectedSlotId);
						if (res?.success) {
							setShowTerminateModal(false);
							addToast({ title: "Queue Terminated", message: "Queue has been terminated.", type: "success" });
						}
					} catch (error) {
						addToast({ title: "Error", message: error.response?.data?.message || "Failed to terminate queue", type: "error" });
					} finally {
						setIsTerminatingQueue(false);
					}
				}}
			/>

			{/* Dropdown Menu Portal */}
			{activeActionMenuToken && createPortal(
				activeActionMenuToken === 'slot_dropdown' ? (
					<div
						className="fixed z-[100] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden py-2 px-2 animate-in fade-in duration-100"
						style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: 300 }}
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<ul>
							{timeSlots.map((option, idx) => {
								const isSelected = selectedSlotId === option.slotId;
								const { Icon, label, time, key } = option;
								return (
									<li key={key}>
										<button
											type="button"
											onClick={() => { setSelectedSlotId(option.slotId); setActiveActionMenuToken(null); }}
											className={`flex items-center gap-3 p-2 text-sm text-left w-full transition-colors ${isSelected ? "bg-blue-primary250 text-white" : "text-secondary-grey400 hover:bg-gray-50"}`}
										>
											<div className="p-[2px]">
												<Icon className="h-6 w-6" style={{ fill: "#BFD6FF", color: isSelected ? "#FFFFFF" : "#9CA3AF" }} />
											</div>
											<span className="flex-1">
												<span className={`font-medium mr-1 ${isSelected ? "text-white" : "text-gray-900"}`}>{label}</span>
												<span className={`${isSelected ? "text-white" : "text-secondary-grey400"}`}>({time})</span>
											</span>
										</button>
										{idx < timeSlots.length - 1 && <div className="h-px bg-gray-100 mx-4" />}
									</li>
								);
							})}
						</ul>
					</div>
				) : (
					<div
						className="fixed z-[99999] bg-white rounded-lg shadow-xl border border-gray-100 py-1 flex flex-col min-w-[200px] animate-in fade-in duration-100"
						style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
					>
						{activeActionMenuToken === 'queue_actions_dropdown' ? (
							<>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><RotateCcw className="h-4 w-4" /> Refresh Queue</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><CalendarMinus className="h-4 w-4" /> Set Doctor Out of Office</button>
								<div className="my-1 border-t border-gray-100"></div>
								<button onClick={() => { setShowTerminateModal(true); setActiveActionMenuToken(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"><CalendarX className="h-4 w-4" /> Terminate Queue</button>
							</>
						) : activeActionMenuToken === 'active_patient_card' ? (
							<>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><User className="h-4 w-4" /> View Profile</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><Calendar className="h-4 w-4" /> Reschedule</button>
								<button onClick={() => { setSessionStatus('admitted'); setActiveActionMenuToken(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><BedDouble className="h-4 w-4" /> Mark as Admitted</button>
								<button onClick={() => { setSessionStatus('completed'); setActiveActionMenuToken(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><CheckCheck className="h-4 w-4" /> End Visit</button>
							</>
						) : activeFilter === 'No show' ? (
							<>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><User className="h-4 w-4" /> View Profile</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><Bell className="h-4 w-4" /> Send Reminder</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><Calendar className="h-4 w-4" /> Reschedule</button>
								<div className="my-1 border-t border-gray-100"></div>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"><CalendarX className="h-4 w-4" /> Cancel Appointment</button>
							</>
						) : activeFilter === 'Engaged' ? (
							<>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><CalendarPlus className="h-4 w-4" /> Schedule Follow-up</button>
								<button onClick={() => { setSessionStatus('admitted'); setActiveActionMenuToken(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><BedDouble className="h-4 w-4" /> Mark as Admitted</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><User className="h-4 w-4" /> View Profile</button>
							</>
						) : (
							<>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><User className="h-4 w-4" /> View Profile</button>
								<button onClick={() => { setSessionStatus('admitted'); setActiveActionMenuToken(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><BedDouble className="h-4 w-4" /> Mark as Admitted</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"><CalendarPlus className="h-4 w-4" /> Schedule Follow-up</button>
								<div className="my-1 border-t border-gray-100"></div>
								<button onClick={handleMarkNoShow} disabled={isMarkingNoShow} className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full disabled:opacity-50">
									{isMarkingNoShow ? <UniversalLoader size={16} /> : <UserX className="h-4 w-4" />}
									{isMarkingNoShow ? "Marking..." : "Mark as No-Show"}
								</button>
								<button className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"><RotateCcw className="h-4 w-4" /> Revoke Check-In</button>
							</>
						)}
					</div>
				),
				document.body
			)}
		</div>
	);
}
