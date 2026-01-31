import axios from '../lib/axios';

/**
 * Get platform overview metrics for Super Admin Dashboard
 * @returns {Promise<Object>} API response with metrics and deltas
 */
export const getPlatformOverview = async () => {
    try {
        const response = await axios.get('/superAdmin/platform-overview');
        return response.data;
    } catch (error) {
        throw error;
    }
};
