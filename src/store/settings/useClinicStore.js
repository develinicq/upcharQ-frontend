import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getClinicInfo,
  updateClinicInfo,
  getStaffClinicInfo,
  updateStaffClinicInfo,
} from "../../services/settings/clinicalService";

const useClinicStore = create(
  persist(
    (set, get) => ({
      hasClinic: false,
      clinic: null,
      selectedClinicId: null,
      selectedWorkplaceType: null,
      loading: false,
      error: null,

      setSelectedClinicId: (id, type) => set({ selectedClinicId: id, selectedWorkplaceType: type }),

      // Fetch clinic info
      fetchClinicInfo: async (params) => {
        console.log("useClinicStore fetchClinicInfo called with params:", params);
        set({ loading: true, error: null });
        try {
          // Robustly detect staff context: if we have isStaff flag or doctorId
          const isStaff = params?.isStaff || !!params?.doctorId;

          const response = isStaff
            ? await getStaffClinicInfo(params)
            : await getClinicInfo();

          if (response.success && response.data) {
            set({
              hasClinic: response.data.hasClinic || false,
              clinic: response.data.clinic || null,
              loading: false,
            });
            return response.data;
          }
        } catch (error) {
          set({
            error: error.message || "Failed to fetch clinic info",
            loading: false,
          });
          throw error;
        }
      },

      // Update clinic info
      updateClinicInfo: async (payload, params) => {
        set({ loading: true, error: null });
        try {
          const hasDoctorId = !!params?.doctorId;
          const response = hasDoctorId
            ? await updateStaffClinicInfo(payload, params)
            : await updateClinicInfo(payload);

          if (response.success) {
            // Refetch to get updated data
            await get().fetchClinicInfo(params);
            return response;
          }
        } catch (error) {
          set({
            error: error.message || "Failed to update clinic info",
            loading: false,
          });
          throw error;
        }
      },

      // Reset store
      reset: () =>
        set({
          hasClinic: false,
          clinic: null,
          selectedClinicId: null,
          selectedWorkplaceType: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "clinic-store",
      partialize: (state) => ({
        selectedClinicId: state.selectedClinicId,
        selectedWorkplaceType: state.selectedWorkplaceType,
        hasClinic: state.hasClinic,
      }),
    }
  )
);

export default useClinicStore;
