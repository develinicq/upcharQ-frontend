import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, User, Droplet, Phone, Mail, MapPin, Languages, CheckCircle } from 'lucide-react';
import AvatarCircle from '../../../components/AvatarCircle';
import Badge from '../../../components/Badge';

export default function PatientDrawer({ open, patient = {}, onClose }) {
  const [tab, setTab] = useState('overview');
  const name = patient.name || '—';
  const mrn = patient.patientId || patient.patientCode || '—';
  const gender = patient.gender || '—';
  const blood = patient.blood || '—';

  const overviewRef = useRef(null);
  const demoRef = useRef(null);
  const pastRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    const map = {
      overview: overviewRef.current,
      demographics: demoRef.current,
      past: pastRef.current,
    };
    const el = map[tab];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement.getBoundingClientRect();
      setUnderlineStyle({ width: rect.width, left: rect.left - parentRect.left });
    }
  }, [tab]);

  const defaultPastVisits = [
    {
      title: 'Appointment 3',
      dateTime: '28 Dec 2023 at 2:30 PM',
      type: 'Consultation',
      reason: 'Hypertension evaluation',
      statusLabel: 'Completed',
      statusColor: 'green',
      durationText: '05:30 Mins',
      hasPrescription: true,
    },
    {
      title: 'Appointment 5',
      dateTime: '14 Jan 2024 at 10:00 AM',
      type: 'Follow-up',
      reason: 'Medication review',
      statusLabel: 'No-Show',
      statusColor: 'red',
      hasPrescription: false,
    },
    {
      title: 'Appointment 4',
      dateTime: '05 Jan 2024 at 3:15 PM',
      type: 'Check-up',
      reason: 'Annual physical',
      statusLabel: 'Completed',
      statusColor: 'green',
      durationText: '15 Mins',
      hasPrescription: true,
    },
    {
      title: 'Appointment 3',
      dateTime: '01 Jan 2024 at 11:45 AM',
      type: 'Consultation',
      reason: 'Cold and cough',
      statusLabel: 'Cancelled',
      statusColor: 'red',
      hasPrescription: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
      {open && (
        <div className="absolute inset-0 bg-black/25 transition-opacity duration-200 ease-out pointer-events-auto" onClick={onClose} />
      )}
      <div
        className={`relative ${open ? 'm-3 mr-4 translate-x-0' : 'translate-x-full -mr-[520px]'} h-[calc(100%-24px)] w-[520px] bg-white shadow-2xl border border-gray-200 rounded-lg pointer-events-auto transform transition-transform duration-250 ease-out`}
        aria-hidden={!open}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <AvatarCircle name={name} size="s" />
            <div>
              <div className="font-semibold text-gray-800">{name}</div>
              <div className="flex items-center text-xs text-gray-500 gap-3 mt-1">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gray-400" /> {patient.dob || '—'}</span>
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-gray-400" /> {gender}</span>
                <span className="flex items-center gap-1"><Droplet className="h-3.5 w-3.5 text-gray-400" /> {blood}</span>
                <span className="text-xs text-gray-500">MRN: {mrn}</span>
              </div>
            </div>
          </div>
          <button className="p-1.5 rounded hover:bg-gray-100" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-4 pt-2 border-b border-gray-200">
          <div className="relative">
            <div className="flex items-center gap-6 text-sm">
              <button ref={overviewRef} onClick={() => setTab('overview')} className={`h-9 px-2 ${tab==='overview' ? 'font-medium text-blue-700' : 'text-gray-600'}`}>Overview</button>
              <button ref={demoRef} onClick={() => setTab('demographics')} className={`h-9 px-2 ${tab==='demographics' ? 'font-medium text-blue-700' : 'text-gray-600'}`}>Demographics</button>
              <button ref={pastRef} onClick={() => setTab('past')} className={`h-9 px-2 ${tab==='past' ? 'font-medium text-blue-700' : 'text-gray-600'}`}>Past Visits</button>
            </div>
            <div
              className="absolute bottom-0 h-[2px] bg-blue-600 rounded-t-sm transition-all duration-200"
              style={{ width: underlineStyle.width, left: underlineStyle.left }}
            />
          </div>
        </div>

        <div className="px-4 py-3 space-y-4 overflow-y-auto h-[calc(100%-120px)] rounded-b-lg">
          {tab === 'overview' && (
            <>
              <div className="text-[12px] text-[#626060] bg-[#FFF9C4] border border-[#FCE78A] rounded px-3 py-2">Add Sticky Notes of Patient's Quick Updates</div>

              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-800 mb-2">Contact Info</div>
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-500" /> {patient.contact || '—'} {patient.contact ? <Badge size="s" type="ghost" color="yellow" className="!px-2 !h-5">Primary</Badge> : null}</div>
                    {patient.contact ? <CheckCircle className="h-4 w-4 text-green-500" /> : null}
                  </div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-500" /> {patient.email || '—'}</div>{patient.email ? <CheckCircle className="h-4 w-4 text-green-500" /> : null}</div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /> {patient.location || '—'}</div></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Languages className="h-4 w-4 text-gray-500" /> {patient.languages || '—'}</div></div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-800 mb-2">Last Visit</div>
                <div className="grid grid-cols-3 gap-y-1 text-sm text-gray-700">
                  <div className="text-gray-500">Date:</div>
                  <div className="col-span-2">{patient.lastVisit || '—'}</div>
                  <div className="text-gray-500">Doctor:</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-800 text-[11px] h-5 w-5">M</span>
                    <span>{patient.lastVisitDoctor || '—'}</span>
                  </div>
                  <div className="text-gray-500">Type:</div>
                  <div className="col-span-2">{patient.lastVisitType || '—'}</div>
                  <div className="text-gray-500">Reason:</div>
                  <div className="col-span-2">{patient.reason || '—'}</div>
                  <div className="text-gray-500">Status:</div>
                  <div className="col-span-2 text-green-600">{patient.lastVisitStatus || '—'}</div>
                  <div className="col-span-3 text-xs text-blue-600 mt-2"><button className="underline">View Prescription →</button></div>
                </div>
              </div>

              <div className="bg-white p-0 rounded border border-gray-200">
                <div className="px-3 pt-3 font-semibold text-gray-800">Last Recorded Vitals & Biometrics</div>
                <div className="px-3 pb-2 text-[11px] text-gray-500">
                  <div className="bg-gray-100 border-t border-b border-gray-200 rounded-sm px-2 py-1">Recorded on 06/01/2025 by Dr. Milind Chauhan</div>
                </div>
                <div className="px-3 pb-3 text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between"><span>Blood Pressure:</span> <span className="text-red-600 font-medium">{patient.bp || '—'} <span className="text-red-500">↑</span></span></div>
                  <div className="flex justify-between"><span>Oxygen Saturation:</span> <span>{patient.oxygen || '—'}</span></div>
                  <div className="flex justify-between"><span>Temperature:</span> <span className="text-red-600 font-medium">{patient.temperature || '—'} <span className="text-red-500">↑</span></span></div>
                  <div className="flex justify-between"><span>Weight:</span> <span>{patient.weight || '—'}</span></div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-800 mb-2">Active Problems</div>
                <div className="flex flex-col gap-2 mb-2 text-sm text-gray-700">
                  {(patient.activeProblems || []).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>{p.title}</div>
                      <div><Badge type="ghost" color={p.label && p.label.toLowerCase().includes('high') ? 'red' : 'gray'} className="!px-2 !h-5">{p.label}</Badge></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'demographics' && (
            <div className="space-y-3">
              <div className="bg-white rounded border border-gray-200">
                <div className="px-3 py-2 text-[13px] font-semibold text-gray-800 flex items-center justify-between">
                  <span>Basic Info</span>
                  <button className="text-xs text-blue-600">Edit</button>
                </div>
                <div className="px-3 pb-2">
                  <div className="grid grid-cols-3 text-sm text-gray-700 gap-y-1">
                    <div className="text-gray-500">Name:</div>
                    <div className="col-span-2">{name}</div>
                    <div className="text-gray-500">Date Of Birth:</div>
                    <div className="col-span-2">{patient.dob || '—'}</div>
                    <div className="text-gray-500">Age:</div>
                    <div className="col-span-2">{patient.age || '—'}</div>
                    <div className="text-gray-500">Gender:</div>
                    <div className="col-span-2">{gender}</div>
                    <div className="text-gray-500">Blood Group:</div>
                    <div className="col-span-2">{blood}</div>
                    <div className="text-gray-500">Marital Status:</div>
                    <div className="col-span-2">{patient.maritalStatus || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200">
                <div className="px-3 py-2 text-[13px] font-semibold text-gray-800">Contact Details</div>
                <div className="px-3 pb-2">
                  <div className="grid grid-cols-3 text-sm text-gray-700 gap-y-1">
                    <div className="text-gray-500">Primary Phone:</div>
                    <div className="col-span-2">{patient.contact || '—'}</div>
                    <div className="text-gray-500">Secondary Phone:</div>
                    <div className="col-span-2">{patient.secondaryContact || '—'}</div>
                    <div className="text-gray-500">Email Address:</div>
                    <div className="col-span-2">{patient.email || '—'}</div>
                    <div className="text-gray-500">Emergency Contact:</div>
                    <div className="col-span-2">{patient.emergencyContact || '—'}</div>
                    <div className="text-gray-500">Primary Language:</div>
                    <div className="col-span-2">{patient.primaryLanguage || '—'}</div>
                    <div className="text-gray-500">Secondary Language:</div>
                    <div className="col-span-2">{patient.secondaryLanguage || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200">
                <div className="px-3 py-2 text-[13px] font-semibold text-gray-800">Address Details</div>
                <div className="px-3 pb-2">
                  <div className="text-[12px] text-blue-600 underline mb-1">Permanent Address</div>
                  <div className="grid grid-cols-3 text-sm text-gray-700 gap-y-1">
                    <div className="text-gray-500">Address:</div>
                    <div className="col-span-2">{patient.addressLine || '—'}</div>
                    <div className="text-gray-500">City:</div>
                    <div className="col-span-2">{patient.city || '—'}</div>
                    <div className="text-gray-500">State:</div>
                    <div className="col-span-2">{patient.state || '—'}</div>
                    <div className="text-gray-500">Zip Code:</div>
                    <div className="col-span-2">{patient.zip || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200">
                <div className="px-3 py-2 text-[13px] font-semibold text-gray-800 flex items-center justify-between">
                  <span>Dependant</span>
                  <button className="text-xs text-blue-600">+ Add New</button>
                </div>
                <div className="px-3 pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <AvatarCircle name={(patient.dependants?.[0]?.name)||'Rashmi Sharma'} size="s" />
                    <div>
                      <div className="font-medium">{(patient.dependants?.[0]?.name)||'Rashmi Sharma'} <span className="text-xs text-gray-500">Dependant</span></div>
                      <div className="text-xs text-gray-500">Wife • {(patient.dependants?.[0]?.phone)||'+91 91753 67487'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'past' && (
            <div className="space-y-3">
              <div className="text-[12px] text-[#626060] bg-[#FFF9C4] border border-[#FCE78A] rounded px-3 py-2">Add Sticky Notes of Patient's Quick Updates</div>

              {((patient.pastVisits || []).length === 0 ? defaultPastVisits : patient.pastVisits).map((v, i) => (
                  <div key={i} className="bg-white rounded border border-gray-200">
                    <div className="px-3 py-2 flex items-center justify-between text-[13px] font-medium text-gray-800">
                      <span>{v.title || `Appointment ${patient.pastVisits.length - i}`}</span>
                      <div className="flex items-center gap-4">
                        {v.hasPrescription && (
                          <button className="text-[12px] text-blue-600 underline">View Prescription →</button>
                        )}
                        <button className="text-gray-500">···</button>
                      </div>
                    </div>
                    <div className="px-3 pb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                      <div>
                        <div className="text-gray-500">Date:</div>
                        <div className="text-red-600">{v.dateTime || '—'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Type:</div>
                        <div className="text-gray-700">{v.type || '—'}</div>
                      </div>
                      <div className="mt-1">
                        <div className="text-gray-500">Reason:</div>
                        <div className="text-gray-700">{v.reason || '—'}</div>
                      </div>
                      <div className="mt-1">
                        <div className="text-gray-500">Status:</div>
                        <div>
                          <span className={`inline-block text-[12px] px-2 py-0.5 rounded ${
                            v.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                            v.statusColor === 'red' ? 'bg-red-100 text-red-700' :
                            v.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {v.statusLabel || '—'}{v.durationText ? ` (${v.durationText})` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
