import { create } from 'zustand';
import axios from '../lib/axios';
import useHospitalRegistrationStore from './useHospitalRegistrationStore';
import useDoctorRegistrationStore from './useDoctorRegistrationStore';
import useAuthStore from './useAuthStore';
import useDoctorStep1Store from './useDoctorStep1Store';

const useHospitalStep1Store = create((set, get) => ({
  form: {
    firstName: '',
    lastName: '',
    emailId: '',
    phone: '',
    gender: '',
    city: '',
    // MFA always enabled per requirements
    mfa: { emailId: true, phone: true },
    profilePhotoKey: '',
    isAlsoDoctor: false,
    role: 'HOSPITAL_ADMIN',
  },
  adminId: '',
  hospitalId: '',
  setField: (field, value) => set(state => {
    if (field in state) return { [field]: value };
    return { form: { ...state.form, [field]: value } };
  }),
  setMfa: (mfaField, value) => set(state => ({
    form: { ...state.form, mfa: { ...state.form.mfa, [mfaField]: value } }
  })),
  setProfilePhotoKey: (key) => set(state => ({
    form: { ...state.form, profilePhotoKey: key }
  })),
  resetForm: () => set({
    form: {
      firstName: '',
      lastName: '',
      emailId: '',
      phone: '',
      gender: '',
      city: '',
      mfa: { emailId: true, phone: true },
      profilePhotoKey: '',
      isAlsoDoctor: false,
      role: 'HOSPITAL_ADMIN',
    }
  }),
  submit: async () => {
    const { form } = get();
    try {
      // Build base payload expected by backend
      const isDoctor = Boolean(form.isAlsoDoctor);
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        emailId: form.emailId,
        phone: form.phone,
        gender: String(form.gender || '').toLowerCase(),
        mfa: {
          emailId: true,
          phone: true,
        },
        city: form.city,
        isAlsoDoctor: isDoctor,
        role: 'HOSPITAL_ADMIN',
      };

      // Only require and include profile photo when also a doctor
      if (isDoctor) {
        if (!form.profilePhotoKey) {
          throw new Error('Profile photo is required when the owner is also a doctor.');
        }
        payload.profilePhotoKey = form.profilePhotoKey;
      }

      const res = await axios.post('/auth/register', payload);
      const data = res?.data || {};

      const adminId = data?.data?.adminId || data?.adminId || data?.data?.userId || data?.userId || '';
      const hospitalId = data?.data?.hospitalId || data?.hospitalId || '';

      // Persist in this store's state
      set({ adminId: String(adminId), hospitalId: String(hospitalId) });

      if (adminId || hospitalId) {
        try {
          const { setField } = useHospitalRegistrationStore.getState();
          if (adminId) setField('adminId', String(adminId));
          if (hospitalId) setField('hospitalId', String(hospitalId));
        } catch (_) {
          // no-op
        }
      }
      // If owner is also a doctor, propagate the created user/doctor id into the doctor registration store
      if (isDoctor) {
        try {
          // Mirror extraction logic used in doctor Step1 for maximum compatibility
          const doctorId = data?.data?.doctorId || data?.doctorId || data?.data?.userId || data?.userId || adminId || '';
          if (doctorId) {
            const { setField: setDoctorField } = useDoctorRegistrationStore.getState();
            setDoctorField('userId', String(doctorId));
            // No longer mirror into doctor Step1 store; Hos_2 uses a dedicated store
            // Mirror into hospital doctor details store (Hos_2 dedicated)
            try {
              const setFieldHosDoc = (await import('./useHospitalDoctorDetailsStore')).default.getState().setField;
              setFieldHosDoc('userId', String(doctorId));
            } catch (_) { }
          }
        } catch (_) {
          // no-op
        }
      }
      // Extract and persist token for authenticated subsequent calls
      try {
        const token = data?.token || data?.accessToken || data?.data?.token || '';
        if (token) {
          const { setToken } = useAuthStore.getState();
          // Store raw token; interceptor will handle Bearer prefix
          setToken(String(token));
        }
      } catch (_) {
        // no-op
      }
      return data;
    } catch (err) {
      throw err;
    }
  },
}));

export default useHospitalStep1Store;
