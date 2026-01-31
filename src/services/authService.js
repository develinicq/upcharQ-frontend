import axiosInstance from "../lib/axios";

export const registerUser = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/register", formData);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

// PASSWORD login
export const loginPassword = async ({ userName, password }) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      userName,
      method: "PASSWORD",
      password,
    });
    return response.data;
  } catch (error) {
    const payload = error?.response?.data || { message: error.message };
    console.error("Login failed:", payload);
    throw error;
  }
};

// OTP login - step 1: request OTP
export const loginOtpStart = async ({ userName }) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      userName,
      method: "OTP",
    });
    return response.data;
  } catch (error) {
    const payload = error?.response?.data || { message: error.message };
    console.error("OTP request failed:", payload);
    throw error;
  }
};

// OTP login - step 2: verify OTP using challengeId from step 1 response
export const loginOtpVerify = async ({ challengeId, userName, otp }) => {
  try {
    const response = await axiosInstance.post("/auth/verify-otp", {
      challengeId,
      userName,
      otp,
    });
    return response.data;
  } catch (error) {
    const payload = error?.response?.data || { message: error.message };
    console.error("OTP verify failed:", payload);
    throw error;
  }
};

// Appointments
export const getPendingAppointmentsForClinic = async ({ clinicId }) => {
  try {
    const url = "/appointments/pending-appointments-clinic";
    const response = await axiosInstance.post(url, { clinicId });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    // Fallback: some deployments expose a GET variant
    if (status === 404) {
      try {
        // Try POST with trailing slash
        const postSlash = await axiosInstance.post("/appointments/pending-appointments-clinic/", { clinicId });
        return postSlash.data;
      } catch (e2) {
        try {
          // Try GET without slash
          const getNoSlash = await axiosInstance.get("/appointments/pending-appointments-clinic", { params: { clinicId } });
          return getNoSlash.data;
        } catch (e3) {
          try {
            // Try GET with trailing slash
            const getSlash = await axiosInstance.get("/appointments/pending-appointments-clinic/", { params: { clinicId } });
            return getSlash.data;
          } catch (e4) {
            console.error("Pending appointments fallbacks failed:", e4?.response?.data || e4.message);
            throw e4;
          }
        }
      }
    }
    console.error("Pending appointments fetch failed:", error?.response?.data || error.message);
    throw error;
  }
};

// Slots: find slots for patient context
export const findPatientSlots = async ({ doctorId, date, clinicId, hospitalId }) => {
  const payload = { doctorId, date, ...(clinicId ? { clinicId } : {}), ...(hospitalId ? { hospitalId } : {}) };
  if (import.meta.env.VITE_DEBUG_SLOTS) {
    console.debug('[slots] POST /slots/patient/find-slots payload:', payload);
  }
  const response = await axiosInstance.post('/slots/patient/find-slots', payload);
  return response.data;
};

// Appointments for a slot
export const getAppointmentsForSlot = async (slotId) => {
  try {
    const response = await axiosInstance.get(`/appointments/slot/${encodeURIComponent(slotId)}`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        const response = await axiosInstance.get(`/appointments/slot/${encodeURIComponent(slotId)}/`);
        return response.data;
      } catch (e2) {
        console.error("Get appointments for slot fallback failed:", e2?.response?.data || e2.message);
        throw e2;
      }
    }
    console.error("Get appointments for slot failed:", error?.response?.data || error.message);
    throw error;
  }
};

