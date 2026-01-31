import axiosInstance from '../lib/axios';

// GET /api/doctors/consultation-details?hospitalId=... or ?clinicId=...
export const getDoctorConsultationDetails = async (params) => {
  if (!params || (!params.hospitalId && !params.clinicId)) {
    throw new Error('Either hospitalId or clinicId is required');
  }
  const response = await axiosInstance.get('/doctors/consultation-details', {
    params,
  });
  return response.data;
};

// PUT /api/doctors/consultation-details
export const putDoctorConsultationDetails = async (payload) => {
  const response = await axiosInstance.put('/doctors/consultation-details', payload);
  return response.data;
};

// GET /api/doctors/staff/consultation-details?clinicId=...&doctorId=...
export const getStaffConsultationDetails = async (params) => {
  if (!params || !params.clinicId || !params.doctorId) {
    throw new Error('Both clinicId and doctorId are required for staff');
  }
  const response = await axiosInstance.get('/doctors/staff/consultation-details', {
    params,
  });
  return response.data;
};

// PUT /api/doctors/staff/consultation-details?doctorId=...
export const putStaffConsultationDetails = async (payload, params) => {
  const response = await axiosInstance.put('/doctors/staff/consultation-details', payload, {
    params,
  });
  return response.data;
};

export default {
  getDoctorConsultationDetails,
  putDoctorConsultationDetails,
  getStaffConsultationDetails,
  putStaffConsultationDetails
};
