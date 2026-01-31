import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  PanelRightOpen,
  PanelRightClose,
  ClipboardCheck,
  CalendarDays,
  Bell,
  Calendar
} from 'lucide-react';
import AvatarCircle from '../../../components/AvatarCircle';
import Toggle from '../../../components/FormItems/Toggle';
import MiddleQueue from './MiddleQueue';
import RightQueueSidebar from './RightQueueSidebar';
import Badge from '../../../components/Badge';
import PauseQueueModal from '../../../components/PauseQueueModal';
import { startSlotEta, findPatientSlots, pauseSlotEta, resumeSlotEta } from '../../../services/authService';
import useToastStore from '../../../store/useToastStore';
const search = '/superAdmin/Doctors/SearchIcon.svg'
import { useQueueLogic } from './useQueueLogic';
const appt = '/fd/appt.svg'
const active = '/fd/active.svg'
import useHospitalFrontDeskAuthStore from '../../../store/useHospitalFrontDeskAuthStore';

import { getAvailableDoctorsForQueue, getDoctorActiveSlot } from '../../../services/hospitalService';

const toggle_open = '/fd/toggle_open.svg'


export default function HFDQueue() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appt_request'); // 'active_sessions' or 'appt_request'
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  const { hospitalId } = useHospitalFrontDeskAuthStore();

  const fetchDoctors = async () => {
    if (!hospitalId) return;
    setDoctorsLoading(true);
    try {
      const res = await getAvailableDoctorsForQueue(hospitalId);
      if (res.success && res.data?.doctors) {
        const mapped = res.data.doctors.map(d => ({
          id: d.doctorId,
          name: d.doctorName,
          specialty: d.medicalPracticeType,
          avatar: '',
          active: true,
          sessionStarted: d.sessionStatus === 'STARTED',
          slotId: d.slotId,
          starting: false,
          paused: d.sessionStatus === 'PAUSED',
          currentToken: 0,
          pauseDuration: null,
          pauseStartTime: null
        }));
        setDoctors(mapped);
        if (mapped.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(mapped[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch available doctors:', error);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    useHospitalFrontDeskAuthStore.getState().fetchMe();
  }, []);

  useEffect(() => {
    if (hospitalId) {
      fetchDoctors();
    }
  }, [hospitalId]);

  // Hook for Queue Logic (Requests, Approvals)
  const {
    appointmentRequests,
    apptLoading,
    apptError,
    activeSessions, // if exported from hook, otherwise use local or derived
    approvingId,
    rejectingId,
    handleApprove,
    handleReject,
    reloadAppointments
  } = useQueueLogic(selectedDoctorId);

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseMinutes, setPauseMinutes] = useState(null);
  const [pendingPauseDocId, setPendingPauseDocId] = useState(null);
  const [pendingPauseSlotId, setPendingPauseSlotId] = useState(null);
  const [pauseSubmitting, setPauseSubmitting] = useState(false);
  const [pauseError, setPauseError] = useState(null);

  const { addToast } = useToastStore();
  const doctorsRef = useRef(doctors);

  useEffect(() => {
    doctorsRef.current = doctors;
  }, [doctors]);

  const pollDoctorStatuses = async () => {
    const currentDocs = doctorsRef.current;
    if (!hospitalId || currentDocs.length === 0) return;

    try {
      const updatedDoctors = await Promise.all(
        currentDocs.map(async (doc) => {
          try {
            const res = await getDoctorActiveSlot(hospitalId, doc.id);
            if (res.success && res.data) {
              return {
                ...doc,
                sessionStarted: res.data.status === 'STARTED' || res.data.status === 'PAUSED',
                paused: res.data.status === 'PAUSED',
                currentToken: res.data.currentToken || 0,
                slotId: res.data.slotId || doc.slotId
              };
            }
            return doc;
          } catch (err) {
            console.error(`Failed to fetch status for doctor ${doc.id}:`, err);
            return doc;
          }
        })
      );
      setDoctors(updatedDoctors);
    } catch (error) {
      console.error('Error polling doctor statuses:', error);
    }
  };

  useEffect(() => {
    if (hospitalId && doctors.length > 0) {
      // Immediate fetch on load
      pollDoctorStatuses();

      const interval = setInterval(pollDoctorStatuses, 120000); // 2 minutes
      return () => clearInterval(interval);
    }
  }, [hospitalId, doctors.length > 0]);

  const handleSlotStatusUpdate = (update) => {
    if (!selectedDoctorId) return;

    setDoctors(prev => prev.map(d => {
      // Only update if it's the selected doctor AND the update belongs to the active slot
      // (or if we don't have a slotId for the doctor yet)
      if (d.id === selectedDoctorId && (d.slotId === update.slotId || !d.slotId)) {
        return {
          ...d,
          sessionStarted: update.status === 'STARTED' || update.status === 'PAUSED' || update.status === 'COMPLETED',
          paused: update.status === 'PAUSED',
          currentToken: update.currentToken ?? d.currentToken,
          slotId: update.slotId || d.slotId
        };
      }
      return d;
    }));
  };

  const handleToggleSession = async (docId) => {
    const doc = doctors.find(d => d.id === docId);
    if (!doc) return;

    if (doc.sessionStarted) {
      // If session is active, we are pausing it -> Open Modal
      setPendingPauseDocId(docId);
      setPendingPauseSlotId(doc.slotId);
      setShowPauseModal(true);
    } else {
      // If session is inactive, just start it
      let slotIdToStart = doc.slotId;

      setDoctors(prev => prev.map(d =>
        d.id === docId ? { ...d, starting: true } : d
      ));

      try {
        // If slotId is missing, try to fetch it for today
        if (!slotIdToStart) {
          const today = new Date().toISOString().slice(0, 10);
          const slotRes = await findPatientSlots({
            doctorId: docId,
            hospitalId: hospitalId,
            date: today
          });
          const slots = Array.isArray(slotRes) ? slotRes : (slotRes?.data || slotRes?.slots || []);

          if (slots.length > 0) {
            // Pick first slot
            slotIdToStart = slots[0].id || slots[0].slotId || slots[0]._id;
            // Update doctor with slotId for future use
            setDoctors(prev => prev.map(d =>
              d.id === docId ? { ...d, slotId: slotIdToStart } : d
            ));
          }
        }

        if (!slotIdToStart) {
          addToast({
            title: "No Slots Found",
            message: `No active slots found for ${doc.name} today.`,
            type: "error"
          });
          setDoctors(prev => prev.map(d =>
            d.id === docId ? { ...d, starting: false } : d
          ));
          return;
        }

        const res = await startSlotEta(slotIdToStart);
        if (res.success) {
          setDoctors(prev => prev.map(d =>
            d.id === docId ? { ...d, sessionStarted: true, starting: false } : d
          ));
          addToast({
            title: "Success",
            message: `Check-ups started for ${doc.name}`,
            type: "success"
          });
          // Reload appointments for the selected doctor if it's the one we just started
          if (docId === selectedDoctorId) {
            reloadAppointments?.();
          }
        } else {
          throw new Error(res.message || "Failed to start check-ups");
        }
      } catch (error) {
        console.error("Failed to start slot:", error);
        setDoctors(prev => prev.map(d =>
          d.id === docId ? { ...d, starting: false } : d
        ));
        addToast({
          title: "Error",
          message: error.response?.data?.message || error.message || "Something went wrong",
          type: "error"
        });
      }
    }
  };

  const confirmPauseQueue = async () => {
    if (!pendingPauseDocId || !pauseMinutes) return;
    const doc = doctors.find(d => d.id === pendingPauseDocId);
    const slotId = pendingPauseSlotId || doc?.slotId;
    if (!slotId) return;

    setPauseSubmitting(true);
    setPauseError(null);
    try {
      const res = await pauseSlotEta(slotId, pauseMinutes);
      if (res.success) {
        setDoctors(prev => prev.map(d =>
          d.id === pendingPauseDocId ? {
            ...d,
            sessionStarted: true,
            paused: true,
            pauseDuration: pauseMinutes,
            pauseStartTime: new Date().toISOString()
          } : d
        ));
        addToast({
          title: "Queue Paused",
          message: `Queue paused for ${pauseMinutes} minutes`,
          type: "success"
        });
        setShowPauseModal(false);
        setPendingPauseDocId(null);
        setPauseMinutes(null);
      } else {
        throw new Error(res.message || "Failed to pause queue");
      }
    } catch (error) {
      console.error("Failed to pause queue:", error);
      setPauseError(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setPauseSubmitting(false);
    }
  };

  const handleResumeQueue = async (docId, slotId) => {
    const doc = doctors.find(d => d.id === docId);
    const targetSlotId = slotId || doc?.slotId;
    if (!targetSlotId) return;

    try {
      const res = await resumeSlotEta(targetSlotId);
      if (res.success) {
        setDoctors(prev => prev.map(d =>
          d.id === docId ? { ...d, paused: false, pauseDuration: null } : d
        ));
        addToast({
          title: "Queue Resumed",
          message: "Queue has been resumed successfully.",
          type: "success"
        });
      } else {
        throw new Error(res.message || "Failed to resume queue");
      }
    } catch (error) {
      console.error("Failed to resume queue:", error);
      addToast({
        title: "Error",
        message: error.response?.data?.message || error.message || "Failed to resume queue",
        type: "error"
      });
    }
  };

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="flex h-full w-full bg-gray-50 overflow-hidden ">

      {/* ---------------- LEFT COLUMN: DOCTOR SESSIONS ---------------- */}
      <div className="w-[300px] shrink-0 flex flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-3 flex flex-col gap-1">
          <h2 className="text-[16px] text-secondary-grey400 font-semibold">Today's Doctor Session</h2>
          <div className="relative">
            <img src={search} alt="" className='absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5' />

            <input
              type="text"
              placeholder="Search Patients"
              className="w-full pl-8 pr-14 h-[32px] text-secondary-grey400 text-sm border-[0.5px] border-secondary-grey300/60 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-secondary-grey200 rounded ">Ctrl+/</span>
          </div>
        </div>

        <div className='w-full h-[1px] bg-secondary-grey100/50 my-1'></div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`px-3 py-2 flex flex-col gap-2 cursor-pointer transition-colors relative ${selectedDoctorId === doc.id ? 'bg-blue-primary50  border-l-[2px] border-blue-primary250' : 'border-b-[1px] border-secondary-grey100/30 hover:bg-secondary-grey50'}`}
            >

              <div className="flex gap-2">
                <AvatarCircle name={doc.name} size="md" className="shrink-0" color='orange' />
                <div className='flex flex-col gap-[2px]'>
                  <div className="flex items-center gap-[4px]">
                    <span className={`text-sm font-semibold text-secondary-grey400`}>{doc.name}</span>
                    <ArrowRight className="h-3 w-3 text-gray-400 -rotate-45" />
                  </div>
                  <div className="text-xs text-secondary-grey300">{doc.specialty}</div>
                </div>
              </div>


              <div className=" flex justify-between items-center">

                <div className='flex items-center gap-2'>

                  <Toggle
                    checked={doc.sessionStarted}
                    disabled={doc.starting}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSession(doc.id);
                    }}
                    size="sm"
                  />
                  <span className="text-[12px] text-secondary-grey300">
                    {doc.starting ? "Starting..." : "Start Check-ups"}
                  </span>
                </div>

                {/* Blinking Indicator if Session Started */}
                {doc.sessionStarted && (
                  <div className="flex items-center justify-center gap-1  ">
                    <div className={`w-3 h-3 rounded-full ${doc.paused ? 'bg-warning-400' : 'bg-success-300 animate-colorBlink'} transition-all duration-1000`}
                      style={!doc.paused ? {
                        '--blink-on': '#3EAF3F',
                        '--blink-off': '#ffffff',
                      } : {}}></div>
                    <span className={`text-[20px] font-bold ${doc.paused ? 'text-warning-400' : 'text-success-300'}`}>
                      {String(doc.currentToken || 0).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- MIDDLE COLUMN: QUEUE CONTENT ---------------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-gray-200">
        <MiddleQueue
          doctorId={selectedDoctorId}
          sessionStarted={selectedDoctor?.sessionStarted}
          isPaused={selectedDoctor?.paused}
          currentToken={selectedDoctor?.currentToken}
          pauseDuration={selectedDoctor?.pauseDuration}
          pauseStartTime={selectedDoctor?.pauseStartTime}
          onPauseQueue={(slotId) => {
            setPendingPauseDocId(selectedDoctorId);
            setPendingPauseSlotId(slotId);
            setShowPauseModal(true);
          }}
          onResumeQueue={(slotId) => handleResumeQueue(selectedDoctorId, slotId)}
          onStatusUpdate={handleSlotStatusUpdate}
        />
      </div>

      <PauseQueueModal
        show={showPauseModal}
        onClose={() => {
          setShowPauseModal(false);
          setPendingPauseDocId(null);
          setPauseError(null);
        }}
        pauseMinutes={pauseMinutes}
        setPauseMinutes={setPauseMinutes}
        pauseSubmitting={pauseSubmitting}
        pauseError={pauseError}
        onConfirm={confirmPauseQueue}
      />

      {/* ---------------- RIGHT COLUMN: EXPANDABLE SIDEBAR ---------------- */}
      <div className={`shrink-0 bg-white flex flex-col transition-all duration-300 ease-in-out relative border-l-[1px] border-secondary-grey100/50 ${rightPanelOpen ? 'w-[400px]' : 'w-[44px] items-center'}`}>

        {/* Toggle Header */}
        <div className={`h-10  flex items-center  border-secondary-grey100/50 shrink-0 ${rightPanelOpen ? 'pr-3 border-b-[1px] justify-between ' : 'justify-center w-full'}`}>
          {rightPanelOpen ? (
            <div className="flex flex-1 items-center gap-2 ">
              <button
                onClick={() => setActiveTab('active_sessions')}
                className={`h-[40px] px-[6px] text-[16px] border-b-[2px] transition-colors flex items-center gap-2 ${activeTab === 'active_sessions' ? 'border-blue-primary250 text-blue-primary250' : 'border-transparent text-secondary-grey300'}`}
              >
                <img src={active} alt="" className='w-3.5 h-3.5' />
                <span>Active Sessions</span>
                <div className='w-4 h-4 rounded-sm flex items-center justify-center text-[10px] px-1 py-[2px] bg-secondary-grey50 border border-secondary-grey100/50 text-secondary-grey300'>2</div>
              </button>
              <button
                onClick={() => setActiveTab('appt_request')}
                className={`h-[40px] px-[6px] text-[16px] border-b-[2px] transition-colors flex items-center gap-2 ${activeTab === 'appt_request' ? 'border-blue-primary250 text-blue-primary250' : 'border-transparent text-secondary-grey300'}`}
              >
                <img src={appt} alt="" className='w-3.5 h-3.5' />
                <span>Appt. Request</span>
                {appointmentRequests.length > 0 && (
                  <div className='w-5 h-5 border border-secondary-grey100/10 rounded-sm flex items-center justify-center text-[10px] px-1 py-[2px] bg-error-400  text-white'>
                    {appointmentRequests.length}
                  </div>
                )}
              </button>
            </div>
          ) : null}

          <button onClick={() => {
            setActiveTab('active_sessions');
            setRightPanelOpen(!rightPanelOpen);
          }} className={`p-2 hover:bg-secondary-grey50 rounded-sm`}>
            {rightPanelOpen ? <img src={toggle_open} alt="" className="rotate-180" /> : <img src={toggle_open} alt="" />}
          </button>
        </div>

        {rightPanelOpen ? (
          <RightQueueSidebar
            activeTab={activeTab} // Taking control from parent
            expanded={rightPanelOpen}
            onExpand={setRightPanelOpen}
            appointmentRequests={appointmentRequests}
            activeSessions={activeSessions}
            loading={apptLoading}
            error={apptError}
            onApprove={(req) => handleApprove(req, () => {

            })}
            onReject={handleReject}
            approvingId={approvingId}
            rejectingId={rejectingId}
          />
        ) : (
          // Collapsed Icons
          <div className="flex-1 overflow-y-auto  flex flex-col gap-2 w-full items-center">
            <div className="border-t-[0.5px] border-secondary-grey100/50 w-5"></div>
            <div className="relative p-2  rounded-lg hover:bg-secondary-grey50 text-gray-500 hover:text-blue-600 cursor-pointer group" onClick={() => {
              setActiveTab('active_sessions');
              setRightPanelOpen(true);
            }}>
              <img src={active} alt="" className='w-4 h-4' />
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full text-[10px] text-white items-center justify-center flex">2</span> */}
            </div>
            <div className="border-t-[0.5px] border-secondary-grey100/50 w-5"></div>
            <div className="relative p-2 rounded-lg hover:bg-secondary-grey50 text-gray-500 hover:text-blue-600 cursor-pointer group" onClick={() => {
              setActiveTab('appt_request');
              setRightPanelOpen(true);
            }}
            >
              <img src={appt} alt="" className='w-4 h-4' />
              {appointmentRequests.length > 0 && <span className="absolute top-1 right-1 w-2 h-2  rounded-full"></span>}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
