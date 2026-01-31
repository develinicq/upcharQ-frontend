import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { getHospitalReviewDetails } from '../services/hospitalService';
import useToastStore from './useToastStore';

const DEFAULT_SCHEDULE = [
  { day: 'Sunday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
  { day: 'Monday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
  { day: 'Tuesday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
  { day: 'Wednesday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
  { day: 'Thursday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
  { day: 'Friday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
  { day: 'Saturday', available: false, is24Hours: false, sessions: [{ startTime: '09:00', endTime: '18:00' }] },
];

const initialState = {
  name: '',
  type: '',
  emailId: '',
  phone: '',
  address: {
    blockNo: '',
    landmark: '',
    street: ''
  },
  city: '',
  state: '',
  pincode: '',
  website: '',
  url: '',
  logo: '',
  image: '',
  latitude: '',
  longitude: '',
  medicalSpecialties: [],
  hospitalServices: [],
  establishmentYear: '',
  noOfBeds: '',
  accreditation: [],
  adminId: '', // Keep for now as it might be used elsewhere, but not for reg
  hospitalId: '',
  documents: [],
  hasCin: 0,
  schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)), // Deep copy for initial state
  loading: false,
  error: null,
  success: false,
  reviewData: null,
  reviewLoading: false,
};

const useHospitalRegistrationStore = create((set, get) => ({
  ...initialState,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),

  setAddressField: (field, value) => set((state) => ({
    ...state,
    address: { ...state.address, [field]: value },
  })),

  // Upsert a document entry by type (more stable than matching by number)
  setDocument: (doc) => set((state) => {
    const others = Array.isArray(state.documents)
      ? state.documents.filter((d) => d.type !== doc.type)
      : [];
    return {
      ...state,
      documents: [...others, doc],
    };
  }),

  setDocuments: (docs) => set({ documents: docs }),

  setSchedule: (newSchedule) => set({ schedule: newSchedule }),

  // Helper to update a specific day in the schedule
  updateDay: (dayName, updates) => set((state) => ({
    schedule: state.schedule.map(d =>
      d.day === dayName ? { ...d, ...updates } : d
    )
  })),

  reset: () => set(initialState),

  submit: async () => {
    set({ loading: true, error: null, success: false });
    try {
      const state = get();
      // adminId removal: backend doesn't require it for registration anymore

      // Build address object as required by backend
      const addressObj = {
        blockNo: state.address?.blockNo || '',
        street: state.address?.street || '',
        landmark: state.address?.landmark || '',
      };

      // Coerce numeric fields where applicable
      const toNumberOr = (v, fallback) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      };
      const latitude = state.latitude !== '' && state.latitude !== null && state.latitude !== undefined ? toNumberOr(state.latitude, 0) : 0;
      const longitude = state.longitude !== '' && state.longitude !== null && state.longitude !== undefined ? toNumberOr(state.longitude, 0) : 0;
      const noOfBeds = state.noOfBeds !== '' && state.noOfBeds !== null && state.noOfBeds !== undefined ? toNumberOr(state.noOfBeds, 0) : 0;
      // Backend requires Establishment year as string
      const establishmentYear = state.establishmentYear !== undefined && state.establishmentYear !== null
        ? String(state.establishmentYear)
        : '';

      // Operating hours mapping
      const toUpper = (s) => String(s || '').toUpperCase();
      const opHours = state.schedule.filter(d => d.available).map((d) => {
        return {
          dayOfWeek: toUpper(d.day),
          isAvailable: true,
          is24Hours: d.is24Hours,
          timeRanges: d.is24Hours ? [] : d.sessions.map(s => ({
            startTime: s.startTime,
            endTime: s.endTime
          })),
        };
      });

      const toStringArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
          .map((v) => {
            if (v == null) return '';
            if (typeof v === 'string') return v;
            if (typeof v === 'object') return v.name || v.value || '';
            return String(v);
          })
          .map((s) => String(s).trim())
          .filter((s) => s.length > 0);
      };

      const sanitizeDocuments = (docs) => {
        if (!Array.isArray(docs)) return [];
        const out = [];
        for (const d of docs) {
          const url = String((d && d.url) || '').trim();
          const type = String((d && d.type) || '').trim();
          const noVal = (d && d.no) != null ? String(d.no).trim() : '';
          if (!url || !type || !noVal) continue; // essentials required
          const docOut = { type, url, no: noVal };
          const nameRaw = String((d && d.name) || '').trim();
          if (nameRaw) docOut.name = nameRaw;
          out.push(docOut);
        }
        return out;
      };

      const body = {
        name: state.name || '',
        type: state.type || '',
        emailId: String(state.emailId || ''),
        phone: String(state.phone || ''),
        address: addressObj,
        city: state.city || '',
        state: state.state || '',
        pincode: String(state.pincode || ''),
        url: state.url || '',
        logo: state.logo || '',
        image: state.image || '',
        latitude,
        longitude,
        medicalSpecialties: toStringArray(state.medicalSpecialties),
        hospitalServices: toStringArray(state.hospitalServices),
        accreditation: toStringArray(state.accreditation),
        establishmentYear,
        noOfBeds,
        operatingHours: opHours,
        adminId: state.adminId || '',
      };

      const res = await axiosInstance.post('/hospitals/onboarding/register-hospital', body);
      const httpOk = !!res && res.status >= 200 && res.status < 300;
      const data = res?.data || {};
      const apiOk = data.ok === true || data.success === true || /created|success/i.test(String(data.message || ''));
      if (!httpOk || !apiOk) throw new Error(data?.message || 'Failed to submit');

      // Extract hospitalId from response robustly
      const hospitalId = data.hospital?._id || data.data?._id || data._id || data.id;
      if (hospitalId) {
        set({ hospitalId });
      }

      // Success Toast
      useToastStore.getState().addToast({
        title: 'Success',
        message: 'Hospital details saved successfully',
        type: 'success'
      });

      set({ loading: false, success: true });
      return true;
    } catch (error) {
      // Extract detailed error messages if available (e.g. from a validation errors array)
      const apiErrors = error?.response?.data?.errors;
      let msg = error?.response?.data?.message || error.message || 'Failed to submit';

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        msg = apiErrors.map(e => e.message || e.msg || e).join(', ');
      }

      // Error Toast
      useToastStore.getState().addToast({
        title: 'Registration Error',
        message: msg,
        type: 'error',
        duration: 5000
      });

      set({ loading: false, error: msg, success: false });
      return false;
    }
  },

  submitDocuments: async () => {
    const state = get();
    if (!state.hospitalId) {
      useToastStore.getState().addToast({
        title: 'Error',
        message: 'Missing Hospital ID. Please complete the previous step first.',
        type: 'error'
      });
      return false;
    }

    set({ loading: true, error: null, success: false });
    try {
      const sanitizeDocuments = (docs) => {
        if (!Array.isArray(docs)) return [];
        const out = [];
        for (const d of docs) {
          const url = String((d && d.url) || '').trim();
          const type = String((d && d.type) || '').trim();
          const noVal = (d && d.no) != null ? String(d.no).trim() : '';
          if (!url || !type || !noVal) continue;
          const docOut = { type, url, no: noVal };
          out.push(docOut);
        }
        return out;
      };

      const body = {
        hospitalId: state.hospitalId,
        documents: sanitizeDocuments(state.documents)
      };

      const res = await axiosInstance.post('/hospitals/onboarding/save-documents', body);
      const httpOk = !!res && res.status >= 200 && res.status < 300;
      const data = res?.data || {};
      const apiOk = data.ok === true || data.success === true || /success/i.test(String(data.message || ''));

      if (!httpOk || !apiOk) throw new Error(data?.message || 'Failed to save documents');

      useToastStore.getState().addToast({
        title: 'Success',
        message: 'Documents stored successfully',
        type: 'success'
      });

      set({ loading: false, success: true });
      return true;
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      let msg = error?.response?.data?.message || error.message || 'Failed to save documents';
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        msg = apiErrors.map(e => e.message || e.msg || e).join(', ');
      }

      useToastStore.getState().addToast({
        title: 'Documents Error',
        message: msg,
        type: 'error',
        duration: 5000
      });

      set({ loading: false, error: msg, success: false });
      return false;
    }
  },

  fetchReviewData: async () => {
    const state = get();
    if (!state.hospitalId) return;

    set({ reviewLoading: true, error: null });
    try {
      const res = await getHospitalReviewDetails(state.hospitalId);
      if (res?.success) {
        set({ reviewData: res.data, reviewLoading: false });
      } else {
        throw new Error(res?.message || 'Failed to fetch review data');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to fetch review data';
      set({ reviewLoading: false, error: msg });
      // We don't necessarily want a toast here if it's an initial load, but maybe for debugging
    }
  },
}));

export default useHospitalRegistrationStore;
