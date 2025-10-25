import React, { useState } from 'react';
import axios from 'axios';

const CreateWorkshopModal = ({ isOpen, onClose, onWorkshopCreated }) => {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        price: checked ? prev.price : 0 // Reset price if switching to free
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

    // Validation
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

    // Check if date is in the future
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
      
      // Process topics from comma-separated string to array
      const processedData = {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(t => t)
      };

      
      
      const response = await axios.post(
        '${process.env.BACKEND_URL}/api/alumni-features/workshop',
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      

      // Success - notify parent and close modal
      onWorkshopCreated(response.data.data);
      
      // Reset form
      setFormData({
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
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create Workshop/Mentorship Session</h2>
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
              placeholder="e.g., System Design Mock Interview"
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
              placeholder="Describe what students will learn and what to expect..."
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
                  placeholder="Enter price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Meeting Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link (Optional - can be added later)
            </label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/xxx or https://zoom.us/j/xxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can add the meeting link later after students book the session
            </p>
          </div>

          {/* Topics (Comma-separated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics Covered (comma-separated)
            </label>
            <input
              type="text"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              placeholder="e.g., System Design, Scalability, Load Balancing, Caching"
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
              placeholder="What students should know or prepare before attending..."
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
              {loading ? 'Creating...' : 'Create Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkshopModal;
