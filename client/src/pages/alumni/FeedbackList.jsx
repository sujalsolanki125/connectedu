import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RatingStars from '../../components/RatingStars';
import { MessageSquare, Calendar, User } from 'lucide-react';

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/my-feedback',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setFeedback(response.data.feedback || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch feedback');
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFeedback = () => {
    if (filterRating === 'all') return feedback;
    const rating = parseInt(filterRating);
    return feedback.filter(f => Math.floor(f.rating) === rating);
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedback.forEach(f => {
      const rating = Math.floor(f.rating);
      if (rating >= 1 && rating <= 5) {
        dist[rating]++;
      }
    });
    return dist;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredFeedback = getFilteredFeedback();
  const distribution = getRatingDistribution();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Feedback</h1>
        <p className="text-gray-600">View all feedback from your workshop participants</p>
      </div>

      {/* Stats Summary */}
      {feedback.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Rating</h3>
              <div className="flex items-center space-x-4">
                <div className="text-5xl font-bold text-blue-600">{getAverageRating()}</div>
                <div>
                  <RatingStars rating={parseFloat(getAverageRating())} size="lg" />
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {feedback.length} {feedback.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = distribution[rating];
                  const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-8">{rating} ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
        <div className="flex space-x-2">
          {['all', '5', '4', '3', '2', '1'].map(rating => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterRating === rating
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating === 'all' ? 'All' : `${rating} ⭐`}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-2">
            {feedback.length === 0
              ? "You haven't received any feedback yet"
              : "No feedback matches the selected filter"}
          </p>
          <p className="text-sm text-gray-500">
            Students can provide feedback after completing your workshops
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <RatingStars rating={item.rating} size="md" />
                  <h3 className="font-semibold text-gray-800 mt-2">
                    {item.workshopTitle || 'Workshop'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.submittedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <User className="w-4 h-4" />
                    <span>Student ID: {item.studentId}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {item.comment && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{item.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
