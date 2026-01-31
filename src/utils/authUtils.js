import useAuthStore from '../store/useAuthStore';
import useDoctorAuthStore from '../store/useDoctorAuthStore';
import useHospitalAuthStore from '../store/useHospitalAuthStore';
import useSuperAdminAuthStore from '../store/useSuperAdminAuthStore';
import useFrontDeskAuthStore from '../store/useFrontDeskAuthStore';
import useHospitalFrontDeskAuthStore from '../store/useHospitalFrontDeskAuthStore';
import useUIStore from '../store/useUIStore';

// Data stores that should be cleared on logout
import useDoctorPatientListStore from '../store/useDoctorPatientListStore';
import useDoctorAnalyticsStore from '../store/useDoctorAnalyticsStore';
import useOOOStore from '../store/useOOOStore';
import useClinicStore from '../store/settings/useClinicStore';
import useHospitalRegistrationStore from '../store/useHospitalRegistrationStore';
import useDoctorRegistrationStore from '../store/useDoctorRegistrationStore';
import useHospitalStep1Store from '../store/useHospitalStep1Store';
import useDoctorStep1Store from '../store/useDoctorStep1Store';

/**
 * Clears all authentication tokens and session data from all stores.
 * This ensures no stale session data remains regardless of which module the user was in.
 */
export const logoutAll = () => {
    // 1. Set global logging out state (can be used for UI loaders/logic)
    useUIStore.getState().setIsLoggingOut(true);

    // 2. Clear all Auth Stores (Tokens and User Info)
    useAuthStore.getState().clearAuth();
    useDoctorAuthStore.getState().clearAuth();
    useHospitalAuthStore.getState().clearAuth();
    useSuperAdminAuthStore.getState().clearAuth();
    useFrontDeskAuthStore.getState().clearAuth();
    useHospitalFrontDeskAuthStore.getState().clearAuth();

    // 3. Clear relevant Data Stores
    if (useDoctorPatientListStore.getState().clearPatientsStore) {
        useDoctorPatientListStore.getState().clearPatientsStore();
    }

    // Some stores might not have a clear method, so we manually reset if needed
    // or just let the auth clear be sufficient for re-fetch prevention.

    // useOOOStore doesn't have a clearAuth, but we can set oooData to null
    useOOOStore.setState({ oooData: null, loading: false, error: null });

    // 4. Clear Clinic/Workplace Stores
    useClinicStore.getState().reset();

    // 5. Clear Registration / Onboarding Stores
    useHospitalRegistrationStore.getState().reset();
    useDoctorRegistrationStore.getState().reset();
    useHospitalStep1Store.getState().reset();
    useDoctorStep1Store.getState().reset();

    // 5. Force a reload or navigation will happen in the caller (Navbar)
};
