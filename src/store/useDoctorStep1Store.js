import { create } from 'zustand';
import axios from '../lib/axios';
import useDoctorRegistrationStore from './useDoctorRegistrationStore';

const initialState = {
  firstName: '',
  lastName: '',
  emailId: '',
  phone: '',
  gender: '',
  city: '',
  mfa: {
    emailId: true,
    phone: true,
  },
  profilePhotoKey: '',
  role: 'DOCTOR',
  loading: false,
  error: null,
  success: false,
};

const useDoctorStep1Store = create((set) => ({
  ...initialState,
  setField: (field, value) => set((state) => ({
    ...state,
    [field]: value,
  })),
  setMfaField: (field, value) => set((state) => ({
    ...state,
    mfa: {
      ...state.mfa,
      [field]: value,
    },
  })),
  reset: () => set(initialState),
  submit: async () => {
    set({ loading: true, error: null, success: false });
    try {
      const {
        firstName,
        lastName,
        emailId,
        phone,
        gender,
        city,
        mfa,
        profilePhotoKey,
  role,
      } = useDoctorStep1Store.getState();

      const body = {
        firstName,
        lastName,
        emailId,
        phone,
  gender: String(gender || '').toLowerCase(),
        city,
        mfa,
        profilePhotoKey,
        role: 'DOCTOR',
      };

      const res = await axios.post('/auth/register', body);

      const httpOk = !!res && res.status >= 200 && res.status < 300;
      const resp = res?.data || {};
      const apiOk = resp.ok === true || resp.success === true || /created|success/i.test(String(resp.message || ''));

      // Extract doctorId (userId for next steps) from response
      const doctorId = resp?.data?.doctorId
        || resp?.doctorId
        || resp?.data?.userId;

      if (!httpOk || !apiOk || !doctorId) {
        const apiMsg = resp?.message || 'Doctor was not created.';
        const err = new Error(apiMsg);
        err.code = 'ERR_DOCTOR_NOT_CREATED';
        throw err;
      }

      // Persist into the doctor registration store for subsequent steps
      try {
        const { setField } = useDoctorRegistrationStore.getState();
        setField('userId', doctorId);
      } catch (_) {
        // no-op if store not available
      }

      set({ success: true });
      setTimeout(() => set({ success: false }), 100);
      return { success: true, doctorId };
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Registration failed';
      set({ error: msg, success: false });
      return { success: false, error: msg };
    } finally {
      set({ loading: false });
    }
  },
}));

export default useDoctorStep1Store;
