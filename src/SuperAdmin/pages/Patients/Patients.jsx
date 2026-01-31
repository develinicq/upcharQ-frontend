import React, { useMemo, useState, useEffect, useCallback } from 'react'
import Header from '../../../components/DoctorList/Header'
import AddPatientDrawer from '../../../components/PatientList/AddPatientDrawer'
import AppointmentLogDrawer from '../../../components/PatientList/AppointmentLogDrawer'
import ScheduleAppointmentDrawer from '../../../components/PatientList/ScheduleAppointmentDrawer'
import SampleTable from '../../../pages/SampleTable'
import PatientDetailsDrawer from './PatientDetailsDrawer'
import { getPatientColumns } from './columns'
import { getPatientsForSuperAdmin } from '../../../services/patientService'
import UniversalLoader from '../../../components/UniversalLoader'

import useSuperAdminListStore from '../../../store/useSuperAdminListStore'

const Patients = () => {
  const {
    patientsRaw,
    patientsLoading: loading,
    patientsError: error,
    fetchPatients
  } = useSuperAdminListStore();

  const [selected, setSelected] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage] = useState(1);
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedPatientForSchedule, setSelectedPatientForSchedule] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients])

  // Start Mapping Data
  const patientsMapped = useMemo(() => {
    return patientsRaw.map(p => {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || '-'

      // Format DOB to MM/DD/YYYY
      let formattedDob = '-';
      if (p.dob) {
        const d = new Date(p.dob);
        if (!isNaN(d.getTime())) {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const year = d.getFullYear();
          formattedDob = `${month}/${day}/${year}`;
        }
      }

      // Format Age to (XY)
      const formattedAge = (p.age !== null && p.age !== undefined) ? `${p.age}Y` : '-';

      return {
        id: p.patientCode || '-',
        userId: p.userId, // Adding userId for detailed view API call
        name: fullName,
        contact: p.phone || '-',
        email: p.email || '-',
        location: [p.city, p.state].filter(Boolean).join(', ') || '-',
        lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
        reason: p.reason || '-',
        gender: p.gender || '-',
        dob: formattedDob,
        age: formattedAge,
        isActive: p.isActive,
        status: p.isActive ? 'Active' : 'Inactive'
      }
    })
  }, [patientsRaw])


  // Filter logic based on isActive
  const patientsFiltered = useMemo(() => {
    if (selected === 'all') return patientsMapped;
    if (selected === 'active') return patientsMapped.filter(p => p.isActive === true);
    if (selected === 'inactive') return patientsMapped.filter(p => p.isActive === false);
    return patientsMapped;
  }, [selected, patientsMapped]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return patientsFiltered.slice(start, start + pageSize);
  }, [patientsFiltered, page, pageSize]);

  const counts = useMemo(() => ({
    all: patientsMapped.length,
    active: patientsMapped.filter(p => p.isActive === true).length,
    inactive: patientsMapped.filter(p => p.isActive === false).length,
  }), [patientsMapped])

  const handleOpenLog = useCallback((row) => {
    setLogDrawerOpen(true);
  }, []);

  const handleOpenSchedule = useCallback((row) => {
    setSelectedPatientForSchedule(row);
    setScheduleOpen(true);
  }, []);

  const columns = useMemo(() => getPatientColumns(handleOpenLog, handleOpenSchedule), [handleOpenLog, handleOpenSchedule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-grey50">
        <UniversalLoader size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-grey50">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-secondary-grey50 overflow-hidden">
      <div className="shrink-0 mt-2">
        <Header
          counts={counts}
          selected={selected}
          onChange={setSelected}
          tabs={[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }]}
          showCounts={true}
          addLabel="Add New Patient"
          addPath={() => setAddOpen(true)} // Keep drawer capability if needed, or null
        />
      </div>

      <div className="h-[calc(100vh-140px)] overflow-hidden m-3 border border-gray-200 rounded-lg shadow-sm bg-white">
        <SampleTable
          columns={columns}
          data={pagedData}
          page={page}
          pageSize={pageSize}
          total={patientsFiltered.length}
          onPageChange={setPage}
          stickyLeftWidth={260}
          stickyRightWidth={160}
          onRowClick={(row) => {
            setSelectedPatient(row);
            setDetailsOpen(true);
          }}
          hideSeparators={false} // Show dividers
        />
      </div>

      <AddPatientDrawer open={addOpen} onClose={() => setAddOpen(false)} onSave={() => setAddOpen(false)} />
      <AppointmentLogDrawer open={logDrawerOpen} onClose={() => setLogDrawerOpen(false)} />
      <ScheduleAppointmentDrawer
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        patient={selectedPatientForSchedule}
        onSchedule={() => setScheduleOpen(false)}
      />
      <PatientDetailsDrawer
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        patient={selectedPatient}
      />
    </div>
  )
}

export default Patients
