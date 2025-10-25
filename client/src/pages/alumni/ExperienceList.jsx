import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExperienceCard from './ExperienceCard';
import AddExperienceModal from './AddExperienceModal';

/**
 * ExperienceList Component
 * Displays list of alumni's own interview experiences
 */
const ExperienceList = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMyExperiences();
  }, []);

  const fetchMyExperiences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      
      
      
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/my-interview-experiences',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      

      if (response.data.success) {
        setExperiences(response.data.data);
        
      }
    } catch (err) {
      
      
      
      setError('Failed to load interview experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (experienceId) => {
    if (!window.confirm('Are you sure you want to delete this interview experience?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.BACKEND_URL}/api/alumni-features/interview-experience/${experienceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Interview experience deleted successfully!');
        fetchMyExperiences();
      }
    } catch (err) {
      // Error handled silently
      alert(err.response?.data?.message || 'Failed to delete experience');
    }
  };

  const handleAddSuccess = () => {
    fetchMyExperiences();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Interview Experiences</h2>
          <p className="text-gray-600 mt-1">Share your interview journey to help students</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Add New Experience
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Experiences List */}
      {experiences.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Interview Experiences Yet</h3>
          <p className="text-gray-600 mb-6">
            Start sharing your interview experiences to help students prepare better
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience._id}
              experience={experience}
              onDelete={handleDelete}
              onUpdate={fetchMyExperiences}
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Add Experience Modal */}
      <AddExperienceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default ExperienceList;
