import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
// Front Desk Queue: full API-integrated version copied from original before doctor static simplification
import { ChevronDown, X, RotateCcw, CalendarMinus, CalendarX, User, BedDouble, CheckCheck, Bell, CalendarPlus, UserX, Calendar, Clock, ArrowRight, Play, PauseCircle } from 'lucide-react';
import { Morning, Afternoon, Evening, Night } from '../../../components/Icons/SessionIcons';
import { buildISTRangeLabel } from '../../../lib/timeUtils';
import QueueDatePicker from '../../../components/QueueDatePicker';
import AvatarCircle from '../../../components/AvatarCircle';
import Button from '../../../components/Button';
import { appointement } from '../../../../public/index.js';
import SampleTable from '../../../pages/SampleTable';
import PauseQueueModal from '../../../components/PauseQueueModal';
import TerminateQueueModal from '../../../components/TerminateQueueModal';
import SessionTimer from '../../../components/SessionTimer';
import Toggle from '../../../components/FormItems/Toggle';
import BookAppointmentDrawer from '../../../components/Appointment/BookAppointmentDrawer';
import useAuthStore from '../../../store/useAuthStore';
import useToastStore from '../../../store/useToastStore';
import UniversalLoader from '../../../components/UniversalLoader';
import useFrontDeskAuthStore from '../../../store/useFrontDeskAuthStore';
import axiosInstance from '../../../lib/axios';
import { format } from 'date-fns'; // Assuming date-fns is available, or use native styling if not.
// Actually, I'll use native Date for now to avoid dependency assumption if not sure, but project likely has it.
// Checking imports... date-fns is commonly used. Let's stick to native strictly if unsure, or simple helpers.
// The user has QueueDatePicker which likely passes a Date object.

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

const formatSlotTime = (isoString) => {
	if (!isoString) return '';
	const date = new Date(isoString);
	return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};


const formatTime = (seconds) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const more = '/superAdmin/Doctors/Threedots.svg'
const search = '/superAdmin/Doctors/SearchIcon.svg';
const pause = '/fd/Pause.svg';
const checkRound = '/fd/Check Round.svg';
const verified = '/verified-tick.svg'
const stopwatch = '/fd/Stopwatch.svg'
const verifiedYellow = '/fd/verified_yellow.svg'
const toggle_open = '/fd/toggle_open.svg'
const active = '/fd/active.svg'
const appt = '/fd/appt.svg'
const CalendarMinimalistic = '/fd/Calendar Minimalistic.svg'
const ClockCircle = '/fd/Clock Circle.svg'

// Removed DUMMY_REQUESTS, DUMMY_ACTIVE_PATIENT, DUMMY_PATIENTS, etc.


const filters = ['In Waiting', 'Engaged', 'Checked-In', 'No show', 'Admitted'];



