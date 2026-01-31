import { create } from "zustand";
import { getDoctorBasicInfo, updateDoctorBasicInfo } from "../../services/settings/doctorSettingService";

const initialState = {
  profile: {
    basic: null,
    education: [],
    awards: [],
    publications: [],
    experiences: [],
    professional: {
      registration: {},
      practice: {},
    },
  },
  loading: false,
  error: null,
  success: false,
};

const normalizeBasicInfo = (raw) => ({
  firstName: raw.firstName ?? "",
  lastName: raw.lastName ?? "",
  name: `Dr. ${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim(),
  phone: raw.phone ?? "",
  email: raw.emailId ?? "",
  gender: raw.gender ?? "",
  city: raw.city ?? "",
  website: raw.website ?? "-",
  headline: raw.headline ?? "",
  about: raw.about ?? "",
  languages: Array.isArray(raw.languages) ? raw.languages : [],
});

const useProfileStore = create((set, get) => ({
  ...initialState,

  setProfile: (patch) =>
    set((state) => ({
      profile: typeof patch === "function" ? patch(state.profile) : patch,
    })),

  fetchBasicInfo: async () => {
    set({ loading: true, error: null });

    try {
      const result = await getDoctorBasicInfo(); // <<---- fixed
      const basic = normalizeBasicInfo(result.data);

      set((state) => ({
        profile: {
          ...state.profile,
          basic,
        },
        loading: false,
        success: true,
      }));

      return basic;
    } catch (error) {
      const msg =
        error?.message || "Failed to load basic info";
      set({ loading: false, error: msg, success: false });
      return null;
    }
  },

  updateBasicInfo: async (payload) => {
    set({ loading: true, error: null });

    try {
      const result = await updateDoctorBasicInfo(payload); // <<--- use service here too
      
      const basic = normalizeBasicInfo(result.data);

      set((state) => ({
        profile: {
          ...state.profile,
          basic,
        },
        loading: false,
        success: true,
      }));

      return basic;
    } catch (error) {
      const msg =
        error?.message || "Failed to update basic info";
      set({ loading: false, error: msg, success: false });
      return null;
    }
  },

  resetProfileStore: () => set(initialState),
}));

export default useProfileStore;
