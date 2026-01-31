import axios from "../../lib/axios";

// Fetch all RBAC permissions
// Response shape: { success, message, data: { permissions: [...], groupedPermissions: { [module]: [{id,name,description}] } }, ... }
export const fetchAllPermissions = async () => {
  try {
    const res = await axios.get("/rbac/all-permissions");
    return res.data;
  } catch (error) {
    // Normalize error to a simple object
    throw error?.response?.data || { success: false, message: error.message };
  }
};
