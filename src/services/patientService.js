import axios from "../lib/axios";

// Get all patients for Super Admin
export const getPatientsForSuperAdmin = async () => {
    try {
        const res = await axios.get("/patients/for-super-admin/patients");
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get patient details for Super Admin
export const getPatientDetailsForSuperAdmin = async (patientId) => {
    try {
        const res = await axios.get(`/patients/for-super-admin/patients/${patientId}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get all patients for Hospital Admin
export const getPatientsForHospital = async (hospitalId) => {
    try {
        const res = await axios.get("/patients/for-hospital-admin/patients-list", {
            params: { hospitalId }
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get all patients for Hospital Staff (HFD)
export const getPatientsForHospitalStaff = async (hospitalId) => {
    try {
        const res = await axios.get("/hospitals/staff/patients-list", {
            params: { hospitalId },
            roleContext: 'hfd'
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get patient details for Hospital Admin
export const getPatientDetailsForHospital = async (hospitalId, patientId) => {
    try {
        const res = await axios.get(`/patients/for-hospital-admin/${hospitalId}/patient-details/${patientId}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get patient details for Hospital Staff (HFD)
export const getPatientDetailsForHospitalStaff = async (hospitalId, patientId) => {
    try {
        const res = await axios.get("/hospitals/staff/patient-details", {
            params: { hospitalId, patientId },
            roleContext: 'hfd'
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get all patients for Doctor/Clinic
export const getPatientsForDoctor = async ({ clinicId, doctorId, hospitalId, page = 1, limit = 20 }) => {
    try {
        const res = await axios.get("/patients/for-doctor/patients-list", {
            params: { clinicId, doctorId, hospitalId, page, limit }
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Get patient details for Doctor/Staff
export const getPatientDetailsForDoctor = async (patientId) => {
    try {
        const res = await axios.get(`/patients/for-doctor/patient-details/${patientId}`);
        return res.data;
    } catch (error) {
        throw error;
    }
};
// Get patient details for Staff/Front Desk view
export const getPatientDetailsForStaff = async ({ patientId, doctorId, clinicId }) => {
    try {
        const res = await axios.get("/doctors/staff/patient-details", {
            params: { patientId, doctorId, clinicId },
            roleContext: 'front-desk'
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// Search patients for walk-in appointment
export const searchPatientsForWalkIn = async (searchQuery, limit = 5) => {
    try {
        const res = await axios.get("/patients/for-providers/search-patients-walk-in", {
            params: { searchQuery, limit }
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};
