import { create } from 'zustand';
import { getDoctorDashboardAnalytics } from '../services/doctorService';

const useDoctorAnalyticsStore = create((set, get) => ({
    analytics: null,
    loading: false,
    lastFetchedParams: null,

    fetchAnalytics: async (params) => {
        const { lastFetchedParams } = get();

        // Deep comparison of params to avoid redundant fetching
        const isSameParams = lastFetchedParams &&
            lastFetchedParams.clinicId === params.clinicId &&
            lastFetchedParams.aggregationType === params.aggregationType &&
            lastFetchedParams.month === params.month &&
            lastFetchedParams.year === params.year;

        if (isSameParams && get().analytics) {
            console.log("[useDoctorAnalyticsStore] Skipping fetch: Params same and data exists.");
            return;
        }

        set({ loading: true });
        try {
            const res = await getDoctorDashboardAnalytics(params);
            if (res.success) {
                set({ analytics: res.data, lastFetchedParams: params });
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            set({ loading: false });
        }
    },

    setAnalytics: (data) => set({ analytics: data }),
    clearAnalytics: () => set({ analytics: null, lastFetchedParams: null })
}));

export default useDoctorAnalyticsStore;
