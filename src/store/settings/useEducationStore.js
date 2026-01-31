import { create } from "zustand";
import axiosInstance from "../../lib/axios.js";

const useEducationStore = create((set, get) => ({
  education: [],        // array list of education objects
  loading: false,
  error: null,
  success: false,

  // Local UI update (no backend call)
  setEducationLocal: (updater) =>
    set((state) => ({
      education:
        typeof updater === "function"
          ? updater(state.education)
          : updater,
    })),

  // GET education list
  fetchEducation: async () => {
    set({ loading: true, error: null, success: false });

    try {
      const res = await axiosInstance.get(
        "/doctors/my-account/personal-info/educational-details"
      );

      // API returns: { success, message, data: { education: [...] } }
      const list = res?.data?.data?.education ?? [];
      set({
        education: Array.isArray(list) ? list : [],
        loading: false,
        success: true,
      });

      return list;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to load education";

      console.error("fetchEducation failed:", msg);

      set({ loading: false, error: msg, success: false });
      return null;
    }
  },

  // POST create education entry
  addEducation: async (payload) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.post(
        "/doctors/my-account/personal-info/educational-details",
        payload
      );

      // Refresh list after adding
      await get().fetchEducation();

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to add education";

      console.error("addEducation failed:", msg);

      set({ loading: false, error: msg });
      return null;
    }
  },

  // PUT update education entry
  updateEducation: async (id, payload) => {
    set({ loading: true, error: null });

    try {
      // Backend expects ID in the body, not in URL
      const res = await axiosInstance.put(
        `/doctors/my-account/personal-info/educational-details`,
        { id, ...payload }
      );

      await get().fetchEducation();

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to update education";

      console.error("updateEducation failed:", msg);

      set({ loading: false, error: msg });
      return null;
    }
  },

  // DELETE education entry
  deleteEducation: async (id) => {
    set({ loading: true, error: null });

    try {
      const res = await axiosInstance.delete(
        `/doctors/my-account/personal-info/educational-details/${id}`
      );

      await get().fetchEducation();

      return res.data;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to delete education";

      console.error("deleteEducation failed:", msg);

      set({ loading: false, error: msg });
      return null;
    }
  },

  resetEducationStore: () =>
    set({
      education: [],
      loading: false,
      error: null,
      success: false,
    }),
}));

export default useEducationStore;