// Approve a pending appointment (moves it to In Waiting for the day)
export const approveAppointment = async (appointmentId) => {
  if (!appointmentId) throw new Error('appointmentId is required');
  try {
    // API requires PUT; send empty object as body
    const response = await axiosInstance.put(`/appointments/approve/${encodeURIComponent(appointmentId)}`, {});
    return response.data; // { success, data: { ...updatedAppointment } }
  } catch (error) {
    console.error('Approve appointment failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Reject a pending appointment
export const rejectAppointment = async (appointmentId) => {
  if (!appointmentId) throw new Error('appointmentId is required');
  try {
    const response = await axiosInstance.put(`/appointments/reject/${encodeURIComponent(appointmentId)}`, {});
    return response.data;
  } catch (error) {
    console.error('Reject appointment failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Check-in an appointment
export const checkInAppointment = async (appointmentId) => {
  if (!appointmentId) throw new Error('appointmentId is required');
  try {
    const response = await axiosInstance.put(`/appointments/check-in/${encodeURIComponent(appointmentId)}`, {});
    return response.data;
  } catch (error) {
    console.error('Check-in failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Mark appointment as No-Show
export const markNoShowAppointment = async (appointmentId) => {
  if (!appointmentId) throw new Error('appointmentId is required');
  try {
    const response = await axiosInstance.put(`/appointments/no-show/${encodeURIComponent(appointmentId)}`, {});
    return response.data;
  } catch (error) {
    console.error('Mark no-show failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Walk-in appointment booking
// payload shape differs by method: EXISTING vs NEW_USER
export const bookWalkInAppointment = async (payload) => {
  try {
    const response = await axiosInstance.post('/appointments/walk-in', payload);
    return response.data; // expecting { success, data: {...} }
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        const response = await axiosInstance.post('/appointments/walk-in/', payload);
        return response.data;
      } catch (e2) {
        console.error('Walk-in booking fallback failed:', e2?.response?.data || e2.message);
        // Attach details for UI
        if (e2 && e2.response) {
          e2.validation = e2.response.data?.errors || e2.response.data?.details || null;
          e2.message = e2.response.data?.message || e2.message;
        }
        throw e2;
      }
    }
    console.error('Walk-in booking failed:', error?.response?.data || error.message);
    if (error && error.response) {
      error.validation = error.response.data?.errors || error.response.data?.details || null;
      error.message = error.response.data?.message || error.message;
    }
    throw error;
  }
};

// Doctor profile fetch (requires Authorization header auto-injected by axiosInstance interceptor)
export const getDoctorMe = async () => {
  try {
    const response = await axiosInstance.get('/doctors/me');
    return response.data; // expecting { success, data: { ...doctorFields } }
  } catch (error) {
    console.error('Fetch doctor details failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Start ETA tracking for a slot (session start)
export const startSlotEta = async (slotId) => {
  if (!slotId) throw new Error('slotId is required');
  try {
    const response = await axiosInstance.post(`/eta/slot/${encodeURIComponent(slotId)}/start`, {});
    return response.data; // expecting { success, data: {...} } or similar
  } catch (error) {
    console.error('Start slot ETA failed:', error?.response?.data || error.message);
    throw error;
  }
};

// End ETA tracking for a slot (session end)
export const endSlotEta = async (slotId) => {
  if (!slotId) throw new Error('slotId is required');
  try {
    const response = await axiosInstance.post(`/eta/slot/${encodeURIComponent(slotId)}/end`, {});
    return response.data;
  } catch (error) {
    console.error('End slot ETA failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Get ETA status for a slot (whether started/end timestamps)
export const getSlotEtaStatus = async (slotId) => {
  if (!slotId) throw new Error('slotId is required');
  try {
    const response = await axiosInstance.get(`/eta/slot/${encodeURIComponent(slotId)}/status`);
    return response.data; // Expecting { started: boolean, startTime?, endTime? }
  } catch (error) {
    console.error('Get slot ETA status failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Start ETA for a specific patient's session (by token number) within a slot
export const startPatientSessionEta = async (slotId, tokenNumber) => {
  if (!slotId) throw new Error('slotId is required');
  if (tokenNumber == null) throw new Error('tokenNumber is required');
  try {
    // Use POST for mutating start action
    const response = await axiosInstance.post(`/eta/slot/${encodeURIComponent(slotId)}/session/${encodeURIComponent(tokenNumber)}/start`, {});
    return response.data;
  } catch (error) {
    console.error('Start patient session ETA failed:', error?.response?.data || error.message);
    throw error;
  }
};

// End ETA for a specific patient's session within a slot
export const endPatientSessionEta = async (slotId, tokenNumber) => {
  if (!slotId) throw new Error('slotId is required');
  if (tokenNumber == null) throw new Error('tokenNumber is required');
  try {
    // Use POST for mutating end action
    const response = await axiosInstance.post(`/eta/slot/${encodeURIComponent(slotId)}/session/${encodeURIComponent(tokenNumber)}/end`, {});
    return response.data;
  } catch (error) {
    console.error('End patient session ETA failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Pause an active slot session for a duration (minutes)
export const pauseSlotEta = async (slotId, durationMinutes) => {
  if (!slotId) throw new Error('slotId is required');
  if (durationMinutes == null) throw new Error('durationMinutes is required');
  try {
    const response = await axiosInstance.post(`/eta/slot/${encodeURIComponent(slotId)}/pause`, { durationMinutes: String(durationMinutes) });
    return response.data; // expecting { success, data: { pauseEndsAt, ... } }
  } catch (error) {
    console.error('Pause slot ETA failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Resume a paused slot session
export const resumeSlotEta = async (slotId) => {
  if (!slotId) throw new Error('slotId is required');
  try {
    const response = await axiosInstance.post(`/eta/slot/${encodeURIComponent(slotId)}/resume`, {});
    return response.data; // expecting { success, data: { resumedAt } }
  } catch (error) {
    console.error('Resume slot ETA failed:', error?.response?.data || error.message);
    throw error;
  }
};
// Terminate queue sessions
export const terminateQueue = async ({ slotIds, cancellationReason }) => {
  if (!slotIds || !slotIds.length) throw new Error('slotIds are required');
  try {
    const response = await axiosInstance.post('/appointments/terminate-queue', {
      slotIds,
      cancellationReason
    });
    return response.data;
  } catch (error) {
    console.error('Terminate queue failed:', error?.response?.data || error.message);
    throw error;
  }
};

// Get pending appointments for a hospital
export const getPendingsAppointmentsForHospital = async ({ hospitalId }) => {
  if (!hospitalId) throw new Error('hospitalId is required');
  try {
    const res = await axiosInstance.post('/appointments/pending-appointments-doctor-hospital', { hospitalId });
    return res.data;
  } catch (error) {
    console.error('Get pending appointments failed:', error?.response?.data || error.message);
    throw error;
  }
};
