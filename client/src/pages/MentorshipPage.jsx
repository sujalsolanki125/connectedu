import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

const MentorshipPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mentorId = searchParams.get('mentor');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestType, setRequestType] = useState('Career Guidance');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchStudentRequests();
    if (mentorId) {
      fetchMentorDetails(mentorId);
    }
  }, [mentorId]);

  const fetchStudentRequests = async () => {
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/mentorship-requests/student', config);
      setRequests(response.data);
    } catch (error) {
      // Error handled silently
      alert('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorDetails = async (id) => {
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000/api/users/${id}`, config);
      setSelectedMentor(response.data);
      setShowRequestModal(true);
    } catch (error) {
      // Error handled silently
      alert('Failed to load mentor details');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please provide a message explaining your request');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        'http://localhost:5000/api/mentorship-requests',
        {
          alumniId: selectedMentor._id,
          requestType,
          message
        },
        config
      );

      alert('✅ Mentorship request sent successfully!');
      setShowRequestModal(false);
      setMessage('');
      setRequestType('Career Guidance');
      navigate('/mentorship');
      fetchStudentRequests();
    } catch (error) {
      // Error handled silently
      alert(error.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      archived: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    const icons = {
      pending: '⏳',
      accepted: '✅',
      rejected: '❌',
      archived: '📁'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.pending}`}>
        {icons[status]} {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-2 flex items-center">
            🎓 Mentorship Request
          </h1>
          <p className="text-purple-100 text-lg">
            Track your mentorship requests and connect with alumni
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">📭</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Requests Yet</h2>
            <p className="text-gray-600 text-lg mb-6">
              Start by browsing alumni profiles and requesting mentorship
            </p>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Browse Alumni
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
                <div className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                <div className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'accepted').length}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
                <div className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'rejected').length}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {request.alumni?.name?.charAt(0) || '👤'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.alumni?.name || 'Alumni'}</h3>
                        <p className="text-sm text-gray-600">{request.alumni?.profile?.currentCompany || 'Company N/A'}</p>
                        <p className="text-sm text-gray-500">{request.alumni?.profile?.currentPosition || 'Position N/A'}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-gray-700">Request Type:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                        {request.requestType}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-700">Your Message:</span>
                      <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Sent on: {new Date(request.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {request.status === 'accepted' && request.responseMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-green-600 text-xl">✅</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800 mb-1">Alumni Response:</p>
                          <p className="text-sm text-green-700">{request.responseMessage}</p>
                          
                          {/* Meeting Date and Time */}
                          {(request.meetingDate || request.meetingTime) ? (
                            <div className="mt-3 bg-white rounded-lg p-3 border border-green-300">
                              <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                📅 Scheduled Meeting:
                              </p>
                              <div className="space-y-1">
                                {request.meetingDate && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Date:</span>{' '}
                                    {new Date(request.meetingDate).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                )}
                                {request.meetingTime && (
                                  <p className="text-sm text-gray-700">
                                    <span className="font-semibold">Time:</span>{' '}
                                    {new Date(`2000-01-01T${request.meetingTime}`).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                              <p className="text-xs text-yellow-700">
                                ⚠️ <span className="font-semibold">No specific meeting time scheduled.</span> Please coordinate with the alumni via the meeting link or contact them directly.
                              </p>
                            </div>
                          )}
                          
                          {request.meetingLink && (
                            <a
                              href={request.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              🔗 Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <span className="text-red-600 text-xl">❌</span>
                        <div>
                          <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Request Mentorship</h2>
              <p className="text-purple-100 mt-1">Send a request to {selectedMentor.name}</p>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6">
              {/* Mentor Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMentor.name?.charAt(0) || '👤'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedMentor.name}</h3>
                    <p className="text-sm text-gray-600">{selectedMentor.profile?.currentCompany}</p>
                    <p className="text-sm text-gray-500">{selectedMentor.profile?.currentPosition}</p>
                  </div>
                </div>
              </div>

              {/* Request Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why you're seeking mentorship and what you hope to learn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="6"
                  maxLength="1000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{message.length}/1000 characters</p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setMessage('');
                    setRequestType('Career Guidance');
                    navigate('/mentorship');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold transition-all ${
                    submitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MentorshipPage;
