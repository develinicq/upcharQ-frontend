import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFrontDeskAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            roleNames: [],
            loading: false,

            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            setRoleNames: (roleNames) => set({ roleNames }),

            clearAuth: () => set({
                token: null,
                user: null,
                roleNames: []
            }),

            fetchMe: async () => {
                set({ loading: true });
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.get('/staff/me');

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
                    console.error('Fetch front desk profile error:', error);

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
            name: 'front-desk-auth-store',
            version: 1,
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                roleNames: state.roleNames
            }),
        }
    )
);

export default useFrontDeskAuthStore;
