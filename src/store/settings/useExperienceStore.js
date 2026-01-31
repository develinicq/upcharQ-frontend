import { create } from "zustand";
import {
  getExperiences,
  addExperience as addExperienceService,
  updateExperience as updateExperienceService,
  deleteExperience as deleteExperienceService
} from "../../services/settings/experienceService";

const useExperienceStore = create((set, get) => ({
  experiences: [],
  loading: false,
  error: null,

  fetchExperiences: async () => {
    set({ loading: true, error: null });
    try {
      const result = await getExperiences();

      set({
        experiences: result.data?.experiences ?? [],
        loading: false,
      });

    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to fetch experiences",
      });
    }
  },

  addExperience: async (payload) => {
    try {
      await addExperienceService(payload);
      await get().fetchExperiences();
    } catch (error) {
      throw error;
    }
  },

  updateExperience: async (payload) => {
    try {
      await updateExperienceService(payload);
      await get().fetchExperiences();
    } catch (error) {
      throw error;
    }
  },

  deleteExperience: async (experienceId) => {
    try {
      await deleteExperienceService(experienceId);
      await get().fetchExperiences();
    } catch (error) {
      throw error;
    }
  }
}));

export default useExperienceStore;
