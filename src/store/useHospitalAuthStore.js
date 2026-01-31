import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useHospitalAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            roleNames: [],
            challengeId: null,
            hospitalId: null,
            loading: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setRoleNames: (roleNames) => set({ roleNames }),
            setChallengeId: (challengeId) => set({ challengeId }),
            setHospitalId: (hospitalId) => set({ hospitalId }),

            clearAuth: () => set({
                token: null,
                user: null,
                roleNames: [],
                challengeId: null,
                hospitalId: null
            }),

            login: async (payload) => {
                set({ loading: true });
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/auth/login', payload);

                    if (res.data?.success) {
                        const data = res.data.data;
                        if (payload.method === 'PASSWORD') {
                            set({
                                token: data.token,
                                roleNames: data.roleNames,
                                loading: false
                            });
                        } else if (payload.method === 'OTP') {
                            set({
                                challengeId: data.data.challengeId,
                                loading: false
                            });
                        }
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Login failed');
                } catch (error) {
                    set({ loading: false });
                    console.error('Hospital login error:', error);
                    throw error;
                }
            },

            verifyOtp: async (payload) => {
                set({ loading: true });
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/auth/verify-otp', payload);

                    if (res.data?.success) {
                        const data = res.data.data;
                        set({
                            token: data.token,
                            roleNames: data.roleNames,
                            loading: false
                        });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'OTP verification failed');
                } catch (error) {
                    set({ loading: false });
                    console.error('OTP verification error:', error);
                    throw error;
                }
            },

            fetchMe: async () => {
                set({ loading: true });
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.get('/hospitals/admin/me');

                    if (res.data?.success) {
                        set({
                            user: res.data.data,
                            hospitalId: res.data.data.hospitalId,
                            loading: false
                        });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Failed to fetch profile');
                } catch (error) {
                    set({ loading: false });
                    console.error('Fetch profile error:', error);
                    throw error;
                }
            },

            isAuthenticated: () => Boolean(get().token),
            getAuthHeader: () => {
                const t = get().token;
                return t ? { Authorization: `Bearer ${t}` } : {};
            },
        }),
        {
            name: 'hospital-auth-store',
            version: 1,
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                roleNames: state.roleNames,
                hospitalId: state.hospitalId
            }),
        }
    )
);

export default useHospitalAuthStore;
