import { create } from 'zustand';

const useHospitalDataStore = create((set) => ({
    doctors: [],
    doctorsLoaded: false,
    patients: [],
    patientsLoaded: false,

    setDoctors: (doctors) => set({ doctors, doctorsLoaded: true }),
    setPatients: (patients) => set({ patients, patientsLoaded: true }),

    clearDoctors: () => set({ doctors: [], doctorsLoaded: false }),
    clearPatients: () => set({ patients: [], patientsLoaded: false }),

    reset: () => set({
        doctors: [],
        doctorsLoaded: false,
        patients: [],
        patientsLoaded: false
    })
}));

export default useHospitalDataStore;
