import { create } from "zustand";
import {
  getAwardsAndPublications,
  addAward as addAwardService,
  updateAward as updateAwardService,
  deleteAward as deleteAwardService,
  addPublication as addPublicationService,
  updatePublication as updatePublicationService,
  deletePublication as deletePublicationService
} from "../../services/settings/awardsPublicationsService";

const useAwardsPublicationsStore = create((set, get) => ({
  awards: [],
  publications: [],
  loading: false,
  error: null,

  fetchAwardsAndPublications: async () => {
    set({ loading: true, error: null });
    try {
      const result = await getAwardsAndPublications();

      set({
        awards: result.data?.awards ?? [],
        publications: result.data?.publications ?? [],
        loading: false,
      });

    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to fetch awards and publications",
      });
    }
  },

  addAward: async (payload) => {
    try {
      await addAwardService(payload);
      await get().fetchAwardsAndPublications();
    } catch (error) {
      throw error;
    }
  },

  updateAward: async (payload) => {
    try {
      await updateAwardService(payload);
      await get().fetchAwardsAndPublications();
    } catch (error) {
      throw error;
    }
  },

  deleteAward: async (awardId) => {
    try {
      await deleteAwardService(awardId);
      await get().fetchAwardsAndPublications();
    } catch (error) {
      throw error;
    }
  },

  addPublication: async (payload) => {
    try {
      await addPublicationService(payload);
      await get().fetchAwardsAndPublications();
    } catch (error) {
      throw error;
    }
  },

  updatePublication: async (payload) => {
    try {
      await updatePublicationService(payload);
      await get().fetchAwardsAndPublications();
    } catch (error) {
      throw error;
    }
  },

  deletePublication: async (id) => {
    try {
      await deletePublicationService(id);
      await get().fetchAwardsAndPublications();
    } catch (error) {
      throw error;
    }
  }
}));

export default useAwardsPublicationsStore;
