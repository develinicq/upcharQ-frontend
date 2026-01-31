import axios from "../../lib/axios";

// GET Experiences
export const getExperiences = async () => {
  try {
    const res = await axios.get(
      "/doctors/my-account/personal-info/experiences"
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ADD Experience
export const addExperience = async (payload) => {
  try {
    const res = await axios.post(
      "/doctors/my-account/personal-info/experiences",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// UPDATE Experience
export const updateExperience = async (payload) => {
  try {
    const res = await axios.put(
      "/doctors/my-account/personal-info/experiences",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// DELETE Experience
export const deleteExperience = async (experienceId) => {
  try {
    const res = await axios.delete(
      `/doctors/my-account/personal-info/experiences/${experienceId}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
