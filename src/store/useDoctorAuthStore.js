import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDoctorAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            roleNames: [],
            challengeId: null,
            loading: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setRoleNames: (roleNames) => set({ roleNames }),
            setChallengeId: (challengeId) => set({ challengeId }),

            clearAuth: () => set({
                token: null,
                user: null,
                roleNames: [],
                challengeId: null
            }),

            login: async (payload) => {
                set({ loading: true });
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/auth/login', payload);

                    if (res.data?.success) {
                        const data = res.data.data;
                        if (payload.method === 'PASSWORD') {
                            const roles = data.roleNames || [];
                            if (roles.includes("DOCTOR")) {
                                set({
                                    token: data.token,
                                    roleNames: data.roleNames,
                                    loading: false
                                });
                            } else {
                                set({ loading: false });
                            }
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
                    console.error('Doctor login error:', error);
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
                        const roles = data.roleNames || [];
                        if (roles.includes("DOCTOR")) {
                            set({
                                token: data.token,
                                roleNames: data.roleNames,
                                loading: false
                            });
                        } else {
                            set({ loading: false });
                        }
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
                    const res = await axiosInstance.get('/doctors/me');

                    if (res.data?.success) {
                        set({
                            user: res.data.data,
                            loading: false
                        });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Failed to fetch profile');
                } catch (error) {
                    set({ loading: false });
                    console.error('Fetch profile error:', error);

                    // Clear auth on 401 (invalid/expired token)
                    if (error.response?.status === 401) {
                        console.log('Token invalid/expired. Clearing doctor auth.');
                        get().clearAuth();
                    }

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
            name: 'doctor-auth-store',
            version: 1,
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                roleNames: state.roleNames
            }),
        }
    )
);

export default useDoctorAuthStore;
