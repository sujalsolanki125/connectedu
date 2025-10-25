import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Calendar, BookMarked, Trophy, Clock, Users, Video, DollarSign, MapPin } from 'lucide-react';
import axios from 'axios';
import BrowseWorkshops from './BrowseWorkshops';
import MyBookings from './MyBookings';
import Footer from '../../components/Footer';

const StudentDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState(new Set());
  
  // Student profile state
  const [studentProfile, setStudentProfile] = useState(null);
  
  // Workshop states
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [workshopSearchQuery, setWorkshopSearchQuery] = useState('');
  const [workshopLoading, setWorkshopLoading] = useState(false);
  
  // Booking states
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingWorkshop, setBookingWorkshop] = useState(null);

  const tabs = [
    { id: 'find-mentor', label: 'Find Your Mentor/Alumni', icon: <Search className="w-5 h-5" /> },
    { id: 'workshops', label: 'Browse Workshops', icon: <Calendar className="w-5 h-5" /> },
    { id: 'bookings', label: 'Booked Workshop', icon: <BookMarked className="w-5 h-5" /> }
  ];

  // Fetch student profile on mount
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = userInfo?.token;
        if (!token) return;

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get('${process.env.BACKEND_URL}/api/profile/me', config);
        setStudentProfile(response.data);
      } catch (error) {
        // Error handled silently - user will see empty profile state
      }
    };

    fetchStudentProfile();
  }, [userInfo]);

  useEffect(() => {
    if (activeTab === 'find-mentor') {
      fetchAlumniAndLeaderboard();
      fetchPendingRequests();
    } else if (activeTab === 'workshops') {
      fetchWorkshops();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, alumni]);

  useEffect(() => {
    applyWorkshopFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopSearchQuery, workshops]);

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
      // Error handled silently - leaderboard will remain empty
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

  const fetchWorkshops = async () => {
    setWorkshopLoading(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get('${process.env.BACKEND_URL}/api/alumni-features/workshops', config);
      const workshopData = response.data?.data || [];
      setWorkshops(workshopData);
      setFilteredWorkshops(workshopData);
    } catch (error) {
      setWorkshops([]);
      setFilteredWorkshops([]);
    } finally {
      setWorkshopLoading(false);
    }
  };

  const applyWorkshopFilters = () => {
    if (!workshopSearchQuery.trim()) {
      setFilteredWorkshops(workshops);
      return;
    }

    const query = workshopSearchQuery.toLowerCase();
    const filtered = workshops.filter((workshop) => {
      const mentorName = workshop.mentor?.name?.toLowerCase() || '';
      const mentorCompany = workshop.mentor?.company?.toLowerCase() || '';
      const mentorshipTypes = workshop.mentorshipType?.join(' ').toLowerCase() || '';
      const description = workshop.description?.toLowerCase() || '';
      return mentorName.includes(query) || mentorCompany.includes(query) || 
             mentorshipTypes.includes(query) || description.includes(query);
    });

    setFilteredWorkshops(filtered);
  };

  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('${process.env.BACKEND_URL}/api/alumni-features/my-bookings', config);
      
      const bookingData = response.data?.data || [];
      setBookings(bookingData);
    } catch (error) {
      setBookings([]);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookWorkshop = async (workshop) => {
    try {
      setBookingWorkshop(workshop._id);
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const bookingData = {
        alumniId: workshop.mentor.id,
        scheduledDate: new Date(),
        scheduledTime: workshop.availableTime,
        notes: 'Looking forward to the session!',
      };

      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/alumni-features/workshop/${workshop._id}/book`,
        bookingData,
        config
      );

      if (response.data.success) {
        alert('✅ Workshop booked successfully! Check your bookings tab.');
        // Refresh workshops to update available slots
        fetchWorkshops();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to book workshop. Please try again.';
      alert('❌ ' + errorMsg);
    } finally {
      setBookingWorkshop(null);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'find-mentor':
        return (
          <div className="p-6">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-8 mb-6 text-white">
              <h2 className="text-3xl font-extrabold mb-3 flex items-center">
                <span className="mr-3 text-4xl">🎓</span>
                Browse and explore Experienced alumni profile
              </h2>
              <p className="text-white text-lg opacity-90">
                Learn from alumni who have successfully interviewed at top companies
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-primary-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 search via college name/ company name/ alumni name"
                  className="block w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all text-base font-medium"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-base text-gray-700 font-semibold">
                Showing <span className="text-primary-600 text-lg">{filteredAlumni.length}</span> of <span className="text-lg">{alumni.length}</span> alumni
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                >
                  <span>Clear search</span>
                  <span>✕</span>
                </button>
              )}
            </div>

            {/* Alumni Grid */}
            {loading ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-16 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Loading alumni profiles...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-16 text-center border border-gray-200">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No alumni found</h3>
                <p className="text-gray-600 text-lg mb-4">
                  {searchQuery 
                    ? `No results found for "${searchQuery}"`
                    : 'No alumni profiles available at the moment'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                  >
                    Clear search and show all
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAlumni.map((alum) => {
                  const lb = leaderboardData[alum._id] || {};
                  return (
                    <div
                      key={alum._id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 border border-gray-100 transform hover:-translate-y-1"
                    >
                      {/* Avatar and Name with Rank Badge */}
                      <div className="relative mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <Avatar src={alum.profile?.avatar} name={alum.name} size="md" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{alum.name || 'Alumni'}</h3>
                            <p className="text-sm text-gray-600 mb-2 flex items-center">
                              <span className="mr-2">🏢</span>
                              {alum.profile?.currentCompany || 'Company N/A'}
                            </p>
                          </div>
                        </div>
                        {lb.rank && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center space-x-1">
                              <Trophy className="w-3 h-3" />
                              <span>#{lb.rank}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Details Grid with Icons */}
                      <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 text-center border border-blue-200">
                          <p className="text-xs text-blue-600 mb-1 font-medium">📅 Ex. year</p>
                          <p className="text-sm font-bold text-gray-900">{alum.profile?.graduationYear || 'N/A'}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2.5 text-center border border-purple-200">
                          <p className="text-xs text-purple-600 mb-1 font-medium">💼 Position</p>
                          <p className="text-sm font-bold text-gray-900 truncate" title={alum.profile?.currentPosition}>
                            {alum.profile?.currentPosition || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2.5 text-center border border-yellow-200">
                          <p className="text-xs text-yellow-600 mb-1 font-medium">🏆 Rank</p>
                          <p className="text-sm font-bold text-gray-900">{lb.rank ? `#${lb.rank}` : 'N/A'}</p>
                        </div>
                      </div>

                      {/* Technologies Section */}
                      <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3.5 border border-blue-100">
                        <p className="text-xs font-bold text-gray-800 mb-2 flex items-center">
                          <span className="mr-2">💻</span>
                          Interested Technology
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(alum.profile?.technicalSkills || []).slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-white text-blue-700 text-xs font-medium rounded-full border border-blue-300 shadow-sm hover:shadow-md transition-shadow"
                            >
                              {skill}
                            </span>
                          ))}
                          {(alum.profile?.technicalSkills || []).length > 5 && (
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              +{(alum.profile?.technicalSkills || []).length - 5} more
                            </span>
                          )}
                          {(!alum.profile?.technicalSkills || alum.profile.technicalSkills.length === 0) && (
                            <span className="text-xs text-gray-500 italic">No skills listed</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <Link
                          to={`/alumni/${alum._id}`}
                          className="px-3 py-2.5 bg-white border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 rounded-lg text-xs font-semibold text-center transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md"
                        >
                          <span>👤</span>
                          <span>Show Full Profile</span>
                        </Link>
                        {hasPendingRequest(alum._id) ? (
                          <button
                            disabled
                            className="px-3 py-2.5 bg-gray-300 text-gray-600 rounded-lg text-xs font-semibold text-center cursor-not-allowed flex items-center justify-center space-x-1.5 opacity-70"
                            title="You have already sent a mentorship request to this alumni"
                          >
                            <span>✓</span>
                            <span>Request Sent</span>
                          </button>
                        ) : (
                          <Link
                            to={`/mentorship?mentor=${alum._id}`}
                            className="px-3 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold text-center transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <span>🤝</span>
                            <span>Request Mentorship</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'workshops':
        return (
          <div className="p-6">
            {/* Workshop Header */}
            <div className="mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <h2 className="text-4xl font-bold mb-3 flex items-center space-x-3">
                <Calendar className="w-10 h-10" />
                <span>Browse Workshops</span>
              </h2>
              <p className="text-blue-100 text-lg font-medium">
                Discover and book amazing workshops & mentorship sessions from industry experts
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={workshopSearchQuery}
                  onChange={(e) => setWorkshopSearchQuery(e.target.value)}
                  placeholder="🔍 Search by mentor name, company, mentorship type, or description..."
                  className="block w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-base font-medium"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-base text-gray-700 font-semibold">
                Showing <span className="text-blue-600 text-lg">{filteredWorkshops.length}</span> of <span className="text-lg">{workshops.length}</span> workshops
              </p>
              {workshopSearchQuery && (
                <button
                  onClick={() => setWorkshopSearchQuery('')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <span>Clear search</span>
                  <span>✕</span>
                </button>
              )}
            </div>

            {/* Workshops Grid */}
            {workshopLoading ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-16 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Loading workshops...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
              </div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-16 text-center border border-gray-200">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No workshops found</h3>
                <p className="text-gray-600 text-lg mb-4">
                  {workshopSearchQuery 
                    ? `No results found for "${workshopSearchQuery}"`
                    : 'No workshops available at the moment'
                  }
                </p>
                {workshopSearchQuery && (
                  <button
                    onClick={() => setWorkshopSearchQuery('')}
                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                  >
                    Clear search and show all
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredWorkshops.map((workshop) => {
                  const mentor = workshop.mentor || {};
                  const mentorName = mentor.name || 'Anonymous';
                  const mentorCompany = mentor.company || 'Not specified';
                  const mentorPosition = mentor.position || 'Professional';
                  const avatarUrl = mentor.profilePhoto;

                  return (
                    <div
                      key={workshop._id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden transform hover:scale-[1.02]"
                    >
                      {/* Card Header with Mentor Info */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                        <div className="flex items-start space-x-4">
                          <Avatar src={avatarUrl} name={mentorName} size="md" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold mb-1 truncate">{mentorName}</h3>
                            <p className="text-blue-100 text-sm font-medium mb-1 truncate">{mentorPosition}</p>
                            <p className="text-blue-100 text-sm flex items-center space-x-1">
                              <span>🏢</span>
                              <span className="truncate">{mentorCompany}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        {/* Mentorship Types */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                            <span>📋</span>
                            <span>Mentorship Types:</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {workshop.mentorshipType?.map((type, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-semibold"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        {workshop.description && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Description:</h4>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                              {workshop.description}
                            </p>
                          </div>
                        )}

                        {/* Workshop Details Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                          {/* Session Mode */}
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Video className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Mode</p>
                              <p className="font-semibold text-gray-800 text-xs">
                                {workshop.sessionMode?.join(', ') || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="font-semibold text-gray-800 text-xs">
                                {workshop.duration ? `${workshop.duration} mins` : 'Flexible'}
                              </p>
                            </div>
                          </div>

                          {/* Available Slots */}
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Users className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Slots</p>
                              <p className="font-semibold text-gray-800 text-xs">
                                {workshop.availableSlots !== undefined ? `${workshop.availableSlots} left` : 'Limited'}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-center space-x-2 text-sm">
                            <div className={`p-2 rounded-lg ${workshop.isPaidSession ? 'bg-yellow-100' : 'bg-green-100'}`}>
                              <DollarSign className={`w-4 h-4 ${workshop.isPaidSession ? 'text-yellow-600' : 'text-green-600'}`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Price</p>
                              <p className="font-semibold text-gray-800 text-xs">
                                {workshop.isPaidSession ? `₹${workshop.sessionCharge || 'N/A'}` : 'Free'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Available Days & Time */}
                        {workshop.availableDays && workshop.availableDays.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Available Days:</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {workshop.availableDays.map((day, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                            {workshop.availableTime && (
                              <p className="text-xs text-gray-600 mt-2 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{workshop.availableTime}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={() => handleBookWorkshop(workshop)}
                          disabled={bookingWorkshop === workshop._id || workshop.availableSlots === 0}
                          className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center space-x-2 ${
                            workshop.availableSlots === 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : bookingWorkshop === workshop._id
                              ? 'bg-gray-400 cursor-wait'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                          }`}
                        >
                          {bookingWorkshop === workshop._id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              <span>Booking...</span>
                            </>
                          ) : workshop.availableSlots === 0 ? (
                            <>
                              <span>❌</span>
                              <span>Fully Booked</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-5 h-5" />
                              <span>Book This Workshop</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'bookings':
        return (
          <div className="p-6">
            {/* Bookings Header */}
            <div className="mb-8 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-3 flex items-center space-x-3">
                    <BookMarked className="w-10 h-10" />
                    <span>My Booked Workshops</span>
                  </h2>
                  <p className="text-green-100 text-lg font-medium">
                    Track and manage all your workshop bookings in one place
                  </p>
                </div>
                <button
                  onClick={fetchBookings}
                  disabled={bookingLoading}
                  className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md disabled:opacity-50 flex items-center space-x-2"
                >
                  <svg className={`w-5 h-5 ${bookingLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{bookingLoading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* Bookings Content */}
            {bookingLoading ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-16 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Loading your bookings...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-16 text-center border border-gray-200">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 text-lg mb-6">
                  You haven't booked any workshops yet. Browse workshops to get started!
                </p>
                <button
                  onClick={() => setActiveTab('workshops')}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                >
                  Browse Workshops
                </button>
              </div>
            ) : (
              <div>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bookings.filter((b) => b.status === 'Pending').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter((b) => b.status === 'Confirmed').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {bookings.filter((b) => b.status === 'Completed').length}
                    </p>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const mentor = booking.mentor || {};
                    const mentorName = mentor.name || 'Anonymous';
                    const mentorCompany = mentor.company || 'Not specified';
                    const mentorPosition = mentor.position || 'Professional';
                    const avatarUrl = mentor.profilePhoto;

                    // Status color mapping
                    const statusColors = {
                      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                      Confirmed: 'bg-green-100 text-green-700 border-green-300',
                      Completed: 'bg-purple-100 text-purple-700 border-purple-300',
                      Cancelled: 'bg-red-100 text-red-700 border-red-300',
                    };

                    return (
                      <div
                        key={booking._id}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4 flex-1">
                              <Avatar src={avatarUrl} name={mentorName} size="md" />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center space-x-2">
                                  <span className="truncate">{booking.workshopTitle || 'Workshop'}</span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                      statusColors[booking.status] || 'bg-gray-100 text-gray-700 border-gray-300'
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </h3>
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-semibold">Mentor:</span> {mentorName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Company:</span> {mentorCompany} · {mentorPosition}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Workshop Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Mentorship Types */}
                            {booking.mentorshipType && booking.mentorshipType.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Mentorship Types:</p>
                                <div className="flex flex-wrap gap-1">
                                  {booking.mentorshipType.map((type, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Session Details */}
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm">
                                <Video className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-700">
                                  {booking.sessionMode?.join(', ') || 'Online'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">
                                  {booking.duration ? `${booking.duration} mins` : 'Flexible'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="w-4 h-4 text-yellow-600" />
                                <span className="text-gray-700">
                                  {booking.isPaidSession ? `₹${booking.sessionCharge}` : 'Free'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {booking.description && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 line-clamp-2">{booking.description}</p>
                            </div>
                          )}

                          {/* Scheduled Time */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Scheduled Time:</p>
                            <p className="text-sm font-semibold text-gray-800">
                              📅 {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-sm text-gray-700">⏰ {booking.scheduledTime}</p>
                          </div>

                          {/* Meeting Link (if confirmed) */}
                          {booking.status === 'Confirmed' && booking.meetingLink && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                              <p className="text-xs text-green-700 mb-1 font-semibold">Meeting Link:</p>
                              <a
                                href={booking.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:text-green-700 underline break-all"
                              >
                                {booking.meetingLink}
                              </a>
                            </div>
                          )}

                          {/* Booking Date */}
                          <p className="text-xs text-gray-500">
                            Booked on: {new Date(booking.bookedAt).toLocaleDateString('en-US')} at{' '}
                            {new Date(booking.bookedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Student Avatar */}
              <Avatar 
                src={studentProfile?.avatar} 
                name={userInfo?.name} 
                size="lg" 
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {userInfo?.name?.split(' ')[0] || 'Student'}! Learn from alumni experiences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
