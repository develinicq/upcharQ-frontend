import React, { useMemo, useState, useEffect } from "react";
import PatientHeader from "../../../components/PatientList/Header";
// Replaced the custom PatientTable with the reusable SampleTable component
import SampleTable from "../../../pages/SampleTable.jsx";
import AddPatientDrawer from "../../../components/PatientList/AddPatientDrawer";
import PatientDetailsDrawer from "./PatientDetailsDrawer";
import useDoctorPatientListStore from "../../../store/useDoctorPatientListStore";
import ScheduleAppointmentDrawer2 from "../../../components/PatientList/ScheduleAppointmentDrawer2";
import useDoctorAuthStore from "../../../store/useDoctorAuthStore";
import useFrontDeskAuthStore from "../../../store/useFrontDeskAuthStore";
import useClinicStore from "../../../store/settings/useClinicStore";
import {
  action_calendar,
  action_dot,
  action_heart,
  vertical,
} from "../../../../public/index.js";
import AvatarCircle from "../../../components/AvatarCircle.jsx";
import UniversalLoader from "../../../components/UniversalLoader";
import { getPatientColumns } from "./columns";


const demoPatients = Array.from({ length: 300 }).map((_, i) => ({
  name: `Patient ${i + 1}`,
  gender: i % 2 === 0 ? "M" : "F",
  dob: `01/${(i % 28) + 1}/1990 (35Y)`,
  patientId: `P${100000 + i}`,
  contact: `+91 98765${(i % 10).toString().repeat(4)}`,
  email: `patient${i + 1}@example.com`,
  location: [
    "Delhi, DL",
    "Mumbai, MH",
    "Bangalore, KA",
    "Chennai, TN",
    "Kolkata, WB",
  ][i % 5],
  lastVisit: `03/${(i % 28) + 1}/2025 | ${(i % 12) + 1}:00 PM`,
  reason: [
    "Routine check-up",
    "Follow-up visit",
    "Consultation for headache",
    "Diabetes management",
    "General health check-up",
  ][i % 5],
  status: i % 3 === 0 ? 'Inactive' : 'Active'
}));

