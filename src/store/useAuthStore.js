import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Centralized auth store to keep and persist JWT/access token
const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      doctorDetails: null,
      doctorLoading: false,
      doctorError: '',
      _doctorFetchPromise: null,
      _doctorLastErrorAt: 0,
      _doctorErrorCooldownMs: 15000,
  // Set or update the access token (no implicit /doctors/me fetch)
      setToken: (token) => {
        // When the auth token changes (new login), clear previous cached doctorDetails
        set({ token, doctorDetails: null, doctorError: '', doctorLoading: false, _doctorFetchPromise: null });
      },
      // Optionally keep minimal user info if available from login
      setUser: (user) => set({ user }),
      // Clear all auth data (e.g., on logout or 401)
      clearAuth: () => set({ token: null, user: null, doctorDetails: null }),
      // Helpers
      isAuthenticated: () => Boolean(get().token),
      getAuthHeader: () => {
        const t = get().token;
        return t ? { Authorization: `Bearer ${t}` } : {};
      },
      fetchDoctorDetails: async (svc, { force = false } = {}) => {
        // svc should be getDoctorMe
        if (!get().token || !svc) return null;
        const state = get();
        const now = Date.now();
        // Cooldown after an error unless force
        if (!force && state.doctorError && (now - state._doctorLastErrorAt) < state._doctorErrorCooldownMs) {
          return null;
        }
        // If we already have details and not forcing, skip
        if (state.doctorDetails && !force) return state.doctorDetails;
        // If a request is already in-flight, return same promise
        if (state._doctorFetchPromise) return state._doctorFetchPromise;
        const promise = (async () => {
          set({ doctorLoading: true, doctorError: '' });
          try {
            const data = await svc();
            const doc = data?.data || data?.doctor || null;
            set({ doctorDetails: doc, doctorLoading: false, doctorFetchedAt: Date.now(), _doctorFetchPromise: null });
            return doc;
          } catch (e) {
            set({ doctorError: e?.response?.data?.message || e.message || 'Failed to load doctor', doctorLoading: false, _doctorFetchPromise: null, _doctorLastErrorAt: Date.now() });
            throw e;
          }
        })();
        set({ _doctorFetchPromise: promise });
        return promise;
      },
    }),
    {
      name: 'auth-store', // localStorage key
      version: 1,
      partialize: (state) => ({ token: state.token, user: state.user, doctorDetails: state.doctorDetails }),
    }
  )
);

export default useAuthStore;
