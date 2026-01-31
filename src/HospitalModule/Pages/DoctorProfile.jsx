import React from 'react'
import useHospitalDoctorDetailsStore from '../../store/useHospitalDoctorDetailsStore.js'

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-12 gap-2 text-[13px] leading-5">
    <div className="col-span-4 text-gray-500">{label}</div>
    <div className="col-span-8 text-gray-900">{value || '-'}</div>
  </div>
)

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200">
    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <div className="text-sm font-medium text-gray-900">{title}</div>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
)

// Hospital module doctor page without sidebar, mirroring the settings layout
export default function DoctorProfile() {
  const dr = useHospitalDoctorDetailsStore();
  const personal = dr?.doctor || {};
  const consult = dr?.consultation || {};

  return (
    <div className="p-4 space-y-4">
      <SectionCard title="Personal Information">
        <div className="grid grid-cols-1 gap-3">
          <InfoRow label="Name" value={`${personal.firstName || ''} ${personal.lastName || ''}`.trim()} />
          <InfoRow label="Mobile" value={personal.phone} />
          <InfoRow label="Email" value={personal.email} />
          <InfoRow label="Gender" value={personal.gender} />
          <InfoRow label="City" value={personal.city} />
          <InfoRow label="Languages" value={(personal.languages||[]).join(', ')} />
        </div>
      </SectionCard>

      <SectionCard title="Consultation Details">
        <div className="grid grid-cols-1 gap-3">
          <InfoRow label="Consultation Type" value={consult.type} />
          <InfoRow label="Fee" value={consult.fee ? `₹ ${consult.fee}` : ''} />
          <InfoRow label="Duration" value={consult.duration ? `${consult.duration} mins` : ''} />
          <InfoRow label="Follow-up Fee" value={consult.followUpFee ? `₹ ${consult.followUpFee}` : ''} />
          <InfoRow label="Modes" value={(consult.modes||[]).join(', ')} />
          <InfoRow label="Slots" value={Array.isArray(consult.slots) ? `${consult.slots.length} configured` : ''} />
        </div>
      </SectionCard>
    </div>
  )
}