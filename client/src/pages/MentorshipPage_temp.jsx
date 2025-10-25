import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Calendar, 
  Star,
  Send,
  CheckCircle,
  Clock,
  Building2,
  MapPin,
  Mail,
  MessageSquare
} from 'lucide-react';

const FindYourMentorPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // Request modal state
  const [requestType, setRequestType] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Track existing requests
  const [existingRequests, setExistingRequests] = useState({});

  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };

  // Fetch all alumni
  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await axios.get('${process.env.BACKEND_URL}/api/users/alumni', config);
      setAlumni(response.data);
      setFilteredAlumni(response.data);
      
      // Check existing requests for each alumni
      await checkExistingRequests(response.data);
    } catch (error) {
      // Error handled silently
      alert('Failed to load alumni profiles');
    } finally {
      setLoading(false);
    }
  };

  // Check if student has pending requests with alumni
  const checkExistingRequests = async (alumniList) => {
    try {
      const requests = {};
      for (const alum of alumniList) {
        const response = await axios.get(
          `${process.env.BACKEND_URL}/api/mentorship-requests/check/${alum._id}`,
          config
        );
        requests[alum._id] = response.data.hasRequest;
      }
      setExistingRequests(requests);
    } catch (error) {
      // Error handled silently
    }
  };

  // Filter alumni based on search and company
  useEffect(() => {
    let filtered = alumni;

    if (searchQuery) {
      filtered = filtered.filter(alum =>
        alum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.profile?.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.profile?.currentPosition?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCompany) {
      filtered = filtered.filter(alum =>
        alum.profile?.currentCompany?.toLowerCase().includes(filterCompany.toLowerCase())
      );
    }

    setFilteredAlumni(filtered);
  }, [searchQuery, filterCompany, alumni]);

  // Get unique companies for filter
  const companies = [...new Set(alumni.map(alum => alum.profile?.currentCompany).filter(Boolean))];

  const handleRequestMentorship = (alum) => {
    setSelectedAlumni(alum);
    setShowRequestModal(true);
    setRequestType('');
    setRequestMessage('');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!requestType || !requestMessage.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        '${process.env.BACKEND_URL}/api/mentorship-requests',
        {
          alumniId: selectedAlumni._id,
          requestType,
          message: requestMessage,
        },
        config
      );

      alert('âœ… Mentorship request sent successfully!');
      setShowRequestModal(false);
      setSelectedAlumni(null);
      
      // Update existing requests
      setExistingRequests(prev => ({ ...prev, [selectedAlumni._id]: true }));
    } catch (error) {
      // Error handled silently
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const requestTypes = [
    'Career Guidance',
    'Resume Review',
    'Technical Interview Prep',
    'Behavioral Interview Prep',
    'Project Discussion',
    'Skill Development',
    'General Mentorship',
    'Job Referral',
    'Networking',
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading alumni profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-2 flex items-center">
            <GraduationCap className="mr-3" size={40} />
            Find Your Mentor
          </h1>
          <p className="text-purple-100 text-lg">
            Connect with experienced alumni for personalized career guidance and interview preparation
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, company, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Companies</option>
              {companies.map((company, idx) => (
                <option key={idx} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alum) => (
            <div
              key={alum._id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Card Header with Avatar */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-purple-600">
                    {alum.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{alum.name}</h3>
                    <p className="text-purple-100 text-sm">{alum.email}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-2">
                  <Briefcase className="text-purple-600 mt-1" size={18} />
                  <div>
                    <p className="font-semibold text-gray-900">{alum.profile?.currentPosition || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{alum.profile?.currentCompany || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <GraduationCap className="text-purple-600" size={18} />
                  <p className="text-sm text-gray-700">{alum.profile?.college || 'N/A'}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="text-purple-600" size={18} />
                  <p className="text-sm text-gray-700">Class of {alum.profile?.graduationYear || 'N/A'}</p>
                </div>

                {alum.profile?.expertise && alum.profile.expertise.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {alum.profile.expertise.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {alum.profile.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{alum.profile.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Request Button */}
                <div className="pt-3">
                  {existingRequests[alum._id] ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <CheckCircle size={18} />
                      <span>Request Sent</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestMentorship(alum)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Send size={18} />
                      <span>Request Mentorship</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">ðŸ”</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No alumni found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">Request Mentorship</h2>
              <p className="text-purple-100 mt-1">Send a mentorship request to {selectedAlumni.name}</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select request type...</option>
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                  placeholder="Explain why you'd like to connect and what you hope to learn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{requestMessage.length}/1000 characters</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedAlumni(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindYourMentorPage;

