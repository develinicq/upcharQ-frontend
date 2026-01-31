import { create } from 'zustand'
import { getPatientsForDoctor } from '../services/patientService'

// Separate store for doctor's patient list. Keep it isolated from other stores.
const useDoctorPatientListStore = create((set, get) => ({
  patients: [],
  pagination: null,
  loading: false,
  error: null,
  lastFetchedParams: null,
  // fetch patients for doctor. Accept optional params object for pagination/filtering in future.
  fetchPatients: async (opts = {}) => {
    const { clinicId, doctorId, hospitalId, page = 1, limit = 20 } = opts;

    set({ loading: true, error: null });
    try {
      const res = await getPatientsForDoctor({ clinicId, doctorId, hospitalId, page, limit });

      // Response structure: { success: true, data: { patients: [...], pagination: {...} } }
      const rawData = res?.data;
      const patientsList = rawData?.patients || (Array.isArray(rawData) ? rawData : []);
      const pagination = rawData?.pagination || null;

      // Normalize API shape to what PatientTable expects (aligning with Hospital module)
      const mapped = patientsList.map((p) => {
        return {
          id: p?.patientId || p?.id || '',
          patientId: p?.patientId || p?.id || '',
          patientCode: p?.patientCode || '',
          name: p?.name || '',
          gender: p?.genderInitial || p?.gender || '',
          genderInitial: p?.genderInitial || '',
          dob: p?.dob || '',
          age: p?.age || '',
          contact: p?.contactNumber || p?.contact || '',
          contactNumber: p?.contactNumber || '',
          email: p?.email || '',
          location: p?.location || '',
          lastVisit: p?.lastVisitDateTime || '',
          lastVisitDate: p?.lastVisitDate || '',
          lastVisitTime: p?.lastVisitTime || '',
          reason: p?.reasonForLastVisit || p?.reason || '',
          reasonForLastVisit: p?.reasonForLastVisit || '',
          profilePhoto: p?.profilePhoto || null,
          status: p?.status || 'Active', // Default to Active if not provided
          raw: p,
        };
      });

      set({
        patients: mapped,
        pagination,
        loading: false,
        lastFetchedParams: { clinicId, doctorId, hospitalId, page, limit }
      });
      return patientsList;
    } catch (e) {
      const err = e?.response?.data?.message || e.message || 'Failed to load patients';
      set({ error: err, loading: false });
      throw e;
    }
  },
  // Clear store state (keeps separation)
  clearPatientsStore: () => set({ patients: [], pagination: null, loading: false, error: null, lastFetchedParams: null }),
}))

export default useDoctorPatientListStore
