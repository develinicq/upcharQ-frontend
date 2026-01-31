import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useHospitalFrontDeskAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            roleNames: [],
            hospitalId: null,
            clinicId: null,
            doctorId: null,
            loading: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setRoleNames: (roleNames) => set({ roleNames }),
            setHospitalId: (hospitalId) => set({ hospitalId }),
            setClinicId: (clinicId) => set({ clinicId }),
            setDoctorId: (doctorId) => set({ doctorId }),

            clearAuth: () => set({
                token: null,
                user: null,
                roleNames: [],
                hospitalId: null,
                clinicId: null,
                doctorId: null
            }),

            fetchMe: async () => {
                set({ loading: true });
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.get('/staff/me');

                    if (res.data?.success) {
                        const data = res.data.data;
                        set({
                            user: data,
                            hospitalId: data.hospitalId,
                            clinicId: data.hospitalId, // For HFD, clinic settings are hospital-level
                            doctorId: data.staffId,    // Use staffId as doctorId for staff context
                            loading: false
                        });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Failed to fetch profile');
                } catch (error) {
                    set({ loading: false });
                    console.error('Fetch hospital front desk profile error:', error);

                    // Clear auth on 401 (invalid/expired token)
                    if (error.response?.status === 401) {
                        get().clearAuth();
                    }

                    throw error;
                }
            },

            // Helper to check auth
            isAuthenticated: () => Boolean(get().token),
            getAuthHeader: () => {
                const t = get().token;
                return t ? { Authorization: `Bearer ${t}` } : {};
            },
        }),
        {
            name: 'hospital-front-desk-auth-store',
            version: 1,
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                roleNames: state.roleNames,
                hospitalId: state.hospitalId,
                clinicId: state.clinicId,
                doctorId: state.doctorId
            }),
        }
    )
);

export default useHospitalFrontDeskAuthStore;
