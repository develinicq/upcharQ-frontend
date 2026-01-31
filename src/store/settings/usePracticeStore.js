import { create } from "zustand";
import {
  getProfessionalDetails,
  updateMedicalRegistration as updateMedicalRegistrationService,
  updatePracticeDetails as updatePracticeDetailsService
} from "../../services/settings/professionalService";

const usePracticeStore = create((set, get) => ({
  medicalRegistration: null,
  practiceDetails: null,
  loading: false,
  error: null,

  fetchProfessionalDetails: async () => {
    set({ loading: true, error: null });
    try {
      const result = await getProfessionalDetails();
      
      set({
        medicalRegistration: result.data?.medicalRegistrationDetails ?? null,
        practiceDetails: result.data?.practiceDetails ?? null,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to fetch professional details",
      });
    }
  },

  updateMedicalRegistration: async (payload) => {
    set({ loading: true, error: null });
    try {
      await updateMedicalRegistrationService(payload);
      await get().fetchProfessionalDetails();
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to update medical registration",
      });
      throw error;
    }
  },

  updatePracticeDetails: async (payload) => {
    set({ loading: true, error: null });
    try {
      await updatePracticeDetailsService(payload);
      await get().fetchProfessionalDetails();
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to update practice details",
      });
      throw error;
    }
  }
}));

export default usePracticeStore;