export default function Patient() {
  const [selected, setSelected] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  // Pagination state (must be declared before useEffects/useMemos that use them)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { patients, pagination, loading, error, fetchPatients, clearPatientsStore } =
    useDoctorPatientListStore();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedulePatient, setSchedulePatient] = useState(null);

  const { user: doctorDetails, loading: doctorLoading, fetchMe: fetchDoctorDetails } = useDoctorAuthStore();
  const { user: fdUser } = useFrontDeskAuthStore();
  const { clinic: clinicData, selectedClinicId, selectedWorkplaceType } = useClinicStore();

  useEffect(() => {
    if (!doctorDetails && !doctorLoading && !fdUser) {
      fetchDoctorDetails?.();
    }
  }, [doctorDetails, doctorLoading, fetchDoctorDetails, fdUser]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Resolve IDs for both Doctor and Front Desk contexts
      const activeId =
        selectedClinicId ||
        doctorDetails?.clinicId ||
        doctorDetails?.clinic?.id ||
        doctorDetails?.associatedWorkplaces?.clinic?.id ||
        fdUser?.clinicId ||
        fdUser?.clinic?.id ||
        clinicData?.id ||
        clinicData?.clinicId;

      const isHospital = selectedWorkplaceType === "Hospital";
      const clinicId = !isHospital ? activeId : undefined;
      const hospitalId = isHospital ? activeId : undefined;

      const doctorId =
        doctorDetails?.userId ||
        doctorDetails?.id ||
        doctorDetails?._id ||
        doctorDetails?.doctorId ||
        fdUser?.doctorId;

      try {
        await fetchPatients({ clinicId, doctorId, hospitalId, page, limit: pageSize });
      } catch (e) {
        // If fetch fails, keep using demoPatients as fallback
        if (mounted) {
          // noop - patient table will render demo data below if patients empty
        }
      }
    })();
    return () => {
      mounted = false;
      // Removed clearPatientsStore() call to persist data on tab switching
    };
  }, [fetchPatients, clearPatientsStore, doctorDetails, fdUser, clinicData, page, pageSize, selectedWorkplaceType]);

  const displayPatients = loading
    ? []
    : patients && patients.length > 0
      ? patients
      : [];

  const patientsFiltered = useMemo(() => {
    if (selected === 'active') return displayPatients.filter(p => (p.status || '').toLowerCase() === 'active');
    if (selected === 'inactive') return displayPatients.filter(p => (p.status || '').toLowerCase() === 'inactive');
    return displayPatients;
  }, [selected, displayPatients]);

  const counts = useMemo(
    () => ({
      all: pagination?.totalCount || displayPatients.length,
      active: displayPatients.filter(p => (p.status || '').toLowerCase() === 'active').length,
      inactive: displayPatients.filter(p => (p.status || '').toLowerCase() === 'inactive').length
    }),
    [displayPatients, pagination]
  );
  const total = pagination?.totalCount || displayPatients.length;
  const pageRows = patientsFiltered;

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when limit changes
  };

  // Define columns for patient table view
  const columns = useMemo(
    () => getPatientColumns(
      (row) => console.log('Open Log', row),
      (row) => {
        setSchedulePatient(row);
        setIsScheduleOpen(true);
      }
    ),
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-grey50">
        <UniversalLoader size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-secondary-grey50 p-6">
        <div className="text-red-600 font-medium mb-2">Failed to load patients</div>
        <div className="text-sm text-red-500 mb-4">{error}</div>
        <button
          onClick={() => {
            const activeId = selectedClinicId || doctorDetails?.clinicId || doctorDetails?.clinic?.id || fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
            const isHospital = selectedWorkplaceType === "Hospital";
            const clinicId = !isHospital ? activeId : undefined;
            const hospitalId = isHospital ? activeId : undefined;
            const doctorId = doctorDetails?.userId || doctorDetails?.id || doctorDetails?._id || doctorDetails?.doctorId || fdUser?.doctorId;
            fetchPatients({ clinicId, doctorId, hospitalId, page, limit: pageSize });
          }}
          className="px-6 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="px-3">
        <div className="pt-2 pb-1">
          <PatientHeader
            counts={counts}
            selected={selected}
            onChange={setSelected}
            tabs={[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' }
            ]}
            showTabs={true}
            showCounts={true}
            addLabel="Add New Patient"
            addPath={() => setAddOpen(true)}
          />
        </div>

        <div className="h-[calc(100vh-140px)] overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
          {patientsFiltered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary-grey400">
              <p className="text-base">No patient found</p>
            </div>
          ) : (
            <SampleTable
              columns={columns}
              data={pageRows}
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              stickyLeftWidth={260}
              stickyRightWidth={160}
              onRowClick={(row) => {
                setSelectedPatientDetails(row);
                setDetailsOpen(true);
              }}
            />
          )}
        </div>

        <AddPatientDrawer
          open={addOpen}
          onClose={() => setAddOpen(false)}
          clinicId={selectedWorkplaceType !== "Hospital" ? (selectedClinicId || doctorDetails?.clinicId || fdUser?.clinicId) : undefined}
          hospitalId={selectedWorkplaceType === "Hospital" ? (selectedClinicId || doctorDetails?.clinicId || fdUser?.clinicId) : undefined}
          onSave={(data) => {
            const activeId = selectedClinicId || doctorDetails?.clinicId || doctorDetails?.clinic?.id || fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
            const isHospital = selectedWorkplaceType === "Hospital";
            const clinicId = !isHospital ? activeId : undefined;
            const hospitalId = isHospital ? activeId : undefined;
            const doctorId = doctorDetails?.userId || doctorDetails?.id || doctorDetails?._id || doctorDetails?.doctorId || fdUser?.doctorId;
            fetchPatients({ clinicId, doctorId, hospitalId, page, limit: pageSize });
            setAddOpen(false);
          }}
        />

        <ScheduleAppointmentDrawer2
          open={isScheduleOpen}
          onClose={() => {
            setIsScheduleOpen(false);
            setSchedulePatient(null);
          }}
          patient={schedulePatient}
          doctorId={doctorDetails?.id || doctorDetails?.doctorId || fdUser?.doctorId}
          clinicId={selectedWorkplaceType !== "Hospital" ? (selectedClinicId || doctorDetails?.clinicId || fdUser?.clinicId) : undefined}
          hospitalId={selectedWorkplaceType === "Hospital" ? (selectedClinicId || doctorDetails?.clinicId || fdUser?.clinicId) : undefined}
          onSchedule={() => {
            const activeId = selectedClinicId || doctorDetails?.clinicId || doctorDetails?.clinic?.id || fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
            const isHospital = selectedWorkplaceType === "Hospital";
            const clinicId = !isHospital ? activeId : undefined;
            const hospitalId = isHospital ? activeId : undefined;
            const doctorId = doctorDetails?.userId || doctorDetails?.id || doctorDetails?._id || doctorDetails?.doctorId || fdUser?.doctorId;
            fetchPatients({ clinicId, doctorId, hospitalId, page, limit: pageSize });
          }}
          zIndex={6000}
        />
        <PatientDetailsDrawer
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          patient={selectedPatientDetails}
        />
      </div>
    </>
  );
}
