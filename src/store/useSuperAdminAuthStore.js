import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Centralized auth store to keep and persist JWT/access token for SuperAdmin
const useSuperAdminAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            challengeId: null,
            // Set or update the access token
            setToken: (token) => {
                set({ token });
            },
            // Optionally keep minimal user info if available from login
            setUser: (user) => set({ user }),
            // Clear all auth data (e.g., on logout or 401)
            clearAuth: () => set({ token: null, user: null, challengeId: null }),
            // Fetch profile data from API
            fetchProfile: async () => {
                const { token } = get();
                if (!token) return;
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.get('/superAdmin/me');
                    if (res.data?.success && res.data?.data) {
                        set({ user: res.data.data });
                    }
                } catch (error) {
                    console.error('Failed to fetch superAdmin profile:', error);
                }
            },
            // Request OTP for changing existing contact (email/mobile)
            requestVerificationOtp: async (type) => {
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/superAdmin/contact/verify-existing', { type });
                    if (res.data?.success && res.data?.data?.challengeId) {
                        set({ challengeId: res.data.data.challengeId });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Failed to send OTP');
                } catch (error) {
                    console.error('Failed to request verification OTP:', error);
                    throw error;
                }
            },
            // Verify OTP for existing contact
            verifyExistingOtp: async (payload) => {
                try {
                    const { challengeId } = get();
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/superAdmin/contact/verify-existing-otp', {
                        challengeId,
                        ...payload
                    });
                    return res.data;
                } catch (error) {
                    console.error('Failed to verify OTP:', error);
                    throw new Error(error.response?.data?.message || error.message || 'Failed to verify OTP');
                }
            },
            // Send OTP to new contact (email/mobile)
            sendNewOtp: async (payload) => {
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/superAdmin/contact/send-new-otp', payload);
                    if (res.data?.success && res.data?.data?.challengeId) {
                        set({ challengeId: res.data.data.challengeId });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Failed to send OTP to new contact');
                } catch (error) {
                    console.error('Failed to send new contact OTP:', error);
                    throw error;
                }
            },
            // Verify OTP for new contact
            verifyNewContact: async (payload) => {
                try {
                    const { challengeId } = get();
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/superAdmin/contact/verify-new', {
                        challengeId,
                        ...payload
                    });
                    if (res.data?.success) {
                        // Optionally refresh profile if needed, or let component handle it
                        await get().fetchProfile();
                    }
                    return res.data;
                } catch (error) {
                    console.error('Failed to verify new contact:', error);
                    throw new Error(error.response?.data?.message || error.message || 'Failed to verify new contact');
                }
            },
            // Request password change
            requestPasswordChange: async (currentPassword) => {
                try {
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/superAdmin/password/change-request', { currentPassword });
                    if (res.data?.success && res.data?.data?.challengeId) {
                        set({ challengeId: res.data.data.challengeId });
                        return res.data;
                    }
                    throw new Error(res.data?.message || 'Failed to request password change');
                } catch (error) {
                    console.error('Failed to request password change:', error);
                    throw new Error(error.response?.data?.message || error.message || 'Failed to request password change');
                }
            },
            // Confirm password change
            confirmPasswordChange: async (payload) => {
                try {
                    const { challengeId } = get();
                    const axiosInstance = (await import('../lib/axios')).default;
                    const res = await axiosInstance.post('/superAdmin/password/change-confirm', {
                        challengeId,
                        ...payload
                    });
                    return res.data;
                } catch (error) {
                    console.error('Failed to confirm password change:', error);
                    throw new Error(error.response?.data?.message || error.message || 'Failed to confirm password change');
                }
            },
            // Helpers
            isAuthenticated: () => Boolean(get().token),
            getAuthHeader: () => {
                const t = get().token;
                return t ? { Authorization: `Bearer ${t}` } : {};
            },
        }),
        {
            name: 'superadmin-auth-store', // Unique localStorage key for SuperAdmin
            version: 1,
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);

export default useSuperAdminAuthStore;
