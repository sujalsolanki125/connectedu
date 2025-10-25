import axios from 'axios';

const API_URL = '${process.env.BACKEND_URL}/api/upload';

// Helper function to get auth config
const getAuthConfig = () => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  return {
    headers: {
      Authorization: `Bearer ${userInfo?.token}`,
    },
  };
};

/**
 * Upload profile image
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} API response with image URL
 */
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await axios.post(`${API_URL}/profile-image`, formData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload profile image' };
  }
};

/**
 * Upload resume (PDF/DOC)
 * @param {File} resumeFile - Resume file to upload
 * @returns {Promise} API response with resume URL
 */
export const uploadResume = async (resumeFile) => {
  try {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await axios.post(`${API_URL}/resume`, formData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload resume' };
  }
};

/**
 * Delete resume
 * @returns {Promise} API response
 */
export const deleteResume = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.delete(`${API_URL}/resume`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete resume' };
  }
};

/**
 * Upload resource file
 * @param {File} resourceFile - Resource file to upload
 * @param {Object} metadata - Resource metadata (title, description, category)
 * @returns {Promise} API response with resource data
 */
export const uploadResource = async (resourceFile, metadata) => {
  try {
    const formData = new FormData();
    formData.append('resourceFile', resourceFile);
    formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.category) formData.append('category', metadata.category);

    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await axios.post(`${API_URL}/resource`, formData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload resource' };
  }
};

/**
 * Delete resource file
 * @param {String} resourceId - Resource ID to delete
 * @returns {Promise} API response
 */
export const deleteResource = async (resourceId) => {
  try {
    const config = getAuthConfig();
    const response = await axios.delete(`${API_URL}/resource/${resourceId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete resource' };
  }
};

/**
 * Get user's uploaded resources
 * @returns {Promise} API response with resources array
 */
export const getUserResources = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${API_URL}/resources`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get resources' };
  }
};

/**
 * Increment download count for a resource
 * @param {String} resourceId - Resource ID
 * @param {String} userId - User ID who owns the resource
 * @returns {Promise} API response
 */
export const incrementDownloadCount = async (resourceId, userId) => {
  try {
    const response = await axios.put(`${API_URL}/resource/${resourceId}/download`, {
      userId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update download count' };
  }
};

// Export all functions as a default object as well
const uploadService = {
  uploadProfileImage,
  uploadResume,
  deleteResume,
  uploadResource,
  deleteResource,
  getUserResources,
  incrementDownloadCount,
};

export default uploadService;
