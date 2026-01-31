import { create } from 'zustand';
import { getAllDoctorsBySuperAdmin } from '../services/doctorService';
import { getAllHospitalsBySuperAdmin } from '../services/hospitalService';
import { getPatientsForSuperAdmin } from '../services/patientService';

const useSuperAdminListStore = create((set, get) => ({
    // Doctors
    doctorsRaw: [],
    doctorsCounts: null,
    doctorsLoading: false,
    doctorsFetched: false,
    doctorsError: null,

    fetchDoctors: async (force = false) => {
        if (get().doctorsFetched && !force) return;
        set({ doctorsLoading: true, doctorsError: null });
        try {
            const resp = await getAllDoctorsBySuperAdmin();
            const list = resp?.data?.doctors || [];
            const counts = resp?.data?.counts || null;
            set({
                doctorsRaw: list,
                doctorsCounts: counts,
                doctorsFetched: true,
                doctorsLoading: false
            });
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to fetch doctors';
            set({ doctorsError: msg, doctorsLoading: false });
        }
    },

    // Hospitals
    hospitalsRaw: [],
    hospitalsCounts: null,
    hospitalsLoading: false,
    hospitalsFetched: false,
    hospitalsError: null,

    fetchHospitals: async (force = false) => {
        if (get().hospitalsFetched && !force) return;
        set({ hospitalsLoading: true, hospitalsError: null });
        try {
            const resp = await getAllHospitalsBySuperAdmin();
            const list = resp?.data?.hospitals || [];
            const counts = resp?.data?.counts || null;
            set({
                hospitalsRaw: list,
                hospitalsCounts: counts,
                hospitalsFetched: true,
                hospitalsLoading: false
            });
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to fetch hospitals';
            set({ hospitalsError: msg, hospitalsLoading: false });
        }
    },

    // Patients
    patientsRaw: [],
    patientsLoading: false,
    patientsFetched: false,
    patientsError: null,

    fetchPatients: async (force = false) => {
        if (get().patientsFetched && !force) return;
        set({ patientsLoading: true, patientsError: null });
        try {
            const resp = await getPatientsForSuperAdmin();
            if (resp && resp.success && resp.data && Array.isArray(resp.data.patients)) {
                set({
                    patientsRaw: resp.data.patients,
                    patientsFetched: true,
                    patientsLoading: false
                });
            } else {
                set({ patientsRaw: [], patientsFetched: true, patientsLoading: false });
            }
        } catch (e) {
            const msg = e?.response?.data?.message || e?.message || 'Failed to fetch patients';
            set({ patientsError: msg, patientsLoading: false });
        }
    },

    // Clear all
    clearAllLists: () => set({
        doctorsRaw: [],
        doctorsFetched: false,
        hospitalsRaw: [],
        hospitalsFetched: false,
        patientsRaw: [],
        patientsFetched: false,
    })
}));

export default useSuperAdminListStore;
