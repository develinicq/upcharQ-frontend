import axios from "../../lib/axios";

// GET all education entries
export const getEducationList = async () => {
  try {
    const res = await axios.get(
      "/doctors/my-account/personal-info/educational-details"
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// POST create new education entry
export const createEducation = async (payload) => {
  try {
    const res = await axios.post(
      "/doctors/my-account/personal-info/educational-details",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// PUT update education entry
export const updateEducation = async (payload) => {
  try {
    const res = await axios.put(
      "/doctors/my-account/personal-info/educational-details",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// DELETE education entry
export const deleteEducation = async (id) => {
  try {
    const res = await axios.delete(
      `/doctors/my-account/personal-info/educational-details/${id}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
