import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Star, Award, TrendingUp, Users, MessageSquare } from 'lucide-react';
import BadgeDisplay from '../../components/BadgeDisplay';
import RatingStars from '../../components/RatingStars';
import StatsCard from '../../components/StatsCard';

const AchievementsDashboard = () => {
  const [achievements, setAchievements] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAchievements();
    fetchRecentFeedback();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/my-achievements',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      
      setAchievements(response.data.data);
      setError('');
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/my-feedback',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Get last 5 feedback items
      setRecentFeedback(response.data.feedback.slice(0, 5));
    } catch (err) {
      // Error handled silently
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Achievements</h1>
        <p className="text-gray-600">Track your mentorship impact and recognition</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<Star className="w-6 h-6" />}
          title="Average Rating"
          value={achievements.averageRating?.toFixed(1) || '0.0'}
          color="yellow"
          subtitle={`${achievements.totalRatings || 0} ratings`}
        />
        <StatsCard
          icon={<Users className="w-6 h-6" />}
          title="Sessions Conducted"
          value={achievements.totalSessionsConducted || 0}
          color="blue"
          subtitle="Total workshops"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Leaderboard Points"
          value={achievements.leaderboardPoints?.toFixed(0) || 0}
          color="purple"
          subtitle="Keep climbing!"
        />
        <StatsCard
          icon={<MessageSquare className="w-6 h-6" />}
          title="Helpful Votes"
          value={achievements.totalHelpfulVotes || 0}
          color="green"
          subtitle="From experiences"
        />
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-800">Badges Earned</h2>
        </div>

        {achievements.badges && achievements.badges.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <BadgeDisplay badges={achievements.badges} />
            </div>

            {/* Badge Progress */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Badge Progress</h3>
              <div className="space-y-4">
                {/* Star Mentor Progress */}
                {!achievements.badges.includes('Star Mentor') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        ⭐ Star Mentor (4.0+ rating)
                      </span>
                      <span className="text-sm text-gray-600">
                        {achievements.averageRating?.toFixed(1) || 0} / 4.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((achievements.averageRating / 4.0) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Top Rated Progress */}
                {!achievements.badges.includes('Top Rated') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        🏆 Top Rated (4.5+ rating)
                      </span>
                      <span className="text-sm text-gray-600">
                        {achievements.averageRating?.toFixed(1) || 0} / 4.5
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((achievements.averageRating / 4.5) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 50 Sessions Progress */}
                {!achievements.badges.includes('50 Sessions') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        🎯 50 Sessions
                      </span>
                      <span className="text-sm text-gray-600">
                        {achievements.totalSessionsConducted || 0} / 50
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((achievements.totalSessionsConducted / 50) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* 100 Sessions Progress */}
                {!achievements.badges.includes('100 Sessions') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        💯 100 Sessions
                      </span>
                      <span className="text-sm text-gray-600">
                        {achievements.totalSessionsConducted || 0} / 100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((achievements.totalSessionsConducted / 100) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Community Hero Progress */}
                {!achievements.badges.includes('Community Hero') && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        🦸 Community Hero (50+ helpful votes)
                      </span>
                      <span className="text-sm text-gray-600">
                        {achievements.totalHelpfulVotes || 0} / 50
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((achievements.totalHelpfulVotes / 50) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No badges earned yet</p>
            <p className="text-sm mt-2">
              Continue conducting workshops and receiving great ratings to earn badges!
            </p>
          </div>
        )}
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Recent Feedback</h2>
          </div>
          {recentFeedback.length > 0 && (
            <span className="text-sm text-gray-600">
              Last {recentFeedback.length} feedback items
            </span>
          )}
        </div>

        {recentFeedback.length > 0 ? (
          <div className="space-y-4">
            {recentFeedback.map((feedback, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <RatingStars rating={feedback.rating} size="sm" />
                  <span className="text-xs text-gray-500">
                    {new Date(feedback.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                {feedback.comment && (
                  <p className="text-gray-700 text-sm mt-2">{feedback.comment}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Workshop: {feedback.workshopTitle || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No feedback received yet</p>
            <p className="text-sm mt-2">
              Students will be able to rate your workshops after completion
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsDashboard;
