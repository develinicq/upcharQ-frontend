import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import useSuperAdminAuthStore from "../store/useSuperAdminAuthStore";

// Normalize base URL to always include '/api' segment
const raw = (import.meta.env.VITE_API_BASE_URL || '').trim();
let baseURL;
if (!raw) {
  baseURL = '/api';
} else {
  const noTrail = raw.replace(/\/$/, '');
  // If already ends with /api or contains /api at the end, don't duplicate
  baseURL = /\/api\/?$/.test(noTrail) ? noTrail : `${noTrail}/api`;
}

const axiosInstance = axios.create({
  baseURL,
  headers: { Accept: 'application/json' }
});

// Attach token to every request if available
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Token Priority: SuperAdmin → Hospital → Doctor → Legacy
      const saToken = (() => {
        try { return useSuperAdminAuthStore.getState().token; } catch { return null; }
      })();

      let hToken = null;
      let hRoles = [];
      try {
        // Dynamic import to avoid circular dependency if store imports axios
        const store = (await import('../store/useHospitalAuthStore')).default;
        const state = store.getState();
        hToken = state.token;
        hRoles = state.roleNames || [];
      } catch (e) { /* ignore */ }

      let dToken = null;
      try {
        // Dynamic import for doctor auth store
        const store = (await import('../store/useDoctorAuthStore')).default;
        dToken = store.getState().token;
      } catch (e) { /* ignore */ }

      let fdToken = null;
      try {
        // Dynamic import for front desk auth store
        const store = (await import('../store/useFrontDeskAuthStore')).default;
        fdToken = store.getState().token;
      } catch (e) { /* ignore */ }

      let hfdToken = null;
      try {
        // Dynamic import for hospital front desk auth store
        const store = (await import('../store/useHospitalFrontDeskAuthStore')).default;
        hfdToken = store.getState().token;
      } catch (e) { /* ignore */ }

      const genericToken = (() => {
        try { return useAuthStore.getState().token; } catch { return null; }
      })();
      const lsToken = (() => {
        try { return localStorage.getItem('superAdminToken'); } catch { return null; }
      })();

      // Priority logic based on current route/path to support multi-role users
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const roleContext = config.roleContext; // Internal property, not a header
      let token = null;

      // Disambiguate between modules using specific segment checks
      const isDoctorModule = roleContext === 'doctor' || path.startsWith('/doc/') || path === '/doc';
      const isHospitalModule = roleContext === 'hospital' || path.startsWith('/hospital/') || path === '/hospital';
      const isHospitalFDModule = roleContext === 'hfd' || path.startsWith('/hfd/') || path === '/hfd';
      const isFrontDeskModule = roleContext === 'front-desk' || path.startsWith('/fd/') || path === '/fd';

      // Disambiguate SuperAdmin: /doctor (SA) vs /doc (Doctor), /hospitals (SA) vs /hospital (Hospital)
      const isSuperAdminRoute = roleContext === 'super-admin' || path === '/' || path.startsWith('/doctor') || path.startsWith('/hospitals') ||
        path.startsWith('/patients') || path.startsWith('/dashboard') ||
        path.startsWith('/settings');

      if (isSuperAdminRoute) {
        token = saToken || lsToken || genericToken;
      } else if (isFrontDeskModule) {
        // Strictly prioritize FD token in FD module
        token = fdToken || genericToken || saToken || hToken || dToken || lsToken;
      } else if (isDoctorModule) {
        // Dual-role check: If signed in via Hospital but acting as Doctor, prefer Hospital token
        if (hToken && hRoles.includes("DOCTOR")) {
          token = hToken;
        } else {
          token = dToken || fdToken || saToken || hToken || genericToken || lsToken;
        }
      } else if (isHospitalFDModule) {
        // Strictly prioritize HFD token in HFD module
        token = hfdToken || hToken || saToken || dToken || genericToken || lsToken;
      } else if (isHospitalModule) {
        token = hToken || saToken || dToken || genericToken || lsToken;
      } else {
        // Universal fallback
        token = saToken || hToken || dToken || genericToken || lsToken;
      }

      if (token) {
        config.headers = config.headers || {};
        const rawToken = String(token).trim();
        const hasBearer = /^Bearer\s+/i.test(rawToken);
        config.headers.Authorization = hasBearer ? rawToken : `Bearer ${rawToken}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: auto-logout or cleanup on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        useAuthStore.getState().clearAuth();
        useSuperAdminAuthStore.getState().clearAuth();
        localStorage.removeItem('superAdminToken');

        // Dynamic import for hospital auth store to clear it too
        import('../store/useHospitalAuthStore').then(m => m.default.getState().clearAuth()).catch(() => { });

        // Dynamic import for doctor auth store to clear it too
        import('../store/useDoctorAuthStore').then(m => m.default.getState().clearAuth()).catch(() => { });

        // Dynamic import for hospital front desk auth store to clear it too
        import('../store/useHospitalFrontDeskAuthStore').then(m => m.default.getState().clearAuth()).catch(() => { });

        // Note: useToastStore might need to be imported or accessed similarly
        // For now, keeping the 401 logic minimal to avoid breaking more things
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;