import { create } from "zustand";
import {
    getDoctorConsultationDetails,
    putDoctorConsultationDetails,
    getStaffConsultationDetails,
    putStaffConsultationDetails,
} from "../../services/doctorConsultationService";

export const DEFAULT_SCHEDULE = [
    { day: "Monday", available: true, sessions: [] },
    { day: "Tuesday", available: false, sessions: [] },
    { day: "Wednesday", available: false, sessions: [] },
    { day: "Thursday", available: false, sessions: [] },
    { day: "Friday", available: false, sessions: [] },
    { day: "Saturday", available: false, sessions: [] },
    { day: "Sunday", available: false, sessions: [] },
];

export const DEFAULT_CONSULTATION_DETAILS = {
    consultationFees: [
        {
            consultationFee: "",
            followUpFee: "",
            autoApprove: false,
            avgDurationMinutes: 0,
            availabilityDurationDays: undefined,
        },
    ],
    slotTemplates: {
        schedule: DEFAULT_SCHEDULE.map((d) => ({ ...d })),
    },
};

const useConsultationStore = create((set, get) => ({
    consultationDetails: DEFAULT_CONSULTATION_DETAILS,
    initialConsultationDetails: DEFAULT_CONSULTATION_DETAILS,
    loading: false,
    saving: false,
    fetchError: null,
    saveError: null,
    isDirty: false,
    lastFetchedParams: null,

    setConsultationDetails: (details) => set({ consultationDetails: details, isDirty: true }),

    setDirty: (isDirty) => set({ isDirty }),

    fetchConsultationDetails: async (params) => {
        if (!params || (!params.hospitalId && !params.clinicId)) return;
        const { lastFetchedParams, consultationDetails } = get();

        // Check if params are the same and data exists (not DEFAULT)
        const isSameParams = lastFetchedParams &&
            lastFetchedParams.clinicId === params.clinicId &&
            lastFetchedParams.hospitalId === params.hospitalId &&
            lastFetchedParams.doctorId === params.doctorId;

        if (isSameParams && consultationDetails !== DEFAULT_CONSULTATION_DETAILS) {
            console.log("[useConsultationStore] Skipping fetch: Params same and data exists.");
            return;
        }

        set({ loading: true, fetchError: null });
        try {
            const hasDoctorId = !!params.doctorId;
            const response = hasDoctorId
                ? await getStaffConsultationDetails(params)
                : await getDoctorConsultationDetails(params);

            if (response.success && response.data) {
                const data = response.data;

                // Map API data to UI structure if needed
                const schedule = data.slotTemplates?.schedule?.length
                    ? data.slotTemplates.schedule
                    : DEFAULT_SCHEDULE.map((d) => ({ ...d }));

                const fees = Array.isArray(data.consultationFees) && data.consultationFees.length
                    ? data.consultationFees.map(f => ({
                        ...f,
                        // Map availabilityDays to availabilityDurationDays if needed
                        availabilityDurationDays: f.availabilityDurationDays ?? f.availabilityDays
                    }))
                    : DEFAULT_CONSULTATION_DETAILS.consultationFees;

                const details = {
                    consultationFees: fees,
                    slotTemplates: { schedule },
                };

                set({
                    consultationDetails: details,
                    initialConsultationDetails: JSON.parse(JSON.stringify(details)), // Deep copy for comparison
                    loading: false,
                    isDirty: false,
                    lastFetchedParams: params,
                });
            } else {
                set({
                    consultationDetails: DEFAULT_CONSULTATION_DETAILS,
                    loading: false,
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Failed to fetch consultation details";
            set({
                fetchError: message,
                loading: false,
                consultationDetails: DEFAULT_CONSULTATION_DETAILS,
            });
        }
    },

    updateConsultationDetails: async (payload, params = null) => {
        console.log("[useConsultationStore] updateConsultationDetails called");
        const { initialConsultationDetails, consultationDetails } = get();

        set({ saving: true, saveError: null });
        try {
            const hasDoctorId = !!params?.doctorId;

            // Simple diffing helper
            const getDiff = (cur, init) => {
                const diff = {};
                // Compare consultationFees
                const curFees = cur.consultationFees || [];
                const initFees = init.consultationFees || [];

                if (JSON.stringify(curFees) !== JSON.stringify(initFees)) {
                    diff.consultationFees = payload.consultationFees;
                }

                // Compare schedule
                if (JSON.stringify(cur.slotTemplates.schedule) !== JSON.stringify(init.slotTemplates.schedule)) {
                    diff.slotDetails = payload.slotDetails;
                }
                return diff;
            };

            const finalPayload = getDiff(consultationDetails, initialConsultationDetails);

            let response;
            if (hasDoctorId) {
                // For staff, passparams as query params
                response = await putStaffConsultationDetails(finalPayload, params);
            } else {
                response = await putDoctorConsultationDetails(finalPayload);
            }

            console.log("[useConsultationStore] updateConsultationDetails success response:", response);
            if (response.success) {
                set({
                    saving: false,
                    isDirty: false,
                    initialConsultationDetails: JSON.parse(JSON.stringify(consultationDetails))
                });
                return response;
            }
            throw new Error(response?.message || "Update failed");
        } catch (error) {
            console.error("[useConsultationStore] updateConsultationDetails ERROR:", error);
            const message = error.response?.data?.message || error.message || "Failed to update consultation details";
            set({
                saveError: message,
                saving: false,
            });
            throw error;
        }
    },

    reset: () => set({
        consultationDetails: DEFAULT_CONSULTATION_DETAILS,
        loading: false,
        saving: false,
        fetchError: null,
        saveError: null,
        isDirty: false,
    }),
}));

export default useConsultationStore;
