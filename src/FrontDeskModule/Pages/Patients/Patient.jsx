import React, { useMemo, useState, useEffect } from "react";
import PatientHeader from "../../../components/PatientList/Header";
import SampleTable from "../../../pages/SampleTable.jsx";
import AddPatientDrawer from "../../../components/PatientList/AddPatientDrawer";
import useDoctorPatientListStore from "../../../store/useDoctorPatientListStore";
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
import PatientDetailsDrawer from "./PatientDetailsDrawer";
import ScheduleAppointmentDrawer2 from "../../../components/PatientList/ScheduleAppointmentDrawer2";


export default function Patient() {
    const [selected, setSelected] = useState("all");
    const [addOpen, setAddOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [schedulePatient, setSchedulePatient] = useState(null);
    const { patients, loading, error, fetchPatients, clearPatientsStore } =
        useDoctorPatientListStore();

    const { user: fdUser } = useFrontDeskAuthStore();
    const { clinic: clinicData } = useClinicStore();

    useEffect(() => {
        let mounted = true;
        (async () => {
            // Resolve IDs for Front Desk context
            const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
            const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;

            try {
                if (clinicId || doctorId) {
                    await fetchPatients({ clinicId, doctorId, roleContext: 'front-desk' });
                }
            } catch (e) {
                if (mounted) {
                    console.error("Failed to fetch patients", e);
                }
            }
        })();
        return () => {
            mounted = false;
            clearPatientsStore();
        };
    }, [fetchPatients, clearPatientsStore, fdUser, clinicData]);

    const displayPatients = loading
        ? []
        : patients && patients.length > 0
            ? patients
            : [];

    const counts = useMemo(
        () => ({ all: displayPatients.length, online: 0, walkin: 0 }),
        [displayPatients]
    );

    const [page, setPage] = useState(1);
    const pageSize = 30;
    const total = displayPatients.length;
    const pageRows = useMemo(
        () => displayPatients.slice((page - 1) * pageSize, page * pageSize),
        [displayPatients, page, pageSize]
    );

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
                        const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
                        const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;
                        fetchPatients({ clinicId, doctorId, roleContext: 'front-desk' });
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors shadow-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (displayPatients.length === 0) {
        return (
            <div className="px-3">
                <div className="pt-2 pb-1">
                    <PatientHeader
                        counts={counts}
                        selected={selected}
                        onChange={setSelected}
                        addLabel="Add New Patient"
                        addPath={() => setAddOpen(true)}
                    />
                </div>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-secondary-grey400 bg-white border border-gray-200 rounded-lg">
                    <p className="text-base">No patient found</p>
                </div>
                <AddPatientDrawer
                    open={addOpen}
                    onClose={() => setAddOpen(false)}
                    onSave={() => {
                        const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
                        const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;
                        fetchPatients({ clinicId, doctorId, roleContext: 'front-desk' });
                        setAddOpen(false);
                    }}
                />
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
                        addLabel="Add New Patient"
                        addPath={() => setAddOpen(true)}
                    />
                </div>

                <div className="h-[calc(100vh-140px)] overflow-hidden border border-gray-200 rounded-lg shadow-sm bg-white">
                    <SampleTable
                        columns={columns}
                        data={pageRows}
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={setPage}
                        stickyLeftWidth={260}
                        stickyRightWidth={160}
                        onRowClick={(row) => {
                            setSelectedPatient(row);
                            setDetailsOpen(true);
                        }}
                    />
                </div>

                <AddPatientDrawer
                    open={addOpen}
                    onClose={() => setAddOpen(false)}
                    onSave={() => {
                        const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
                        const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;
                        fetchPatients({ clinicId, doctorId, roleContext: 'front-desk' });
                        setAddOpen(false);
                    }}
                />
                <PatientDetailsDrawer
                    isOpen={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    patient={selectedPatient}
                />
                <ScheduleAppointmentDrawer2
                    open={isScheduleOpen}
                    onClose={() => {
                        setIsScheduleOpen(false);
                        setSchedulePatient(null);
                    }}
                    patient={schedulePatient}
                    doctorId={fdUser?.doctorId || fdUser?.doctor?.id}
                    clinicId={fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId}
                    onSchedule={() => {
                        const clinicId = fdUser?.clinicId || fdUser?.clinic?.id || clinicData?.id || clinicData?.clinicId;
                        const doctorId = fdUser?.doctorId || fdUser?.doctor?.id;
                        fetchPatients({ clinicId, doctorId, roleContext: 'front-desk' });
                    }}
                    zIndex={6000}
                />
            </div>
        </>
    );
}