export default function FDQueue() {
	const { user } = useFrontDeskAuthStore();
	const { addToast } = useToastStore();
	// Clinic and Doctor IDs derived from user profile
	const clinicId = user?.clinicId;
	const doctorId = user?.doctorId;
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 }); // Fix: Define dropdownPosition

	const [activeFilter, setActiveFilter] = useState('In Waiting');
	const [slotOpen, setSlotOpen] = useState(false);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [checkedInTokens, setCheckedInTokens] = useState({});
	const [sessionStarted, setSessionStarted] = useState(false);
	const [queuePaused, setQueuePaused] = useState(false);
	const [isStartingSession, setIsStartingSession] = useState(false);
	const [isEndingSession, setIsEndingSession] = useState(false);
	const [isResumingSlot, setIsResumingSlot] = useState(false);
	const [isTerminatingQueue, setIsTerminatingQueue] = useState(false);
	const [startingToken, setStartingToken] = useState(null);
	const [pauseEndsAt, setPauseEndsAt] = useState(null); // ms timestamp
	const [pauseRemaining, setPauseRemaining] = useState(0); // seconds
	const [showPauseModal, setShowPauseModal] = useState(false);
	const [showTerminateModal, setShowTerminateModal] = useState(false);
	const [pauseMinutes, setPauseMinutes] = useState(null); // in minutes
	const [pauseSubmitting, setPauseSubmitting] = useState(false);
	const [pauseError, setPauseError] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);
	const [sessionStatus, setSessionStatus] = useState('idle'); // 'idle' | 'ongoing' | 'completed'
	const [removingToken, setRemovingToken] = useState(null);
	const [incomingToken, setIncomingToken] = useState(null);
	const [backendCurrentToken, setBackendCurrentToken] = useState(null);
	const [polledActivePatient, setPolledActivePatient] = useState(null);
	const [queueData, setQueueData] = useState([]);
	const [appointmentRequests, setAppointmentRequests] = useState([]);
	const [apptLoading, setApptLoading] = useState(false);
	const [apptError, setApptError] = useState('');
	const [approvingId, setApprovingId] = useState(null);
	const [rejectingId, setRejectingId] = useState(null);
	const [checkingInId, setCheckingInId] = useState(null);
	const [timeSlots, setTimeSlots] = useState([]);
	const [slotValue, setSlotValue] = useState('');
	const [selectedSlotId, setSelectedSlotId] = useState('');
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

	const pauseTickerRef = useRef(null);
	const autoResumeTimerRef = useRef(null);

	const isToggleOn = sessionStarted && !queuePaused;

	// Helper: Calculate Age
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

	const fetchPendingAppointments = async () => {
		if (!clinicId) return;
		try {
			const payload = {
				clinicId: clinicId
			};
			const res = await axiosInstance.post('/appointments/pending-appointments-clinic', payload);
			if (res.data?.success) {
				const data = res.data.data || [];
				const mapped = data.map(item => {
					const p = item.patientDetails || {};
					const s = item.schedule || {};
					return {
						id: item.id,
						name: `${p.firstName} ${p.lastName}`.trim(),
						gender: p.gender ? (p.gender === 'MALE' ? 'M' : p.gender === 'FEMALE' ? 'F' : 'O') : '',
						dob: p.dob ? new Date(p.dob).toLocaleDateString() : '',
						age: calculateAge(p.dob),
						date: s.date ? new Date(s.date).toLocaleDateString() : '',
						time: s.startTime && s.endTime ? `${formatSlotTime(s.startTime.includes("1970") ? s.startTime : s.startTime)} - ${formatSlotTime(s.endTime.includes("1970") ? s.endTime : s.endTime)}` : '',
						raw: item
					};
				});
				setAppointmentRequests(mapped);
			}
		} catch (error) {
			console.error("Failed to fetch pending appointments", error);
		}
	};

	const fetchSlots = async () => {
		if (!doctorId || !clinicId) return;
		try {
			// Fix: Use local date string instead of UTC
			const year = currentDate.getFullYear();
			const month = String(currentDate.getMonth() + 1).padStart(2, '0');
			const day = String(currentDate.getDate()).padStart(2, '0');
			const formattedDate = `${year}-${month}-${day}`;
			const payload = {
				doctorId: doctorId,
				clinicId: clinicId,
				date: formattedDate
			};

			const res = await axiosInstance.post('/slots/patient/find-slots', payload);
			if (res.data?.success) {
				const apiSlots = res.data.data || [];
				// Sort by startTime
				apiSlots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

				const mappedSlots = apiSlots.map(slot => {
					const startRaw = new Date(slot.startTime);
					// The user sample is "1970-01-01T03:30:00.000Z". 3:30 UTC is 9:00 AM IST. 
					// Let's assume we format effectively.
					// If backend sends 1970 date with Z, we should probably display it in local time or specific timezone? 
					// Usually this implies time-of-day. Let's use `toLocaleTimeString`.

					// Actually, if it is just time of day, we should rely on the time values.

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

				// Auto-select first slot if none selected or list changed significantly? 
				// Stick to first slot rule for now as per previous logic.
				if (mappedSlots.length > 0) {
					// Check if current selection is still valid? 
					// For simplicity, always select first if switching dates usually implies new slots.
					// But user said "when landed on page call... and when changed the date re cll it".
					// Keep it simple: Select first available slot.
					setSlotValue(mappedSlots[0].key);
					setSelectedSlotId(mappedSlots[0].slotId);
				} else {
					setSlotValue('');
					setSelectedSlotId('');
				}
			}
		} catch (error) {
			console.error("Failed to fetch slots", error);
		}
	};

	const pollSlotStatus = async () => {
		if (!selectedSlotId) return;
		try {
			const res = await axiosInstance.get(`/eta/slot/${selectedSlotId}/status`);
			if (res.data?.success) {
				console.log("Full Poll Response:", res.data);
				const { slotStatus, currentToken, pauseDurationMinutes, pauseStartedAt, activePatientDetails } = res.data.message || {};
				console.log("Extracted activePatientDetails:", activePatientDetails);

				// Map backend status to frontend state
				if (slotStatus === 'CREATED') {
					setSessionStatus('idle');
					setSessionStarted(false);
					setQueuePaused(false);
				} else if (slotStatus === 'STARTED') {
					setSessionStatus('ongoing');
					setSessionStarted(true);
					setQueuePaused(false);
				} else if (slotStatus === 'PAUSED') {
					setSessionStatus('ongoing'); // Still ongoing, just paused
					setSessionStarted(true);
					setQueuePaused(true);

					if (pauseStartedAt && pauseDurationMinutes) {
						const start = new Date(pauseStartedAt).getTime();
						const ends = start + (pauseDurationMinutes * 60 * 1000);
						setPauseEndsAt(ends);
					}
				} else if (slotStatus === 'COMPLETED') {
					setSessionStatus('completed');
					setSessionStarted(false);
					setQueuePaused(false);
				}


				if (currentToken) {
					setBackendCurrentToken(currentToken);
				}

				if (activePatientDetails) {
					console.log("Setting polled patient:", activePatientDetails);
					const p = activePatientDetails;
					setPolledActivePatient({
						patientName: `${p.firstName} ${p.lastName}`.trim(),
						token: p.tokenNumber,
						gender: p.gender === 'MALE' ? 'M' : p.gender === 'FEMALE' ? 'F' : 'O',
						age: calculateAge(p.dob),
						reasonForVisit: p.reason,
						// Add other fields if needed by the card
						patientId: p.patientId,
						startedAt: p.startedAt // Sync session timer
					});
				} else {
					console.log("No active patient details in poll");
					setPolledActivePatient(null);
				}
			}
		} catch (error) {
			console.error("Failed to poll slot status", error);
		}
	};

	const mapAppointmentToRow = (appt) => {
		// Map API response to table column structure
		const p = appt.patientDetails || {};

		return {
			token: appt.tokenNo,
			patientName: p.name || `${p.firstName} ${p.lastName}`.trim(),
			gender: p.gender === 'MALE' ? 'M' : p.gender === 'FEMALE' ? 'F' : 'O',
			dob: p.dob ? new Date(p.dob).toLocaleDateString() : '',
			age: p.age ? `${p.age}Y` : calculateAge(p.dob),
			appointmentType: appt.appointmentType === 'NEW' ? 'New Consultation' : 'Follow-up Consultation', // map types
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
		try {
			const res = await axiosInstance.get(`/appointments/slot/${slotId}`);
			if (res.data?.success) {
				const data = res.data.data;
				const counts = data.counts || {};
				const appointments = data.appointments || {};

				// Normalize counts: if object with .total, use .total
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

				// Map all lists safely
				const ensureArray = (val) => Array.isArray(val) ? val : [];

				const noShowRaw = appointments.noShow || {};
				const withinGrace = ensureArray(noShowRaw.withinGracePeriod).map(item => ({ ...mapAppointmentToRow(item), isGrace: true }));
				const outsideGrace = ensureArray(noShowRaw.outsideGracePeriod).map(item => ({ ...mapAppointmentToRow(item), isGrace: false }));

				const mappedNoShow = [];
				if (withinGrace.length > 0) {
					mappedNoShow.push({ isHeader: true, label: "Within Grace Period" });
					mappedNoShow.push(...withinGrace);
				}
				if (outsideGrace.length > 0) {
					mappedNoShow.push({ isHeader: true, label: "Outside Grace Period" });
					mappedNoShow.push(...outsideGrace);
				}
				// If both empty but we are in No Show tab, maybe show nothing or just the empty arrays?
				// The user reference showed both headers even if empty sometimes? 
				// Actually MiddleQueue shows them if they exist. 
				// Let's stick to showing headers only if data exists for now, or as per user screenshot.

				// Re-reading user request: "noshow table nothing is being shown... implement it... like we did in doctor queue... within grace period heading"
				// Usually we show the headers always if the tab is active? 
				// Let's always add headers if we want to mimic the reference exactly.
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
		}
	};

	// Fetch FD profile on mount
	useEffect(() => {
		useFrontDeskAuthStore.getState().fetchMe();
	}, []);

	// Fetch data when IDs become available
	useEffect(() => {
		if (clinicId && doctorId) {
			fetchPendingAppointments();
			fetchSlots();
		}
	}, [clinicId, doctorId, currentDate]);

	// Dummy Stubs to prevent crash
	const pauseSlotEta = async () => ({});

	const handleStartPatientSession = async (token) => {
		if (!selectedSlotId || !token) return;
		setStartingToken(token);
		try {
			const res = await axiosInstance.post(`/eta/slot/${selectedSlotId}/session/${token}/start`);
			if (res.data?.success) {
				addToast({ title: "Patient Session Started", message: `Session started for Token ${token}`, type: "success" });
				setSessionStatus('ongoing');
				pollSlotStatus();
			}
		} catch (error) {
			console.error("Failed to start patient session", error);
			addToast({ title: "Error", message: "Failed to start patient session", type: "error" });
		} finally {
			setStartingToken(null);
		}
	};

	const handleToggleChange = async () => {
		if (isToggleOn) {
			// Turning OFF -> End Slot (Replaces Pause Modal per request)
			if (!selectedSlotId) return;
			setIsEndingSession(true);
			try {
				const res = await axiosInstance.post(`/eta/slot/${selectedSlotId}/end`);
				if (res.data?.success) {
					addToast({ title: "Session Ended", message: "Queue session ended successfully.", type: "success" });
					setSessionStarted(false);
					setQueuePaused(false);
					setPolledActivePatient(null);
					pollSlotStatus();
				}
			} catch (error) {
				console.error("Failed to end slot session", error);
				addToast({ title: "Error", message: "Failed to end slot session", type: "error" });
			} finally {
				setIsEndingSession(false);
			}
		} else {
			// Turning ON -> Start or Resume
			if (!selectedSlotId) return;
			setIsStartingSession(true);
			try {
				const res = await axiosInstance.post(`/eta/slot/${selectedSlotId}/start`);
				if (res.data?.success) {
					addToast({ title: "Session Started", message: "Queue session started.", type: "success" });
					setSessionStarted(true);
					setQueuePaused(false);

					// Auto-start first checked-in patient
					// We need to access the LATEST checkedIn list. 
					// appointmentsData might be stale if we depend on a previous render cycle, 
					// but usually it's up to date enough.
					// We ideally should fetch the list first or trust appointmentsData.
					// Let's trust appointmentsData for now.
					// Sort checkedIn by tokenNo just in case (though backend sorting preferred)
					const checkedInList = appointmentsData.checkedIn || [];
					// Assuming checkedInList items have tokenNo.
					// Wait, appointmentsData structure needs verification. 
					// Previously: appointmentsData = { checkedIn: [], ... }
					// If list is valid and has items:
					if (checkedInList.length > 0) {
						// Find "uppermost" -> usually first index.
						const firstPatient = checkedInList[0];
						if (firstPatient?.token) {
							// Call start session for this patient
							await handleStartPatientSession(firstPatient.token);
						}
					}

					pollSlotStatus();
				}
			} catch (error) {
				console.error("Failed to start session", error);
				addToast({ title: "Error", message: "Failed to start session", type: "error" });
			} finally {
				setIsStartingSession(false);
			}
		}
	};

	const handleResumeQueue = async () => {
		if (!selectedSlotId) return;
		setIsResumingSlot(true);
		try {
			const res = await axiosInstance.post(`/eta/slot/${selectedSlotId}/resume`);
			if (res.data?.success) {
				addToast({ title: "Queue Resumed", message: "Queue session resumed successfully.", type: "success" });
				setQueuePaused(false);
				pollSlotStatus();
			}
		} catch (error) {
			console.error("Failed to resume slot", error);
			addToast({ title: "Error", message: "Failed to resume queue", type: "error" });
		} finally {
			setIsResumingSlot(false);
		}
	};
	// Paused state UI: countdown to auto-resume
	// Current token reported by backend status, used to focus the engaged patient
	// Holds list currently shown in table (derived from active filter)
	// Replaced Dummy Time Slots with State
	// Removed redundant fetchSlots effect as it's now handled by the ID-dependent effect

	// Auto-select first slot logic removed/merged into fetch
	// useEffect(() => {
	// 	if (!slotValue) {
	// 		setSlotValue('morning');
	// 		setSelectedSlotId('dummy-slot-1');
	// 	}
	// }, []);

	// Appointments State
	// Polling and Periodic Refresh Effect
	useEffect(() => {
		if (!selectedSlotId || !doctorId || !clinicId) return;

		pollSlotStatus();
		fetchPendingAppointments();
		fetchAppointments(selectedSlotId);

		const statusInterval = setInterval(pollSlotStatus, 60000); // Poll status every 1 minute
		const pendingInterval = setInterval(fetchPendingAppointments, 60000); // Refresh pending every 1 minute
		const appointmentInterval = setInterval(() => fetchAppointments(selectedSlotId), 60000); // Refresh appointments every 1 minute

		return () => {
			clearInterval(statusInterval);
			clearInterval(pendingInterval);
			clearInterval(appointmentInterval);
		};
	}, [selectedSlotId, doctorId, clinicId, currentDate]);

	useEffect(() => {
		if (selectedSlotId) {
			fetchAppointments(selectedSlotId);
		} else {
			// Clear if no slot
			setAppointmentCounts({ checkedIn: 0, inWaiting: 0, engaged: 0, noShow: 0, admitted: 0, all: 0 });
			setAppointmentsData({ checkedIn: [], inWaiting: [], engaged: [], noShow: [], admitted: [], all: [] });
		}
	}, [selectedSlotId]);


	// Map API Data to Queue Data based on activeFilter
	useEffect(() => {
		// Map filter names to data keys
		// filters = ['In Waiting', 'Engaged', 'Checked-In', 'No show', 'Admitted']
		if (activeFilter === 'Engaged') setQueueData(appointmentsData.engaged);
		else if (activeFilter === 'Checked-In') setQueueData(appointmentsData.checkedIn);
		else if (activeFilter === 'No show') setQueueData(appointmentsData.noShow);
		else if (activeFilter === 'Admitted') setQueueData(appointmentsData.admitted);
		else setQueueData(appointmentsData.inWaiting);
	}, [activeFilter, appointmentsData]);


	// API Counts
	const getFilterCount = f => {
		let val = 0;
		if (f === 'In Waiting') val = appointmentCounts.inWaiting;
		else if (f === 'Engaged') val = appointmentCounts.engaged;
		else if (f === 'No show') val = appointmentCounts.noShow;
		else if (f === 'Checking In' || f === 'Checked-In') val = appointmentCounts.checkedIn;
		else if (f === 'Admitted') val = appointmentCounts.admitted;

		if (typeof val === 'number') return val;
		if (val && typeof val === 'object' && val.total !== undefined) return val.total;
		return 0;
	};
	// Updated Active Patient to use Real Data
	// Updated Active Patient to use Real Data from Polling
	const activePatient = useMemo(() => {
		// Priority 1: Polled data from slot status is the ONLY source of truth for the Active Card
		// If polling says null (no active patient), we show nothing, even if the 'engaged' list has items.
		return polledActivePatient;
	}, [polledActivePatient]);


	// Simplified Dummy Logic: Complete Patient
	// End Session for Patient
	const handleEndPatientSession = async () => {
		const active = activePatient;
		if (!active || !selectedSlotId) return;

		setRemovingToken(active.token);
		try {
			const res = await axiosInstance.post(`/eta/slot/${selectedSlotId}/session/${active.token}/end`);
			if (res.data?.success) {
				addToast({ title: "Session Ended", message: "Patient session ended successfully.", type: "success" });
				setSessionStatus('ongoing'); // Keep session ongoing for queue
				// Refresh status
				pollSlotStatus();
				fetchAppointments(selectedSlotId);
			}
		} catch (error) {
			console.error("Failed to end patient session", error);
			addToast({ title: "Error", message: "Failed to end patient session", type: "error" });
		} finally {
			setRemovingToken(null);
		}
	};

	// Dummy Actions for Table
	const [activeActionMenuToken, setActiveActionMenuToken] = useState(null);
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
		} finally {
			setIsMarkingNoShow(false);
		}
	};

	const handleCheckIn = async (id) => {
		if (!id) return;
		setCheckingInId(id);
		try {
			const res = await axiosInstance.put(`/appointments/check-in/${id}`);
			if (res.data?.success) {
				fetchAppointments(selectedSlotId);

				addToast({
					title: "Checked In",
					message: "Patient checked in successfully.",
					type: "success",
					duration: 3000
				});
			}
		} catch (error) {
			console.error("Failed to check-in", error);
			addToast({ title: "Error", message: "Failed to check-in", type: "error" });
		} finally {
			setCheckingInId(null);
		}
	};

	const [isCancellingRequest, setIsCancellingRequest] = useState(false);
	const handleCancelRequest = async () => {
		const id = activeActionMenuToken?.toString().replace('req_', '');
		if (!id) return;

		setIsCancellingRequest(true);
		try {
			// specific API for rejection
			const res = await axiosInstance.put(`/appointments/reject/${id}`);
			if (res.data?.success) {
				fetchPendingAppointments();
				setActiveActionMenuToken(null);
				addToast({
					title: "Request Rejected",
					message: "The appointment request has been rejected.",
					type: "success",
					duration: 3000
				});
			}
		} catch (error) {
			console.error("Failed to reject request", error);
			addToast({ title: "Error", message: "Failed to reject request", type: "error" });
		} finally {
			setIsCancellingRequest(false);
		}
	};

	const handleApproveRequest = async (id) => {
		if (!id) return;
		setApprovingId(id);
		try {
			const res = await axiosInstance.put(`/appointments/approve/${id}`);
			if (res.data?.success) {
				fetchPendingAppointments();
				// Also refresh main list as approved appt moves there
				fetchAppointments(selectedSlotId);
				addToast({
					title: "Request Approved",
					message: "Appointment request approved successfully.",
					type: "success",
					duration: 3000
				});
			}
		} catch (error) {
			console.error("Failed to approve request", error);
			addToast({ title: "Error", message: "Failed to approve request", type: "error" });
		} finally {
			setApprovingId(null);
		}
	};

	const [showWalkIn, setShowWalkIn] = useState(false);
	// New: On check-in, call API and refresh; do not open pre-screening


	// While paused, tick remaining time every second
	useEffect(() => {
		if (!queuePaused || !pauseEndsAt) return;
		const tick = () => {
			const rem = Math.max(0, Math.floor((pauseEndsAt - Date.now()) / 1000));
			setPauseRemaining(rem);
			if (rem <= 0) {
				handleResumeQueue(); // Auto-resume API call
				if (pauseTickerRef.current) { clearInterval(pauseTickerRef.current); pauseTickerRef.current = null; }
			}
		};
		tick();
		pauseTickerRef.current = setInterval(tick, 1000);
		return () => { if (pauseTickerRef.current) { clearInterval(pauseTickerRef.current); pauseTickerRef.current = null; } };
	}, [queuePaused, pauseEndsAt, handleResumeQueue]);


	return (
		<div className='flex h-full w-full bg-gray-50 overflow-hidden'>
			{/* Middle Column: Queue Content (Table + Header) */}
			<div className="flex-1 flex flex-col min-w-0 bg-secondary-grey50 border-r border-gray-200">
				<div className='sticky top-0 z-10 bg-white border-b-[0.5px] border-secondary-grey100 px-4 py-2 shrink-0'>
					<div className='flex items-center justify-between'>
						{/* Slot Dropdown */}
						<div className='relative '>
							<button
								type='button'
								onMouseDown={(e) => handleActionMenuClick(e, 'slot_dropdown')}
								onClick={(e) => e.stopPropagation()}
								className='flex w-[300px] items-center bg-white gap-1 text-[16px] text-secondary-grey400 hover:bg-gray-50 transition-all'
							>
								<span className='mr-1'>{timeSlots.find(t => t.key === slotValue)?.label || 'Morning'} ({timeSlots.find(t => t.key === slotValue)?.time || '10:00am-12:00pm'})</span>
								<ChevronDown className='pl-1 h-4 border-l-[0.5px] border-secondary-grey100/50 text-gray-500' />
							</button>
						</div>
						{/* Date Picker */}
						<div className='flex-1 flex justify-center'>
							<QueueDatePicker date={currentDate} onChange={setCurrentDate} />
						</div>
						{/* Walk-in */}
						<div className='flex items-center gap-[10px]'>
							{(function () {
								const activeSlot = timeSlots.find(s => s.key === slotValue);
								const availableTokens = activeSlot?.raw?.availableTokens || 0;
								const maxTokens = activeSlot?.raw?.maxTokens || 0;
								return (
									<div className="flex items-center gap-1 text-sm text-secondary-grey300">
										<span>Tokens Available</span>
										<span className="bg-success-100 px-2 text-success-300 rounded-sm h-[22px] text-sm  border border-transparent hover:border-success-300/50 transition-colors cursor-pointer">
											{availableTokens} Out of {maxTokens}
										</span>
									</div>
								);
							})()}

							<div className='bg-secondary-grey100/50 h-5 w-[1px]' ></div>


							<div className='flex items-center gap-2'>
								<Toggle
									checked={isToggleOn}
									onChange={(!isStartingSession && !isEndingSession) ? handleToggleChange : undefined}
									className={(isStartingSession || isEndingSession) ? "opacity-50 cursor-not-allowed" : ""}
								/>
								<span className={`text-sm font-medium ${isToggleOn ? 'text-gray-700' : 'text-secondary-grey300'}`}>
									{isStartingSession ? (
										<div className="flex items-center gap-1">
											<UniversalLoader size={14} className="text-secondary-grey300" />
											<span className="text-secondary-grey300">Starting...</span>
										</div>
									) : isEndingSession ? (
										<div className="flex items-center gap-1">
											<UniversalLoader size={14} className="text-secondary-grey300" />
											<span className="text-secondary-grey300">Ending...</span>
										</div>
									) : (
										"Start Session"
									)}
								</span>
							</div>

							<div className='bg-secondary-grey100/50 h-5 w-[1px]' ></div>

							<button
								onMouseDown={(e) => handleActionMenuClick(e, 'queue_actions_dropdown')}
								onClick={(e) => e.stopPropagation()}
								className='hover:bg-secondary-grey50 rounded-sm'
							>
								<img src={more} alt="" />
							</button>
						</div>
					</div>
				</div>

				{/* Queue Content */}
				<div className='px-0 pt-0 pb-2 flex-1 flex flex-col overflow-hidden'>

					{sessionStarted && (
						<div className={`w-full ${queuePaused ? 'bg-warning-50 text-warning-400' : 'bg-[#27CA40] text-white'} h-[40px] px-4 flex items-center justify-between relative z-20`}>
							{/* Centered Token Number */}
							<div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 ${queuePaused ? 'text-secondary-grey200' : 'text-white'}`}>
								<span className=' text-[20px] mr-3'>Current Token Number</span>
								<span className={`w-4 h-4 rounded-full animate-colorBlink ${queuePaused ? 'bg-warning-400' : 'bg-white '} transition-all duration-1000`}
									style={!queuePaused ? {
										'--blink-on': '#22c55e',
										'--blink-off': '#ffffff',
									} : {
										'--blink-on': '#EC7600',
										'--blink-off': '#ffffff',
									}}></span>
								<span className={`font-bold text-[20px] ${queuePaused ? 'text-warning-400' : 'text-white'}`}>{backendCurrentToken || activePatient?.token || '-'}</span>
								{queuePaused && (
									<div className='flex items-center ml-2 border border-warning-400 py-[2px] rounded px-[6px] bg-white gap-1'>
										<img src={stopwatch} alt="" className='w-[14px] h-[14px]' />
										<span className="text-[14px] text-warning-400 ">
											Paused ({formatTime(pauseRemaining)} Mins)
										</span>
									</div>
								)}
							</div>
							{/* Right Actions */}
							<div className="ml-auto">
								{!queuePaused ? (
									<button
										onClick={() => { setPauseMinutes(null); setShowPauseModal(true); }}
										className='bg-white text-[#ef4444] h-[24px] py-1 px-[6px] rounded text-[12px] font-medium border border-error-200/50 flex items-center gap-2 hover:bg-error-400 hover:text-white transition-colors '
									>
										<img src={pause} alt="" className='' /> Pause Queue
									</button>
								) : (
									<button
										onClick={handleResumeQueue}
										disabled={isResumingSlot}
										className='bg-blue-primary250 text-white h-[24px] py-1 px-[6px] rounded text-[12px] font-medium flex items-center gap-1.5 hover:bg-blue-primary300 transition-colors disabled:opacity-50'
									>
										{isResumingSlot ? (
											<UniversalLoader size={12} className="text-white" />
										) : (
											<RotateCcw className='w-[14px] h-[14px] -scale-y-100 rotate-180' />
										)}
										{isResumingSlot ? 'Resuming...' : 'Restart Queue'}
									</button>
								)}
							</div>
						</div>
					)}

					<div className='p-2 flex flex-col flex-1 min-h-0'>
						{/* Overview section removed for Front Desk queue per request */}
						{sessionStarted && activePatient && (
							<>
								<span className="text-[20px] font-medium text-secondary-grey400 mb-2">Ongoing Consulation</span>
								<div
									className={`
                              flex items-center justify-between
                              rounded-xl
                              px-4 py-3
                              mb-4
                              bg-white
                              ${sessionStatus === 'completed'
											? 'border border-success-200 bg-[linear-gradient(90deg,rgba(39,202,64,0.08)_0%,rgba(39,202,64,0)_25%,rgba(39,202,64,0)_75%,rgba(39,202,64,0.08)_100%)]'
											: sessionStatus === 'admitted'
												? 'border border-[#D4AF37] bg-[linear-gradient(90deg,rgba(212,175,55,0.15)_0%,rgba(212,175,55,0.05)_25%,rgba(212,175,55,0.05)_75%,rgba(212,175,55,0.15)_100%)]'
												: 'border border-blue-primary250 bg-[linear-gradient(90deg,rgba(35,114,236,0.08)_0%,rgba(35,114,236,0)_25%,rgba(35,114,236,0)_75%,rgba(35,114,236,0.08)_100%)]'
										}
                            `}
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
												onClick={() => handleStartPatientSession(activePatient.token)}
												disabled={startingToken === activePatient.token}
												className=" text-white flex items-center gap-2 px-4 py-2 font-medium"
											>
												{startingToken === activePatient.token ? (
													<UniversalLoader size={12} className="text-white" />
												) : (
													<Play className="w-3.5 h-3.5 " />
												)}
												{startingToken === activePatient.token ? 'Starting...' : 'Start Session'}
											</Button>
										)}
										{sessionStatus === 'ongoing' && (
											<div className="flex items-center gap-3">
												<SessionTimer startTime={activePatient.startedAt} paused={queuePaused} />
												<button
													onClick={handleEndPatientSession}
													disabled={removingToken === activePatient.token}
													className="flex items-center gap-2 bg-white border border-secondary-grey200/50 px-4 py-2 rounded-md text-sm font-medium text-secondary-grey400 hover:bg-gray-50 transition-colors"
												>
													{removingToken === activePatient.token ? (
														<UniversalLoader size={16} className="text-secondary-grey400" />
													) : (
														<img src={checkRound} alt="" />
													)}
													<span>{removingToken === activePatient.token ? 'Ending...' : 'End Session'}</span>
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
							</>
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
								<button
									onClick={() => setShowWalkIn(true)}
									className='inline-flex items-center gap-2 h-[32px] min-w-[32px] p-2 rounded-sm border-[1px] text-sm font-medium border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors'
								>
									Walk-In Appointment
								</button>
							</div>
						</div>

						{/* Table Section (No longer wrapped with sidebar here) */}
						{/* Table and Sidebar Container */}
						<div className='flex-1 min-h-0 flex flex-row gap-4 relative'>
							{/* Table Section */}
							<div className='flex-1 min-h-0 bg-white rounded-lg border border-gray-200 relative'>
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
											{ key: "reason", header: "Reason For Visit", icon: true, width: 200 },
											{
												key: "actions",
												header: "Actions",
												icon: false,
												sticky: "right",
												width: 190,
												render: (row) => {
													const isCheckedIn = checkedInTokens[row.token];
													return (
														<div className="flex items-center jusitfy-between">
															{!isCheckedIn ? (
																row.isGrace ? (
																	<button
																		onClick={() => handleCheckIn(row.id)}
																		disabled={checkingInId === row.id}
																		className="w-full px-3 py-1 border border-gray-300 rounded text-sm text-secondary-grey400 hover:bg-gray-50 bg-white flex justify-center items-center h-[30px]"
																	>
																		{checkingInId === row.id ? <UniversalLoader size={16} className="text-gray-500" /> : 'Check-In'}
																	</button>
																) : (
																	<button
																		onClick={() => setCheckedInTokens(prev => ({ ...prev, [row.token]: true }))}
																		className='w-full px-3 py-1 border border-gray-300 rounded text-sm text-secondary-grey400 hover:bg-gray-50 bg-white'
																	>
																		Reschedule
																	</button>
																)) : (
																<button className='w-full inline-flex justify-center items-center gap-2 h-[32px] min-w-[32px] p-2 rounded-sm border-[1px] text-sm font-medium border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors'>
																	Add Pre-screening
																</button>
															)}
															<button
																onClick={(e) => handleActionMenuClick(e, row.token)}
																className="text-gray-400 ml-2 hover:text-gray-600 rounded-full  transition-colors"
															>
																<img src={more} alt="" />
															</button>
														</div>
													);
												}
											}
										] : activeFilter === 'Admitted' ? [

											{
												key: "patient",
												header: "Patient",
												icon: true,
												width: 205,
												render: (row) => (
													<div className="flex items-center gap-2 ">
														<AvatarCircle name={row.patientName} size="md" className="shrink-0 bg-blue-50 text-blue-600" />
														<div>
															<div className="text-secondary-grey400 font-medium text-sm">{row.patientName}</div>
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
															Discharge
														</button>
														<button
															onClick={(e) => handleActionMenuClick(e, row.token)}
															className="text-gray-400 ml-2 hover:text-gray-600 rounded-full  transition-colors"
														>
															<img src={more} alt="" className='w-8 h-8' />
														</button>
													</div>
												)
											}
										] : [
											{
												key: "token",
												header: <div className="w-full text-center text-secondary-grey400 font-medium">Token</div>,
												icon: false,
												width: 80,
												render: (row) => (
													<span className="text-blue-primary250 items-center flex justify-center font-medium text-[20px] pl-2">{row.token}</span>
												)
											},
											{
												key: "patient",
												header: "Patient",
												icon: true,
												width: 280,
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
											{ key: "appointmentType", header: "Appt. Type", icon: true, width: 150 },
											{ key: "expectedTime", header: "Expt. Time", icon: true, width: 120 },
											{ key: "bookingType", header: "Booking Type", icon: true, width: 130 },
											{ key: "reason", header: "Reason For Visit", icon: true, width: 200 },
											{
												key: "actions",
												header: "Actions",
												icon: false,
												sticky: "right",
												width: 190,
												render: (row) => {
													const isCheckedIn = checkedInTokens[row.token];
													return (
														<div className="flex items-center justify-between">
															{!isCheckedIn ? (
																<button
																	onClick={() => handleCheckIn(row.id)}
																	disabled={checkingInId === row.id}
																	className="w-full px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 bg-white flex justify-center items-center h-[30px]"
																>
																	{checkingInId === row.id ? <UniversalLoader size={16} className="text-gray-500" /> : 'Check-In'}
																</button>
															) : (
																// <button className='w-full inline-flex justify-center items-center gap-2 h-[32px] min-w-[32px] p-2 rounded-sm border-[1px] text-sm font-medium border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors'>
																// 	Add Pre-screening
																// </button>
																<span className="text-success-500 font-medium text-sm flex justify-center w-full">Checked In</span>
															)}
															<button
																onClick={(e) => handleActionMenuClick(e, row.token)}
																className={`text-gray-400 ml-2 hover:text-gray-600 rounded-full p-1 transition-colors ${activeActionMenuToken === row.token ? 'bg-gray-100 text-gray-600' : ''}`}
															>
																<img src={more} alt="" className='w-8 h-8' />
															</button>
														</div>
													);
												}
											}
										]}
										// Conditional rendering for empty state
										data={queueData}
										hideSeparators={false}
										stickyLeftWidth={280}
										stickyRightWidth={210}
									/>
									{queueData.length === 0 && (
										<div className="absolute inset-0 top-[40px] bg-white flex flex-col items-center justify-center text-secondary-grey400 z-10">
											<div className="bg-gray-50 p-4 rounded-full mb-3">
												<UserX className="h-8 w-8 text-gray-300" />
											</div>
											<p className="text-lg font-medium">No Patients Found</p>
											<p className="text-sm text-gray-400">There are no patients in this list.</p>
										</div>
									)}
								</div>
							</div>

							{/* Sidebar Section */}
							<div className='shrink-0 w-[400px] h-full flex flex-col bg-white rounded-lg border border-gray-200'>
								<div className='h-10 flex items-center px-4 border-b border-gray-200'>
									<div className='h-full flex items-center gap-2 border-b-2 border-blue-600 text-blue-600 px-1'>
										<img src={appt} alt='Appointment' className='w-4 h-4' />
										<h2 className='text-[14px] font-medium'>Appointment Request</h2>
									</div>
								</div>
								<div className='flex-1 overflow-y-auto  flex flex-col gap-3 no-scrollbar'>
									{/* DUMMY_REQUESTS replaced with state or empty array for now */}
									{appointmentRequests.map((request, index) => (
										<div key={request.id || index} className="border-b border-gray-100 flex flex-col gap-3 last:border-0 p-3 bg-white  transition-colors">

											{/* Patient Header */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<AvatarCircle name={request.name} size="l" />
													<div className="flex flex-col">
														<div className="flex items-center gap-1">
															<span className="text-[16px] font-semibold text-secondary-grey400">{request.name}</span>
															<ArrowRight className="h-3 w-3 text-gray-400 -rotate-45" />
														</div>
														<div className="text-[12px] text-secondary-grey300">{request.gender} | {request.dob} ({request.age})</div>
													</div>
												</div>
												<button
													onClick={(e) => handleActionMenuClick(e, `req_${request.id}`)}
													className={`text-gray-400 hover:bg-secondary-grey50 rounded-full p-1 transition-colors ${activeActionMenuToken === `req_${request.id}` ? 'bg-secondary-grey50 text-gray-600' : ''}`}
												>
													<img src={more} alt="" className='w-4 h-4' />
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



											</div>



											{/* Buttons */}
											<div className="flex gap-3">
												<Button
													size='small'
													variant='primary'
													className='flex-1 h-9 text-sm font-medium'
													onClick={() => handleApproveRequest(request.id)}
													disabled={approvingId === request.id}
												>
													{approvingId === request.id ? (
														<div className="flex items-center justify-center gap-2">
															<UniversalLoader size={16} className="text-white" style={{ width: 'auto', height: 'auto' }} />
															<span>Accepting...</span>
														</div>
													) : 'Accept'}
												</Button>
												<button className='flex-1 h-9 text-sm font-medium border border-secondary-grey200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap px-1'>
													Ask to Reschedule
												</button>
											</div>
										</div>
									))}
								</div>

							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Pause Queue Modal */}

			<PauseQueueModal
				show={showPauseModal}
				onClose={() => {
					setShowPauseModal(false);
					setPauseMinutes(null);
				}}
				pauseMinutes={pauseMinutes}
				setPauseMinutes={setPauseMinutes}
				pauseSubmitting={pauseSubmitting}
				pauseError={pauseError}
				onConfirm={async () => {
					if (!selectedSlotId || !pauseMinutes) return;
					setPauseSubmitting(true);
					setPauseError('');
					try {
						const res = await axiosInstance.post(`/eta/slot/${selectedSlotId}/pause`, {
							durationMinutes: pauseMinutes.toString()
						});
						if (res.data?.success) {
							addToast({ title: "Queue Paused", message: `Queue paused for ${pauseMinutes} minutes.`, type: "success" });
							setQueuePaused(true);
							setShowPauseModal(false);

							const ends = Date.now() + (pauseMinutes || 0) * 60 * 1000;
							setPauseEndsAt(ends);

							pollSlotStatus();
						}
					} catch (err) {
						console.error("Failed to pause slot", err);
						setPauseError(err.response?.data?.message || 'Failed to pause');
						addToast({ title: "Error", message: "Failed to pause queue", type: "error" });
					} finally {
						setPauseSubmitting(false);
					}
				}}
			/>

			<TerminateQueueModal
				show={showTerminateModal}
				onClose={() => setShowTerminateModal(false)}
				isSubmitting={isTerminatingQueue}
				sessions={timeSlots.map(slot => ({
					id: slot.slotId,
					label: `${slot.label} (${slot.time})`
				}))}
				onConfirm={async (data) => {
					setIsTerminatingQueue(true);
					try {
						const res = await axiosInstance.post('/slots/queue/terminate', {
							slotIds: data.sessions,
							cancellationReason: data.reason
						});

						if (res.data?.success || res.status === 200) {
							addToast({
								title: "Queue Terminated",
								message: "Selected sessions have been terminated successfully.",
								type: "success"
							});
							setShowTerminateModal(false);
							pollSlotStatus();
							fetchPendingAppointments();
						}
					} catch (error) {
						console.error("Failed to terminate queue", error);
						addToast({
							title: "Error",
							message: error.response?.data?.message || "Failed to terminate queue",
							type: "error"
						});
					} finally {
						setIsTerminatingQueue(false);
					}
				}}
			/>


			{/* Dropdown Menu Portals */}
			{activeActionMenuToken === "slot_dropdown" &&
				createPortal(
					<div
						className="fixed z-[100] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden py-2 px-2"
						style={{
							top: dropdownPosition.top,
							left: dropdownPosition.left,
							width: 300,
						}}
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<ul>
							{timeSlots.map((slot, idx) => {
								const isSelected = slotValue === slot.key;
								const { Icon, label, time, key } = slot;
								return (
									<li key={key}>
										<button
											type="button"
											onClick={() => {
												setSlotValue(key);
												setSelectedSlotId(slot.slotId);
												setActiveActionMenuToken(null);
											}}
											className={`flex items-center gap-3 p-2 text-sm text-left w-full transition-colors ${isSelected
												? "bg-blue-primary250 text-white"
												: "text-secondary-grey400 hover:bg-gray-50"
												}`}
										>
											<div className="p-[2px]">
												<Icon
													className="h-6 w-6"
													style={{
														fill: "#BFD6FF", // blue-primary150
														color: isSelected ? "#FFFFFF" : "#9CA3AF", // white vs grey-400
													}}
												/>
											</div>

											<span className="flex-1">
												<span
													className={`font-medium mr-1 ${isSelected ? "text-white" : "text-gray-900"
														}`}
												>
													{label}
												</span>
												<span
													className={`${isSelected
														? "text-white"
														: "text-secondary-grey400"
														}`}
												>
													({time})
												</span>
											</span>
										</button>
										{idx < timeSlots.length - 1 && (
											<div className="h-px bg-gray-100 mx-4" />
										)}
									</li>
								);
							})}
						</ul>
					</div>,
					document.body
				)}

			{activeActionMenuToken && activeActionMenuToken !== 'slot_dropdown' && createPortal(
				<div
					className="fixed z-[99999] bg-white rounded-lg shadow-xl border border-gray-100 py-1 flex flex-col min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
					style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
					onClick={(e) => e.stopPropagation()}
				>
					{activeActionMenuToken === 'queue_actions_dropdown' ? (
						<>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<RotateCcw className="h-4 w-4" /> Refresh Queue
							</button>

							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<CalendarMinus className="h-4 w-4" /> Set Doctor Out of Office
							</button>
							<div className="my-1 border-t border-gray-100"></div>
							<button
								onClick={() => {
									setShowTerminateModal(true);
									setActiveActionMenuToken(null);
								}}
								className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"
							>
								<CalendarX className="h-4 w-4" /> Terminate Queue
							</button>
						</>
					) : activeActionMenuToken === 'active_patient_card' ? (
						<>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<User className="h-4 w-4" /> View Profile
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<Calendar className="h-4 w-4" /> Reschedule
							</button>
							<button
								onClick={() => {
									setSessionStatus('admitted');
									setActiveActionMenuToken(null);
								}}
								className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
							>
								<BedDouble className="h-4 w-4" /> Mark as Admitted
							</button>
							<button
								onClick={() => {
									setSessionStatus('completed');
									completeCurrentPatient();
									setActiveActionMenuToken(null);
								}}
								className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
							>
								<CheckCheck className="h-4 w-4" /> End Visit
							</button>
						</>
					) : activeFilter === 'No show' ? (
						<>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<User className="h-4 w-4" /> View Profile
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<Bell className="h-4 w-4" /> Send Reminder
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<Calendar className="h-4 w-4" /> Reschedule
							</button>
							<div className="my-1 border-t border-gray-100"></div>
							<button
								onClick={() => {
									if (activeActionMenuToken) {
										setCancelledTokens(prev => new Set(prev).add(activeActionMenuToken));
										setActiveActionMenuToken(null);
									}
								}}
								className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"
							>
								<CalendarX className="h-4 w-4" /> Cancel Appointment
							</button>
						</>
					) : activeFilter === 'Engaged' ? (
						<>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<CalendarPlus className="h-4 w-4" /> Schedule Follow-up
							</button>
							<button
								onClick={() => {
									setSessionStatus('admitted');
									setActiveActionMenuToken(null);
								}}
								className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
							>
								<BedDouble className="h-4 w-4" /> Mark as Admitted
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<User className="h-4 w-4" /> View Profile
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full">
								<RotateCcw className="h-4 w-4" /> Revoke Check-In
							</button>
						</>
					) : activeActionMenuToken?.toString().startsWith('req_') ? (
						<>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<User className="h-4 w-4" /> View Profile
							</button>
							<div className="my-1 border-t border-gray-100"></div>
							<button
								onClick={handleCancelRequest}
								disabled={isCancellingRequest}
								className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"
							>
								{isCancellingRequest ? (
									<div className="flex items-center gap-2">
										<UniversalLoader size={16} className="text-[#ef4444]" style={{ width: 'auto', height: 'auto' }} />
										<span>Rejecting...</span>
									</div>
								) : (
									<>
										<CalendarX className="h-4 w-4" /> Cancel Appointment
									</>
								)}
							</button>
						</>
					) : (
						<>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<User className="h-4 w-4" /> View Profile
							</button>
							<button
								onClick={() => {
									setActiveActionMenuToken(null);
								}}
								className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full"
							>
								<BedDouble className="h-4 w-4" /> Mark as Admitted
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-grey400 hover:bg-gray-50 text-left w-full">
								<CalendarPlus className="h-4 w-4" /> Schedule Follow-up
							</button>
							<div className="my-1 border-t border-gray-100"></div>
							<button
								onClick={handleMarkNoShow}
								disabled={isMarkingNoShow}
								className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full"
							>
								{isMarkingNoShow ? (
									<div className="flex items-center gap-2">
										<UniversalLoader size={16} className="text-[#ef4444]" style={{ width: 'auto', height: 'auto' }} />
										<span>Marking...</span>
									</div>
								) : (
									<>
										<UserX className="h-4 w-4" /> Mark as No-Show
									</>
								)}
							</button>
							<button className="flex items-center gap-2 px-4 py-2 text-sm text-[#ef4444] hover:bg-red-50 text-left w-full">
								<RotateCcw className="h-4 w-4" /> Revoke Check-In
							</button>
						</>
					)}
				</div>,
				document.body
			)
			}
			<BookAppointmentDrawer
				open={showWalkIn}
				onClose={() => setShowWalkIn(false)}
				doctorId={doctorId}
				clinicId={clinicId}
				hospitalId={undefined}
				onBookedRefresh={() => {
					fetchAppointments(selectedSlotId);
					fetchPendingAppointments();
				}}
			/>
		</div >
	);
}

