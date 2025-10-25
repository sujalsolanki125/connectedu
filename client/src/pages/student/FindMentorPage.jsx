import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FindMentorPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    college: '',
    company: '',
    branch: '',
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(new Set());

  useEffect(() => {
    fetchAlumniAndLeaderboard();
    fetchPendingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters, alumni]);

  const fetchAlumniAndLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch alumni and leaderboard in parallel
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
    let filtered = [...alumni];

    // Search by name, college, or company
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((alum) => {
        const name = alum.name?.toLowerCase() || '';
        const college = alum.profile?.collegeName?.toLowerCase() || '';
        const company = alum.profile?.currentCompany?.toLowerCase() || '';
        return name.includes(query) || college.includes(query) || company.includes(query);
      });
    }

    // College filter
    if (filters.college.trim()) {
      filtered = filtered.filter((alum) =>
        (alum.profile?.collegeName || '').toLowerCase().includes(filters.college.toLowerCase())
      );
    }

    // Company filter
    if (filters.company.trim()) {
      filtered = filtered.filter((alum) =>
        (alum.profile?.currentCompany || '').toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    // Branch filter
    if (filters.branch.trim()) {
      filtered = filtered.filter((alum) =>
        (alum.profile?.branch || '').toLowerCase().includes(filters.branch.toLowerCase())
      );
    }

    setFilteredAlumni(filtered);
  };

  const handleRequestMentorship = (alum) => {
    setSelectedAlumni(alum);
    setShowRequestModal(true);
    setRequestMessage('');
  };

  const submitMentorshipRequest = async () => {
    if (!selectedAlumni || !requestMessage.trim()) {
      alert('Please enter a message for your mentorship request.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(
        '${process.env.BACKEND_URL}/api/mentorship-requests',
        {
          mentorId: selectedAlumni._id,
          message: requestMessage,
        },
        config
      );

      alert('Mentorship request sent successfully! The alumni will be notified.');
      setShowRequestModal(false);
      setSelectedAlumni(null);
      setRequestMessage('');
    } catch (error) {
      // Error handled silently
      alert(error.response?.data?.message || 'Failed to send mentorship request. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading alumni profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            <span className="text-5xl mr-2">🔍</span>
            Find Your Mentor/Alumni
          </h1>
          <p className="text-lg text-gray-600">
            Browse and explore experienced alumni profiles. Learn from alumni who have successfully interviewed at top companies.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Search by college name / company name / alumni name</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., John Doe, Google, MIT"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <input
                type="text"
                value={filters.college}
                onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                placeholder="Filter by college"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                placeholder="Filter by company"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input
                type="text"
                value={filters.branch}
                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                placeholder="Filter by branch"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-primary-600">{filteredAlumni.length}</span> alumni found
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ college: '', company: '', branch: '' });
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Alumni Cards Grid */}
        {filteredAlumni.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alum) => {
              const lb = leaderboardData[alum._id] || {};
              return (
                <div
                  key={alum._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 border border-gray-100"
                >
                  {/* Avatar and Rank */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar src={alum.profile?.avatar} name={alum.name} size="md" />
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900 text-lg">{alum.name || 'Alumni'}</h3>
                        <p className="text-sm text-gray-600">{alum.profile?.currentCompany || 'Company N/A'}</p>
                      </div>
                    </div>
                    {lb.rank && (
                      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        #{lb.rank}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center border">
                      <p className="text-xs text-gray-600">Ex. year</p>
                      <p className="text-sm font-bold text-gray-900">{alum.profile?.graduationYear || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border">
                      <p className="text-xs text-gray-600">Job position</p>
                      <p className="text-sm font-bold text-gray-900 truncate" title={alum.profile?.currentPosition}>
                        {alum.profile?.currentPosition || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center border">
                      <p className="text-xs text-gray-600">Level</p>
                      <p className="text-sm font-bold">
                        {getLevelIcon(lb.level)} {lb.level || 'Bronze'}
                      </p>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-700 mb-2">Interested Technology</p>
                    <div className="flex flex-wrap gap-1">
                      {(alum.profile?.technicalSkills || []).slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {(alum.profile?.technicalSkills || []).length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          +{(alum.profile?.technicalSkills || []).length - 4}
                        </span>
                      )}
                      {(!alum.profile?.technicalSkills || alum.profile.technicalSkills.length === 0) && (
                        <span className="text-xs text-gray-500">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Area of Interest */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-700 mb-2">Area of Interest</p>
                    <div className="flex flex-wrap gap-1">
                      {(alum.profile?.careerInterests || []).slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                      {(alum.profile?.careerInterests || []).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          +{(alum.profile?.careerInterests || []).length - 3}
                        </span>
                      )}
                      {(!alum.profile?.careerInterests || alum.profile.careerInterests.length === 0) && (
                        <span className="text-xs text-gray-500">No interests listed</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link
                      to={`/alumni/${alum._id}`}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm text-center transition-colors"
                    >
                      Show Full Profile
                    </Link>
                    {hasPendingRequest(alum._id) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed"
                        title="You already have a pending request with this alumni"
                      >
                        ✓ Request Sent
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestMentorship(alum)}
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg"
                      >
                        Request Mentorship
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      {showRequestModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Request Mentorship</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                <Avatar src={selectedAlumni.profile?.avatar} name={selectedAlumni.name} size="sm" />
                <div className="ml-3">
                  <p className="font-bold text-gray-900">{selectedAlumni.name}</p>
                  <p className="text-sm text-gray-600">{selectedAlumni.profile?.currentCompany || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like mentorship from this alumni..."
                rows="5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitMentorshipRequest}
                disabled={submitting || !requestMessage.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindMentorPage;
