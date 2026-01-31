import { create } from 'zustand';
import axiosInstance from '../lib/axios';

const initialState = {
  // Step 1 (captured from Step1 response)
  userId: '',
  specialization: '',
  experienceYears: '',
  medicalCouncilName: '',
  medicalCouncilRegYear: '',
  medicalCouncilRegNo: '',
  medicalDegreeType: '',
  medicalDegreeUniversityName: '',
  medicalDegreeYearOfCompletion: '',
  pgMedicalDegreeType: '',
  pgMedicalDegreeUniversityName: '',
  pgMedicalDegreeYearOfCompletion: '',

  // Step 3
  hasClinic: true,
  clinicData: {
    name: '',
    email: '',
    phone: '',
    proof: '', // file key/url
    latitude: '',
    longitude: '',
    blockNo: '',
    areaStreet: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    image: '', // file key/url
    panCard: '',
  },

  // Step 4/5
  documents: [], // [{ no, type, url }]
  // Additional practice specializations
  additionalPractices: [], // [{ specialization: {name, value}, experienceYears: '2' }]

  loading: false,
  error: null,
  success: false,
};

const useDoctorRegistrationStore = create((set, get) => ({
  ...initialState,
  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setClinicField: (field, value) => set((state) => ({
    ...state,
    clinicData: { ...state.clinicData, [field]: value },
  })),
  addPractice: () => set((state) => ({
    ...state,
    additionalPractices: [...state.additionalPractices, { specialization: null, experienceYears: '' }],
  })),
  updatePractice: (index, patch) => set((state) => ({
    ...state,
    additionalPractices: state.additionalPractices.map((p, i) => i === index ? { ...p, ...patch } : p),
  })),
  removePractice: (index) => set((state) => ({
    ...state,
    additionalPractices: state.additionalPractices.filter((_, i) => i !== index),
  })),
  setDocument: (doc) => set((state) => ({
    ...state,
    documents: [...state.documents.filter(d => d.no !== doc.no), doc],
  })),
  setDocuments: (docs) => set({ documents: docs }),
  reset: () => set(initialState),
  submit: async () => {
    set({ loading: true, error: null, success: false });
    try {
      const state = get();
      // Ensure Step 1 has provided the userId
      if (!state.userId) {
        const e = new Error('ERR_MISSING_USER_ID');
        e.code = 'ERR_MISSING_USER_ID';
        throw e;
      }
      // Build specialization array [{ name, expYears }]
      const mainSpecObj = typeof state.specialization === 'object'
        ? state.specialization
        : (state.specialization ? { name: state.specialization, value: state.specialization } : null);
      if (!mainSpecObj || !(mainSpecObj.value || mainSpecObj.name)) {
        const e = new Error('ERR_MISSING_SPECIALIZATION');
        e.code = 'ERR_MISSING_SPECIALIZATION';
        throw e;
      }
      const toStr = (v, fallback = '') => (v !== undefined && v !== null && v !== '' ? String(v) : fallback);
      // Ensure experience years is a string of digits as required by backend validation
      const toExpYearsStr = (v, fallback = '0') => {
        const s = v !== undefined && v !== null ? String(v).trim() : '';
        if (!s) return fallback;
        const n = Number.parseInt(s, 10);
        return Number.isFinite(n) ? String(n) : fallback;
      };
      const specializationArr = [];
      const primaryName = (mainSpecObj.name || mainSpecObj.value)?.toString().trim();
      if (primaryName) {
        specializationArr.push({ name: primaryName, expYears: toExpYearsStr(state.experienceYears, '0') });
      }
      if (Array.isArray(state.additionalPractices)) {
        state.additionalPractices.forEach((p) => {
          const spec = p?.specialization;
          const nmRaw = typeof spec === 'object' ? (spec?.name || spec?.value) : spec;
          const nm = nmRaw?.toString().trim();
          if (nm) specializationArr.push({ name: nm, expYears: toExpYearsStr(p?.experienceYears, '0') });
        });
      }
      // Build education array per new API schema
      const education = [];
      const ugDegree = (state.medicalDegreeType || '').toString().trim();
      const ugInstitute = (state.medicalDegreeUniversityName || '').toString().trim();
      const ugYearStr = toStr(state.medicalDegreeYearOfCompletion, '');
      const ugYearNum = ugYearStr && /^\d{4}$/.test(ugYearStr) ? Number(ugYearStr) : undefined;
      if (ugDegree || ugInstitute || ugYearNum) {
        education.push({
          instituteName: ugInstitute || undefined,
          graduationType: 'UG',
          degree: ugDegree || undefined,
          completionYear: ugYearNum !== undefined ? ugYearNum : undefined,
        });
      }
      const pgDegree = (state.pgMedicalDegreeType || '').toString().trim();
      const pgInstitute = (state.pgMedicalDegreeUniversityName || '').toString().trim();
      const pgYearStr = toStr(state.pgMedicalDegreeYearOfCompletion, '');
      const pgYearNum = pgYearStr && /^\d{4}$/.test(pgYearStr) ? Number(pgYearStr) : undefined;
      if (pgDegree || pgInstitute || pgYearNum) {
        education.push({
          instituteName: pgInstitute || undefined,
          graduationType: 'PG',
          degree: pgDegree || undefined,
          completionYear: pgYearNum !== undefined ? pgYearNum : undefined,
        });
      }

      // Map documents to { no, type, fileName, tempKey }
      const documents = Array.isArray(state.documents)
        ? state.documents
            .filter((d) => d && d.type && (d.tempKey || d.url) && (d.no !== undefined && d.no !== null))
            .map((d) => ({
              no: d.no,
              type: d.type,
              fileName: d.fileName || d.name || 'document',
              tempKey: d.tempKey || d.url,
            }))
        : [];

      // Compose the body for new API schema
      const body = {
        userId: String(state.userId),
        specialization: specializationArr,
        medicalCouncilName: state.medicalCouncilName,
        medicalCouncilRegYear: toStr(state.medicalCouncilRegYear, ''),
        medicalCouncilRegNo: state.medicalCouncilRegNo,
        ...(education.length > 0 ? { education } : {}),
        hasClinic: !!state.hasClinic,
      };
      // Only include clinicData if hasClinic is true and values present
      if (state.hasClinic && state.clinicData && Object.values(state.clinicData).some(v => v !== '' && v !== null && v !== undefined)) {
        body.clinicData = {};
        Object.entries(state.clinicData).forEach(([k, v]) => {
          // Skip fields not allowed by backend schema
          if (k === 'proof' || k === 'image') return;
          if (v !== '' && v !== null && v !== undefined) {
            body.clinicData[k] = v;
          }
        });
        if (body.clinicData.latitude !== undefined) {
          const nlat = Number(state.clinicData.latitude);
          if (Number.isFinite(nlat)) body.clinicData.latitude = nlat;
        }
        if (body.clinicData.longitude !== undefined) {
          const nlon = Number(state.clinicData.longitude);
          if (Number.isFinite(nlon)) body.clinicData.longitude = nlon;
        }
      }
      if (documents.length > 0) {
        body.documents = documents;
      }

      const res = await axiosInstance.post('/doctors/create', body);
      const status = res?.status || 0;
      const ok = status >= 200 && status < 300;
      const resp = res?.data || {};
      if (!ok) {
        const apiMsg = resp?.message || resp?.error || 'ERR_SUBMIT_FAILED';
        const e = new Error(apiMsg);
        e.code = 'ERR_SUBMIT_FAILED';
        throw e;
      }
      set({ loading: false, success: true });
      return true;
    } catch (error) {
      // Prefer backend message if available
      const resp = error?.response?.data;
      const backendMsg = resp?.message || (Array.isArray(resp?.errors) && resp.errors[0]?.message) || undefined;
      const msg = backendMsg || error.code || error.message || 'ERR_SUBMIT_FAILED';
      set({ loading: false, error: msg, success: false });
      return false;
    }
  },
}));

export default useDoctorRegistrationStore;
