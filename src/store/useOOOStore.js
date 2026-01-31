import { create } from 'zustand';
import { getOutOfOfficeStatus, updateOutOfOfficeStatus } from '../services/doctorService';

const useOOOStore = create((set, get) => ({
    oooData: null,
    loading: false,
    error: null,

    fetchOOOStatus: async () => {
        if (get().oooData && !get().loading) {
            return get().oooData;
        }
        set({ loading: true, error: null });
        try {
            const res = await getOutOfOfficeStatus();
            if (res.success) {
                set({ oooData: res.data, loading: false });
                return res.data;
            }
            throw new Error(res.message || 'Failed to fetch OOO status');
        } catch (err) {
            set({ error: err.message, loading: false });
            console.error('Error fetching OOO status:', err);
        }
    },

    updateOOOStatus: async (payload) => {
        set({ loading: true, error: null });
        try {
            const res = await updateOutOfOfficeStatus(payload);
            if (res.success) {
                // Fetch the verified status from server after update
                const latestRes = await getOutOfOfficeStatus();
                const latestData = latestRes.success ? latestRes.data : {
                    isOutOfOffice: payload.isOutOfOffice,
                    OutOfOfficeStart: payload.OutOfOfficeStart,
                    OutOfOfficeEnd: payload.OutOfOfficeEnd
                };
                set({ oooData: latestData, loading: false });
                return latestData;
            }
            throw new Error(res.message || 'Failed to update OOO status');
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    setOOOData: (data) => set({ oooData: data })
}));

export default useOOOStore;
