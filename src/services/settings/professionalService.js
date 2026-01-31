import axios from "../../lib/axios";

// GET Professional Details (includes medical registration and practice details)
export const getProfessionalDetails = async () => {
  try {
    const res = await axios.get(
      "/doctors/my-account/personal-info/professional-details"
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// UPDATE Medical Registration Details
export const updateMedicalRegistration = async (payload) => {
  try {
    const res = await axios.put(
      "/doctors/my-account/personal-info/medical-registration",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// UPDATE Practice Details
export const updatePracticeDetails = async (payload) => {
  try {
    const res = await axios.put(
      "/doctors/my-account/personal-info/practice-details",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
