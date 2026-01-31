import React, { useMemo, useState, useCallback, useEffect } from 'react'
import Header from '../../../components/DoctorList/Header'
import AddPatientDrawer from '../../../components/PatientList/AddPatientDrawer'
import AppointmentLogDrawer from '../../../components/PatientList/AppointmentLogDrawer'
import ScheduleAppointmentDrawer from '../../../components/PatientList/ScheduleAppointmentDrawer'
import SampleTable from '../../../pages/SampleTable'
import { getPatientColumns } from './columns'
import PatientDetailsDrawer from './PatientDetailsDrawer'
import { getPatientsForHospitalAdmin } from '../../../services/hospitalService'
import useHospitalAuthStore from '../../../store/useHospitalAuthStore'
import useHospitalDataStore from '../../../store/hospital/useHospitalDataStore';
import UniversalLoader from '../../../components/UniversalLoader'

const Patients = () => {
  const [selected, setSelected] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage] = useState(1);
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatientForSchedule, setSelectedPatientForSchedule] = useState(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const { hospitalId } = useHospitalAuthStore();
  const { patients: cachedPatients, patientsLoaded, setPatients } = useHospitalDataStore();
  const [loading, setLoading] = useState(!patientsLoaded);
  const pageSize = 10;

  const fetchPatients = useCallback(async () => {
    // Always fetch to ensure fresh data, or rely on store caching logic
    if (!hospitalId) return;
    setLoading(true);
    try {
      const res = await getPatientsForHospitalAdmin(hospitalId);
      if (res.success) {
        // Robustly handle different response formats
        const patientsList = res.data?.patients || (Array.isArray(res.data) ? res.data : []);
        setPatients(patientsList);
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  }, [hospitalId, setPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter logic
  const patientsFiltered = useMemo(() => {
    if (selected === 'active') return cachedPatients.filter(p => p.status === 'Active');
    if (selected === 'inactive') return cachedPatients.filter(p => p.status === 'Inactive');
    return cachedPatients;
  }, [selected, cachedPatients]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return patientsFiltered.slice(start, start + pageSize);
  }, [patientsFiltered, page, pageSize]);

  const counts = useMemo(() => ({
    all: cachedPatients.length,
    active: cachedPatients.filter(p => p.status === 'Active').length,
    inactive: cachedPatients.filter(p => p.status === 'Inactive').length
  }), [cachedPatients])

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
        {patientsFiltered.length > 0 ? (
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
              setSelectedPatientDetails(row);
              setDetailsOpen(true);
            }}
            hideSeparators={false} // Show dividers
            loading={loading}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-secondary-grey300 font-medium">No patient</span>
          </div>
        )}
      </div>

      <AddPatientDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={() => {
          setAddOpen(false);
          fetchPatients();
        }}
      />
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
        patient={selectedPatientDetails}
      />
    </div>
  )
}

export default Patients
