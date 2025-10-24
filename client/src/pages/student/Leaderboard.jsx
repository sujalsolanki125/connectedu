import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import BadgeDisplay from '../../components/BadgeDisplay';
import RatingStars from '../../components/RatingStars';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/alumni-features/leaderboard'
      );
      setLeaderboard(response.data.leaderboard || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Alumni Mentor Leaderboard</h1>
        <p className="text-gray-600">
          Top-performing mentors based on ratings and sessions conducted
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Points = Average Rating × Total Sessions Conducted
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No leaderboard data available yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Alumni will appear here after conducting workshops and receiving ratings
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="mb-8 grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-lg p-6 border-2 border-gray-300">
                  <Medal className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <h3 className="font-bold text-lg text-gray-800">
                    {leaderboard[1].alumniName || `Alumni ${leaderboard[1].alumniId}`}
                  </h3>
                  <RatingStars rating={leaderboard[1].averageRating} size="sm" />
                  <p className="text-2xl font-bold text-gray-700 mt-2">
                    {leaderboard[1].leaderboardPoints.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-600">points</p>
                  {leaderboard[1].badges && leaderboard[1].badges.length > 0 && (
                    <div className="mt-3">
                      <BadgeDisplay badges={leaderboard[1].badges.slice(0, 3)} size="sm" />
                    </div>
                  )}
                </div>
                <div className="bg-gray-300 h-24 rounded-b-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-600">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-t-lg p-6 border-2 border-yellow-400 shadow-lg">
                  <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-500 animate-pulse" />
                  <h3 className="font-bold text-xl text-gray-800">
                    {leaderboard[0].alumniName || `Alumni ${leaderboard[0].alumniId}`}
                  </h3>
                  <RatingStars rating={leaderboard[0].averageRating} size="md" />
                  <p className="text-3xl font-bold text-yellow-700 mt-2">
                    {leaderboard[0].leaderboardPoints.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-600">points</p>
                  {leaderboard[0].badges && leaderboard[0].badges.length > 0 && (
                    <div className="mt-3">
                      <BadgeDisplay badges={leaderboard[0].badges.slice(0, 3)} />
                    </div>
                  )}
                </div>
                <div className="bg-yellow-400 h-32 rounded-b-lg flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-yellow-800">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-orange-100 to-orange-200 rounded-t-lg p-6 border-2 border-orange-400">
                  <Medal className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-bold text-lg text-gray-800">
                    {leaderboard[2].alumniName || `Alumni ${leaderboard[2].alumniId}`}
                  </h3>
                  <RatingStars rating={leaderboard[2].averageRating} size="sm" />
                  <p className="text-2xl font-bold text-orange-700 mt-2">
                    {leaderboard[2].leaderboardPoints.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-600">points</p>
                  {leaderboard[2].badges && leaderboard[2].badges.length > 0 && (
                    <div className="mt-3">
                      <BadgeDisplay badges={leaderboard[2].badges.slice(0, 3)} size="sm" />
                    </div>
                  )}
                </div>
                <div className="bg-orange-400 h-20 rounded-b-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-orange-700">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="space-y-3">
            {leaderboard.map((alumni, index) => {
              const rank = index + 1;
              return (
                <div
                  key={alumni.alumniId}
                  className={`rounded-lg shadow-md p-4 border-2 transition-all hover:shadow-lg ${getRankBgColor(rank)}`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="w-16 flex justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* Alumni Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {alumni.alumniName || `Alumni ${alumni.alumniId}`}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <RatingStars rating={alumni.averageRating} size="sm" />
                        <span className="text-sm text-gray-600">
                          {alumni.totalRatings} {alumni.totalRatings === 1 ? 'rating' : 'ratings'}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-center px-4">
                      <p className="text-sm text-gray-600">Sessions</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {alumni.totalSessionsConducted}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-center px-4">
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {alumni.leaderboardPoints.toFixed(0)}
                      </p>
                    </div>

                    {/* Badges */}
                    {alumni.badges && alumni.badges.length > 0 && (
                      <div className="flex items-center">
                        <BadgeDisplay badges={alumni.badges.slice(0, 4)} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
          <Award className="w-5 h-5 text-blue-600" />
          <span>How Leaderboard Works</span>
        </h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Points are calculated as: <strong>Average Rating × Total Sessions</strong></li>
          <li>Alumni with higher ratings and more sessions rank higher</li>
          <li>Badges are awarded based on performance milestones</li>
          <li>Leaderboard updates in real-time as workshops are completed</li>
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
