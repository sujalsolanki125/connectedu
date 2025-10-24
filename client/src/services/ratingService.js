import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ratings';

// Helper function to get auth config
const getAuthConfig = () => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null;

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userInfo?.token}`,
    },
  };
};

/**
 * Submit a new rating for a mentorship session
 * @param {Object} ratingData - Rating data object
 * @returns {Promise} API response
 */
export const submitRating = async (ratingData) => {
  try {
    const config = getAuthConfig();
    const response = await axios.post(API_URL, ratingData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit rating' };
  }
};

/**
 * Get all ratings for a specific alumni
 * @param {String} alumniId - Alumni user ID
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Results per page (default: 10)
 * @returns {Promise} API response with ratings and statistics
 */
export const getAlumniRatings = async (alumniId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/alumni/${alumniId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch alumni ratings' };
  }
};

/**
 * Get all ratings submitted by a student
 * @param {String} studentId - Student user ID
 * @returns {Promise} API response with student's ratings
 */
export const getStudentRatings = async (studentId) => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${API_URL}/student/${studentId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch student ratings' };
  }
};

/**
 * Get rating for a specific mentorship session
 * @param {String} sessionId - Mentorship session ID
 * @returns {Promise} API response with session rating
 */
export const getSessionRating = async (sessionId) => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(`${API_URL}/session/${sessionId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch session rating' };
  }
};

/**
 * Update an existing rating
 * @param {String} ratingId - Rating ID
 * @param {Object} updateData - Updated rating data
 * @returns {Promise} API response
 */
export const updateRating = async (ratingId, updateData) => {
  try {
    const config = getAuthConfig();
    const response = await axios.put(`${API_URL}/${ratingId}`, updateData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update rating' };
  }
};

/**
 * Delete a rating
 * @param {String} ratingId - Rating ID
 * @returns {Promise} API response
 */
export const deleteRating = async (ratingId) => {
  try {
    const config = getAuthConfig();
    const response = await axios.delete(`${API_URL}/${ratingId}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete rating' };
  }
};

/**
 * Mark a rating as helpful
 * @param {String} ratingId - Rating ID
 * @returns {Promise} API response
 */
export const markRatingHelpful = async (ratingId) => {
  try {
    const config = getAuthConfig();
    const response = await axios.put(`${API_URL}/${ratingId}/helpful`, {}, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark rating as helpful' };
  }
};

/**
 * Get platform-wide rating statistics
 * @returns {Promise} API response with platform stats
 */
export const getPlatformStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats/platform`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch platform statistics' };
  }
};

// Export all functions as a default object as well
const ratingService = {
  submitRating,
  getAlumniRatings,
  getStudentRatings,
  getSessionRating,
  updateRating,
  deleteRating,
  markRatingHelpful,
  getPlatformStats,
};

export default ratingService;
