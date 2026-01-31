import axios from "../../lib/axios";

// GET Awards and Publications
export const getAwardsAndPublications = async () => {
  try {
    const res = await axios.get(
      "/doctors/my-account/personal-info/awards-publications"
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ADD Award
export const addAward = async (payload) => {
  try {
    const res = await axios.post(
      "/doctors/my-account/personal-info/add-awards",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// UPDATE Award
export const updateAward = async (payload) => {
  try {
    const res = await axios.put(
      "/doctors/my-account/personal-info/awards",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// DELETE Award
export const deleteAward = async (awardId) => {
  try {
    const res = await axios.delete(
      `/doctors/my-account/personal-info/awards/${awardId}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ADD Publication
export const addPublication = async (payload) => {
  try {
    const res = await axios.post(
      "/doctors/my-account/personal-info/add-publications",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// UPDATE Publication
export const updatePublication = async (payload) => {
  try {
    const res = await axios.put(
      "/doctors/my-account/personal-info/publications",
      payload
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// DELETE Publication
export const deletePublication = async (publicationId) => {
  try {
    const res = await axios.delete(
      `/doctors/my-account/personal-info/publications/${publicationId}`
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
