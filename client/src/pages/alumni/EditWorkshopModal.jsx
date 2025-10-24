import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditWorkshopModal = ({ isOpen, onClose, workshop, onWorkshopUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    workshopType: 'mentorship',
    isPaid: false,
    price: 0,
    duration: 60,
    maxParticipants: 10,
    scheduledDate: '',
    meetingLink: '',
    prerequisites: '',
    topics: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Technical Interview',
    'Behavioral Interview',
    'System Design',
    'Career Guidance',
    'Resume Review',
    'Mock Interview',
    'Coding Practice',
    'Soft Skills',
    'Industry Insights',
    'Other'
  ];

  useEffect(() => {
    if (workshop) {
      setFormData({
        title: workshop.title || '',
        description: workshop.description || '',
        category: workshop.category || '',
        workshopType: workshop.workshopType || 'mentorship',
        isPaid: workshop.isPaid || false,
        price: workshop.price || 0,
        duration: workshop.duration || 60,
        maxParticipants: workshop.maxParticipants || 10,
        scheduledDate: workshop.scheduledDate ? new Date(workshop.scheduledDate).toISOString().slice(0, 16) : '',
        meetingLink: workshop.meetingLink || '',
        prerequisites: workshop.prerequisites || '',
        topics: Array.isArray(workshop.topics) ? workshop.topics.join(', ') : ''
      });
    }
  }, [workshop]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        price: checked ? prev.price : 0
      }));
    } else if (name === 'price' || name === 'duration' || name === 'maxParticipants') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Workshop title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Workshop description is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.scheduledDate) {
      setError('Please select a date and time');
      return;
    }

    const selectedDate = new Date(formData.scheduledDate);
    if (selectedDate < new Date()) {
      setError('Workshop date must be in the future');
      return;
    }

    if (formData.isPaid && formData.price <= 0) {
      setError('Price must be greater than 0 for paid workshops');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const processedData = {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(t => t)
      };

      const response = await axios.put(
        `http://localhost:5000/api/alumni-features/workshop/${workshop._id}`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      onWorkshopUpdated(response.data.workshop);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Workshop</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Workshop Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workshop Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type <span className="text-red-500">*</span>
              </label>
              <select
                name="workshopType"
                value={formData.workshopType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mentorship">Mentorship Session</option>
                <option value="workshop">Workshop</option>
                <option value="mock-interview">Mock Interview</option>
                <option value="career-guidance">Career Guidance</option>
              </select>
            </div>
          </div>

          {/* Duration, Max Participants, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                max="300"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date/Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Paid/Free Toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">This is a paid session</span>
            </label>

            {formData.isPaid && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link
            </label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics Covered (comma-separated)
            </label>
            <input
              type="text"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites (Optional)
            </label>
            <textarea
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkshopModal;
