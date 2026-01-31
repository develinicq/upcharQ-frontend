import { useState, useEffect } from 'react';
import {
    approveAppointment,
    rejectAppointment,
    getPendingsAppointmentsForHospital
} from '../../../services/authService';
import useAuthStore from '../../../store/useAuthStore';
import useHospitalFrontDeskAuthStore from '../../../store/useHospitalFrontDeskAuthStore';
import { getDoctorMe } from '../../../services/authService';
import useToastStore from '../../../store/useToastStore';

export function useQueueLogic(selectedDoctorIdOverride) {
    const [appointmentRequests, setAppointmentRequests] = useState([]);
    const [apptLoading, setApptLoading] = useState(false);
    const [apptError, setApptError] = useState('');
    const [approvingId, setApprovingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    const { addToast } = useToastStore();
    const { doctorDetails, doctorLoading, fetchDoctorDetails } = useAuthStore();
    const { user: hfdUser, hospitalId: storeHospitalId } = useHospitalFrontDeskAuthStore();

    useEffect(() => {
        if (!doctorDetails && !doctorLoading) {
            fetchDoctorDetails?.(getDoctorMe);
        }
    }, [doctorDetails, doctorLoading, fetchDoctorDetails]);

    // Derive IDs - Priority to HFD user clinicId, then doctor details
    const clinicId = hfdUser?.clinicId || doctorDetails?.associatedWorkplaces?.clinic?.id || doctorDetails?.clinicId || doctorDetails?.primaryClinicId || null;
    const doctorId = selectedDoctorIdOverride || hfdUser?.doctorId || doctorDetails?.userId || doctorDetails?.id || null;
    const hospitalId = storeHospitalId || (Array.isArray(doctorDetails?.associatedWorkplaces?.hospitals) && doctorDetails?.associatedWorkplaces?.hospitals?.[0]?.id) || undefined;

    // Helpers
    const fmtDOB = dobIso => { if (!dobIso) return ''; try { const d = new Date(dobIso); const day = String(d.getDate()).padStart(2, '0'); const mo = String(d.getMonth() + 1).padStart(2, '0'); const yr = d.getFullYear(); return `${day}/${mo}/${yr}`; } catch { return ''; } };
    const calcAgeYears = dobIso => { if (!dobIso) return ''; try { const d = new Date(dobIso); const diff = Date.now() - d.getTime(); const ageDate = new Date(diff); return Math.abs(ageDate.getUTCFullYear() - 1970); } catch { return ''; } };
    const fmtApptDate = dateIso => { if (!dateIso) return ''; try { const d = new Date(dateIso); const day = String(d.getDate()).padStart(2, '0'); const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]; const yr = d.getFullYear(); return `${mo} ${day}, ${yr}`; } catch { return ''; } };
    const fmtTimeRangeIST = (startIso, endIso) => { if (!startIso || !endIso) return ''; try { const toIST = iso => { const d = new Date(iso); return d; }; const s = toIST(startIso); const e = toIST(endIso); const pad = n => String(n).padStart(2, '0'); const to12 = d => { let h = d.getHours(); const m = pad(d.getMinutes()); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12; return `${h}:${m} ${ampm}`; }; return `${to12(s)} - ${to12(e)}`; } catch { return ''; } };


    // Dummy Data for UI Development
    const DUMMY_REQUESTS = [
        {
            id: 'd1',
            name: "Alok Verma",
            gender: "M",
            age: "39Y",
            dob: "12/05/1985 (39Y)",
            date: "Mon, 12 June 2024",
            time: "Morning, 10:00 am - 12:30 pm",
            doctorName: "Dr. Arvind Mehta",
            doctorSpecialty: "General Physician",
            dateRaw: "2024-06-12", // For sorting if needed
            reason: '', // Assuming standard consultation if empty
            raw: { id: 'd1' }
        },
        {
            id: 'd2',
            name: "Bhavna Mehta",
            gender: "F",
            age: "44Y",
            dob: "03/15/1980 (44Y)",
            date: "Tuesday, 13 June 2024",
            time: "Afternoon, 1:00 pm - 3:30 pm",
            doctorName: "Dr. Arvind Mehta",
            doctorSpecialty: "General Physician",
            dateRaw: "2024-06-13",
            reason: '',
            raw: { id: 'd2' }
        },
        {
            id: 'd3',
            name: "Chirag Modi",
            gender: "M",
            age: "33Y",
            dob: "08/07/1990 (33Y)",
            // Missing date/time in screenshot for third card? Assuming similar structure or pending.
            // Screenshot only shows top of Chirag's card. Adding plausible data.
            date: "Wed, 14 June 2024",
            time: "Evening, 5:00 pm - 7:30 pm",
            doctorName: "Dr. Sneha Deshmukh",
            doctorSpecialty: "Pediatrician",
            dateRaw: "2024-06-14",
            reason: '',
            raw: { id: 'd3' }
        }
    ];

    const loadAppointments = async (clearPrevious = false) => {
        if (!hospitalId) return;
        if (clearPrevious) setAppointmentRequests([]);
        setApptLoading(true);
        setApptError('');
        try {
            const resp = await getPendingsAppointmentsForHospital({ hospitalId });
            if (resp.success && Array.isArray(resp.data)) {
                const mapped = resp.data.map(item => ({
                    id: item.id,
                    name: `${item.patientDetails?.firstName || ''} ${item.patientDetails?.lastName || ''}`.trim(),
                    gender: item.patientDetails?.gender === 'MALE' ? 'M' : item.patientDetails?.gender === 'FEMALE' ? 'F' : item.patientDetails?.gender,
                    age: `${calcAgeYears(item.patientDetails?.dob)}Y`,
                    dob: `${fmtDOB(item.patientDetails?.dob)} (${calcAgeYears(item.patientDetails?.dob)}Y)`,
                    date: fmtApptDate(item.schedule?.date),
                    time: fmtTimeRangeIST(item.schedule?.startTime, item.schedule?.endTime),
                    doctorName: `Dr. ${item.doctor?.firstName || ''} ${item.doctor?.lastName || ''}`.trim(),
                    doctorSpecialty: 'General Physician', // Fallback as not in API
                    dateRaw: item.schedule?.date,
                    reason: item.reason || '',
                    raw: item
                }));
                setAppointmentRequests(mapped);
            } else {
                setAppointmentRequests([]);
            }
        } catch (e) {
            console.error(e);
            setApptError('Failed to load');
        } finally {
            setApptLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments(true); // Clear only on hospitalId change
    }, [hospitalId]);

    const handleApprove = async (request, onSuccess) => {
        try {
            if (!request?.id) return;
            setApprovingId(request.id);
            const res = await approveAppointment(request.id);
            if (res.success) {
                // Optimistic Update: remove the item immediately
                setAppointmentRequests(prev => prev.filter(r => r.id !== request.id));

                addToast({
                    title: 'Appointment Approved',
                    message: 'Appointment has been successfully moved to queue.',
                    type: 'success'
                });

                // End loading before refresh to make it snappy
                setApprovingId(null);

                // Sync with server in background
                loadAppointments();
                onSuccess?.();
            } else {
                throw new Error(res.message || 'Failed to approve appointment');
            }
        } catch (e) {
            console.error('Approve failed', e?.response?.data || e.message);
            setApprovingId(null);
            addToast({
                title: 'Approval Failed',
                message: e?.response?.data?.message || e.message || 'Something went wrong while approving.',
                type: 'error'
            });
        }
    };

    const handleReject = async (request) => {
        try {
            if (!request?.raw?.id) return;
            setRejectingId(request.raw.id);
            await rejectAppointment(request.raw.id);
            setAppointmentRequests(prev => prev.filter(r => r.raw?.id !== request.raw.id));
        } catch (e) {
            console.error('Reject failed', e?.response?.data || e.message);
        } finally {
            setRejectingId(null);
        }
    };

    return {
        clinicId,
        doctorId,
        hospitalId,
        appointmentRequests,
        apptLoading,
        apptError,
        approvingId,
        rejectingId,
        handleApprove,
        handleReject,
        reloadAppointments: loadAppointments
    };
}
