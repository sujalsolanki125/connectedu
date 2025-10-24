import React, { useState } from 'react';
import axios from 'axios';
import { InteractiveRatingStars } from '../../components/RatingStars';
import { Star, Send } from 'lucide-react';

const SubmitFeedbackModal = ({ isOpen, onClose, booking, onFeedbackSubmitted }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/alumni-features/workshop/${booking.workshop._id}/feedback`,
        {
          rating: formData.rating,
          comment: formData.comment.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Thank you for your feedback! It helps us improve and recognize great mentors.');
      onFeedbackSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Submit Feedback</h2>
          <p className="text-sm text-gray-600">{booking.workshop.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Workshop Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">Workshop Details</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Title:</span> {booking.workshop.title}
              </p>
              <p>
                <span className="font-medium">Mentor:</span> {booking.workshop.mentorName || 'Alumni Mentor'}
              </p>
              <p>
                <span className="font-medium">Date:</span>{' '}
                {new Date(booking.workshop.scheduledDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {booking.workshop.duration} minutes
              </p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this workshop? <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center space-y-3 py-4 bg-gray-50 rounded-lg border border-gray-200">
              <InteractiveRatingStars
                rating={formData.rating}
                onRatingChange={handleRatingChange}
                size="lg"
              />
              <div className="flex items-center space-x-2">
                {formData.rating > 0 ? (
                  <span className="text-lg font-semibold text-gray-800">
                    {formData.rating} out of 5 stars
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Click on a star to rate</span>
                )}
              </div>
              
              {/* Rating Labels */}
              <div className="grid grid-cols-5 gap-2 text-xs text-center w-full max-w-md">
                <span className={formData.rating === 1 ? 'font-bold text-red-600' : 'text-gray-500'}>
                  Poor
                </span>
                <span className={formData.rating === 2 ? 'font-bold text-orange-600' : 'text-gray-500'}>
                  Fair
                </span>
                <span className={formData.rating === 3 ? 'font-bold text-yellow-600' : 'text-gray-500'}>
                  Good
                </span>
                <span className={formData.rating === 4 ? 'font-bold text-blue-600' : 'text-gray-500'}>
                  Very Good
                </span>
                <span className={formData.rating === 5 ? 'font-bold text-green-600' : 'text-gray-500'}>
                  Excellent
                </span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience (Optional)
            </label>
            <textarea
              value={formData.comment}
              onChange={handleCommentChange}
              placeholder="What did you like? What could be improved? Your feedback helps other students and motivates mentors!"
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength="500"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Help other students by sharing your honest feedback
              </p>
              <p className="text-xs text-gray-500">
                {formData.comment.length}/500
              </p>
            </div>
          </div>

          {/* Feedback Impact Info */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center space-x-2">
              <Star className="w-4 h-4 text-purple-600" />
              <span>Your feedback matters!</span>
            </h4>
            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>Helps mentors improve their sessions</li>
              <li>Guides other students in choosing workshops</li>
              <li>Contributes to mentor's leaderboard ranking</li>
              <li>Earns mentors achievement badges for high ratings</li>
            </ul>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              🔒 <strong>Privacy:</strong> Your identity will be anonymized in public feedback displays. 
              Only the mentor will see your booking details.
            </p>
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
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-semibold"
              disabled={loading || formData.rating === 0}
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitFeedbackModal;
