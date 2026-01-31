import React, { useMemo, useState, useCallback, useEffect } from 'react'
import Header from '../../../components/DoctorList/Header'
import AddPatientDrawer from '../../../components/PatientList/AddPatientDrawer'
import AppointmentLogDrawer from '../../../components/PatientList/AppointmentLogDrawer'
import ScheduleAppointmentDrawer2 from '../../../components/PatientList/ScheduleAppointmentDrawer2'
import SampleTable from '../../../pages/SampleTable'
import { getPatientColumns } from './columns'
import PatientDetailsDrawer from './PatientDetailsDrawer'
import { getPatientsForHospitalStaff } from '../../../services/patientService'
import useHospitalFrontDeskAuthStore from '../../../store/useHospitalFrontDeskAuthStore'
import UniversalLoader from '../../../components/UniversalLoader'

export default function HFDPatients() {
  const [selected, setSelected] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [page, setPage] = useState(1);
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatientForSchedule, setSelectedPatientForSchedule] = useState(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useHospitalFrontDeskAuthStore();
  const hospitalId = user?.hospitalId || user?.hospital?.id;
  const pageSize = 10;

  const fetchPatients = useCallback(async () => {
    if (!hospitalId) return;
    setLoading(true);
    try {
      const res = await getPatientsForHospitalStaff(hospitalId);
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter logic
  const patientsFiltered = useMemo(() => {
    if (selected === 'active') return patients.filter(p => p.isActive === true);
    if (selected === 'inactive') return patients.filter(p => p.isActive === false);
    return patients;
  }, [selected, patients]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return patientsFiltered.slice(start, start + pageSize);
  }, [patientsFiltered, page, pageSize]);

  const counts = useMemo(() => ({
    all: patients.length,
    active: patients.filter(p => p.isActive === true).length,
    inactive: patients.filter(p => p.isActive === false).length
  }), [patients])

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
    <div className="flex flex-col h-full bg-secondary-grey50 overflow-hidden px-3">
      <div className="shrink-0 mt-2">
        <Header
          counts={counts}
          selected={selected}
          onChange={setSelected}
          tabs={[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }]}
          showCounts={true}
          showTabs={true}
          addLabel="Add New Patient"
          addPath={() => setAddOpen(true)}
        />
      </div>

      <div className="h-[calc(100vh-140px)] overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
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
            hideSeparators={false}
            loading={loading}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-secondary-grey300 font-medium">No patient found</span>
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

      <AppointmentLogDrawer
        open={logDrawerOpen}
        onClose={() => setLogDrawerOpen(false)}
      />

      <ScheduleAppointmentDrawer2
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
