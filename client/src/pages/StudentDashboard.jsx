import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(new Set());

  useEffect(() => {
    if (activeTab === 'find-mentor') {
      fetchAlumniAndLeaderboard();
      fetchPendingRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, alumni]);

  const fetchAlumniAndLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [alumniRes, leaderboardRes] = await Promise.all([
        axios.get('${process.env.BACKEND_URL}/api/users/alumni', config),
        axios.get('${process.env.BACKEND_URL}/api/leaderboard?limit=1000', config),
      ]);

      const alumniData = alumniRes.data || [];
      setAlumni(alumniData);
      setFilteredAlumni(alumniData);

      // Create a map of userId -> leaderboard data
      const lbMap = {};
      (leaderboardRes.data || []).forEach((entry) => {
        if (entry.user?._id) {
          lbMap[entry.user._id] = {
            rank: entry.rank,
            points: entry.points,
            level: entry.level,
          };
        }
      });
      setLeaderboardData(lbMap);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('${process.env.BACKEND_URL}/api/mentorship-requests/student', config);
      
      // Create a Set of alumni IDs who have pending requests
      const pendingAlumniIds = new Set(
        response.data
          .filter(req => req.status === 'pending')
          .map(req => req.alumni._id)
      );
      
      setPendingRequests(pendingAlumniIds);
    } catch (error) {
      // Error handled silently
    }
  };

  const hasPendingRequest = (alumniId) => {
    return pendingRequests.has(alumniId);
  };

  const applyFilters = () => {
    if (!searchQuery.trim()) {
      setFilteredAlumni(alumni);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = alumni.filter((alum) => {
      const name = alum.name?.toLowerCase() || '';
      const college = alum.profile?.collegeName?.toLowerCase() || '';
      const company = alum.profile?.currentCompany?.toLowerCase() || '';
      return name.includes(query) || college.includes(query) || company.includes(query);
    });

    setFilteredAlumni(filtered);
  };

  const Avatar = ({ src, name, size = 'md' }) => {
    const sizeClasses = {
      sm: 'h-8 w-8 text-sm',
      md: 'h-20 w-20 text-2xl',
      lg: 'h-24 w-24 text-3xl',
    };
    const isImageUrl = typeof src === 'string' && (src.startsWith('http') || src.startsWith('data:image'));

    if (isImageUrl) {
      return (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    const initials = (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('');

    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-400 to-purple-500 text-white flex items-center justify-center font-bold border-2 border-gray-200`}
      >
        {initials || '👤'}
      </div>
    );
  };

  const getLevelIcon = (level) => {
    const icons = { Diamond: '💎', Platinum: '🏆', Gold: '🥇', Silver: '🥈', Bronze: '🥉' };
    return icons[level] || '⭐';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600 text-lg">Learn from alumni experiences and book mentorship sessions</p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('find-mentor')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'find-mentor'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🔍</span>
                <span>Find Your Mentor/Alumni</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'workshops'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📚</span>
                <span>Browse Workshops</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bookings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📅</span>
                <span>Booked Workshop</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'feedback'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>💬</span>
                <span>Give Feedback (to completed workshop.)</span>
              </span>
            </button>
            <Link
              to="/leaderboard"
              className="py-4 px-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              <span className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Leaderboard</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'find-mentor' && (
          <div className="animate-fade-in">
            {/* Section Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Browse and explore Experienced alumni profile
              </h2>
              <p className="text-gray-600">
                Learn from alumni who have successfully interviewed at top companies
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search via college name/ company name/ alumni name"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredAlumni.length} of {alumni.length} alumni
              </p>
            </div>

            {/* Alumni Grid */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading alumni profiles...</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">No alumni found matching your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((alum) => {
                  const lb = leaderboardData[alum._id] || {};
                  return (
                    <div
                      key={alum._id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-200"
                    >
                      {/* Avatar and Rank */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar src={alum.profile?.avatar} name={alum.name} size="md" />
                          <div>
                            <h3 className="font-bold text-gray-900">{alum.name || 'Alumni'}</h3>
                            <p className="text-sm text-gray-600">{alum.profile?.currentCompany || 'Company N/A'}</p>
                          </div>
                        </div>
                        {lb.rank && (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                            Rank #{lb.rank}
                          </div>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Ex. year</p>
                          <p className="text-sm font-semibold text-gray-900">{alum.profile?.graduationYear || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Job position</p>
                          <p className="text-sm font-semibold text-gray-900 truncate" title={alum.profile?.currentPosition}>
                            {alum.profile?.currentPosition || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Leaderboard rank</p>
                          <p className="text-sm font-semibold">{lb.rank ? `#${lb.rank}` : 'N/A'}</p>
                        </div>
                      </div>

                      {/* Technologies */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Interested Technology</p>
                        <div className="flex flex-wrap gap-1">
                          {(alum.profile?.technicalSkills || []).slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {(alum.profile?.technicalSkills || []).length === 0 && (
                            <span className="text-xs text-gray-500">No skills listed</span>
                          )}
                        </div>
                      </div>

                      {/* Area of Interest */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Area of interest</p>
                        <div className="flex flex-wrap gap-1">
                          {(alum.profile?.careerInterests || []).slice(0, 3).map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-200"
                            >
                              {interest}
                            </span>
                          ))}
                          {(alum.profile?.careerInterests || []).length === 0 && (
                            <span className="text-xs text-gray-500">No interests listed</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          to={`/alumni/${alum._id}`}
                          className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded text-sm font-medium text-center transition-colors"
                        >
                          Show Full Profile
                        </Link>
                        {hasPendingRequest(alum._id) ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 text-gray-500 rounded text-sm font-medium text-center cursor-not-allowed"
                            title="You already have a pending request with this alumni"
                          >
                            ✓ Request Sent
                          </button>
                        ) : (
                          <Link
                            to={`/mentorship?mentor=${alum._id}`}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium text-center transition-colors"
                          >
                            Request Mentorship
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'workshops' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Browse Workshops</h3>
            <p className="text-gray-600">Workshop browsing feature coming soon...</p>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Booked Workshops</h3>
            <p className="text-gray-600">Your workshop bookings will appear here...</p>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Give Feedback</h3>
            <p className="text-gray-600">Provide feedback for completed workshops...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
