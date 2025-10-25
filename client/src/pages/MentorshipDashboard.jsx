import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Users, CheckCircle, XCircle, Archive, MessageCircle, Calendar, Send } from 'lucide-react';

// Avatar component for displaying student profile pictures
const Avatar = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '👤';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Student'}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-400 to-purple-500 text-white flex items-center justify-center font-bold border-2 border-white shadow-md`}
    >
      {initials}
    </div>
  );
};

const MentorshipDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modals
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Form states
  const [responseMessage, setResponseMessage] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    total: 0,
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${process.env.BACKEND_URL}/api/mentorship-requests/alumni?status=${activeTab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(response.data);
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to fetch mentorship requests');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/mentorship-requests/alumni/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStats(response.data);
    } catch (err) {
      // Error handled silently
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setResponseMessage(
      `Hi ${request.student.name}, I'd be happy to connect with you regarding ${request.requestType}. I am generally available on weekday evenings. Please let me know your preferred time.`
    );
    setMeetingLink('');
    setMeetingDate('');
    setMeetingTime('');
    setShowAcceptModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const openProfileModal = (request) => {
    setSelectedRequest(request);
    setShowProfileModal(true);
  };

  const handleAccept = async () => {
    if (!responseMessage.trim()) {
      setError('Please provide a response message');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.BACKEND_URL}/api/mentorship-requests/${selectedRequest._id}/accept`,
        {
          responseMessage,
          meetingLink,
          meetingDate,
          meetingTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage('Request accepted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowAcceptModal(false);
      fetchRequests();
      fetchStats();
      resetForms();
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to accept request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.BACKEND_URL}/api/mentorship-requests/${selectedRequest._id}/reject`,
        {
          rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage('Request rejected');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowRejectModal(false);
      fetchRequests();
      fetchStats();
      resetForms();
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to reject request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetForms = () => {
    setResponseMessage('');
    setMeetingLink('');
    setMeetingDate('');
    setMeetingTime('');
    setRejectionReason('');
    setSelectedRequest(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (userInfo?.role !== 'alumni') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only alumni can access the mentorship dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header - Compact */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold mb-1 flex items-center">
                🧑‍🏫 Mentorship Dashboard
              </h1>
              <p className="text-purple-100 text-sm">
                Manage your mentorship requests and help students succeed
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Success/Error Messages - Compact */}
        {successMessage && (
          <div className="mb-3 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in">
            <p className="font-medium text-sm">Success</p>
            <p className="text-xs">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in">
            <p className="font-medium text-sm">Error</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* Tabs - Compact */}
        <div className="bg-white rounded-xl shadow-md p-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Pending ({stats.pending})
            </button>

            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'accepted'
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Accepted ({stats.accepted})
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'rejected'
                  ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Rejected ({stats.rejected})
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'archived'
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archived ({stats.archived})
            </button>
          </div>
        </div>

        {/* Requests Grid - Optimized Spacing */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No {activeTab} requests</h3>
            <p className="text-gray-600">
              {activeTab === 'pending'
                ? 'You have no pending mentorship requests at the moment.'
                : `You have no ${activeTab} requests.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header - Compact */}
                <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={request.student.profile?.avatar} 
                      name={request.student.name} 
                      size="sm" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate">{request.student.name}</h3>
                      <p className="text-xs text-purple-100 truncate">{request.student.college}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body - Increased Padding */}
                <div className="p-4 space-y-3">
                  {/* Request Type Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold truncate flex-1">
                      {request.requestType}
                    </span>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>

                  {/* Compact Info Grid - 2x2 with better spacing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Year</p>
                      <p className="text-sm font-bold text-gray-900">
                        {request.student.profile?.graduationYear || request.student.graduationYear || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 font-semibold mb-1">CGPA</p>
                      <p className="text-sm font-bold text-gray-900">
                        {request.student.profile?.cgpa || request.student.cgpa || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-semibold mb-1">Branch</p>
                      <p className="text-xs font-bold text-gray-900 leading-snug">
                        {request.student.profile?.branch || request.student.profile?.department || request.student.department || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 font-semibold mb-1">Backlog</p>
                      <p className="text-sm font-bold text-gray-900">
                        {request.student.profile?.backlogs ?? request.student.backlog ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Message Preview - Better Padding */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {request.message}
                    </p>
                  </div>

                  {/* Response/Rejection Message - Better Padding */}
                  {request.responseMessage && (
                    <div className="bg-green-50 border-l-3 border-green-500 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-semibold mb-1">Response:</p>
                      <p className="text-xs text-gray-700 line-clamp-2">{request.responseMessage}</p>
                    </div>
                  )}

                  {request.rejectionReason && (
                    <div className="bg-red-50 border-l-3 border-red-500 p-3 rounded-lg">
                      <p className="text-xs text-red-600 font-semibold mb-1">Rejected:</p>
                      <p className="text-xs text-gray-700 line-clamp-2">{request.rejectionReason}</p>
                    </div>
                  )}

                  {/* Action Buttons - Better Spacing */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => openProfileModal(request)}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                      View Full Profile
                    </button>

                    {activeTab === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openAcceptModal(request)}
                          className="py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => openRejectModal(request)}
                          className="py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accept Modal */}
      {showAcceptModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowAcceptModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold mb-1">Confirm Mentorship & Send Message</h2>
                  <p className="text-green-100">Accept request from {selectedRequest.student.name}</p>
                </div>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Your Message to Student *
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200 resize-none"
                  placeholder="Share your availability, suggest next steps, or provide a meeting link..."
                />
              </div>

              {/* Date and Time Pickers */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    📅 Meeting Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    ⏰ Meeting Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Meeting Link (Optional)
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors duration-200"
                  placeholder="https://calendly.com/your-link or Google Meet link"
                />
              </div>

              {/* Preview Meeting Details */}
              {(meetingDate || meetingTime) && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-sm font-bold text-green-800 mb-2">📌 Meeting Schedule Preview:</p>
                  <div className="text-sm text-gray-700">
                    {meetingDate && (
                      <p className="mb-1">
                        <span className="font-semibold">Date:</span>{' '}
                        {new Date(meetingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                    {meetingTime && (
                      <p>
                        <span className="font-semibold">Time:</span>{' '}
                        {new Date(`2000-01-01T${meetingTime}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send & Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold mb-1">Reject Mentorship Request</h2>
                  <p className="text-red-100">Are you sure you want to reject this request?</p>
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Rejection (Optional but Recommended)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors duration-200 resize-none"
                  placeholder="Unfortunately, my current schedule doesn't allow me to take on new mentees. I wish you the best of luck!"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar 
                    src={selectedRequest.student.profile?.avatar} 
                    name={selectedRequest.student.name} 
                    size="lg" 
                  />
                  <div>
                    <h2 className="text-3xl font-extrabold">{selectedRequest.student.name}</h2>
                    <p className="text-purple-100 mt-1">{selectedRequest.student.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Academic Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-700 font-medium mb-1">College</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedRequest.student.profile?.collegeName || selectedRequest.student.college || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-700 font-medium mb-1">Graduation Year</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedRequest.student.profile?.graduationYear || selectedRequest.student.graduationYear || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm text-green-700 font-medium mb-1">Department/Branch</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedRequest.student.profile?.branch || selectedRequest.student.profile?.department || selectedRequest.student.department || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-sm text-orange-700 font-medium mb-1">CGPA/SPI</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedRequest.student.profile?.cgpa || selectedRequest.student.cgpa || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-700 font-medium mb-1">Backlogs</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedRequest.student.profile?.backlogs ?? selectedRequest.student.backlog ?? 0}
                    </p>
                  </div>
                  {selectedRequest.student.profile?.currentYear && (
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <p className="text-sm text-indigo-700 font-medium mb-1">Current Year</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedRequest.student.profile.currentYear}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              {(selectedRequest.student.profile?.phoneNumber || selectedRequest.student.profile?.gender || selectedRequest.student.profile?.dateOfBirth) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">👤 Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.student.profile?.phoneNumber && (
                      <div className="bg-teal-50 rounded-xl p-4">
                        <p className="text-sm text-teal-700 font-medium mb-1">Phone Number</p>
                        <p className="text-lg font-bold text-gray-900">{selectedRequest.student.profile.phoneNumber}</p>
                      </div>
                    )}
                    {selectedRequest.student.profile?.gender && (
                      <div className="bg-pink-50 rounded-xl p-4">
                        <p className="text-sm text-pink-700 font-medium mb-1">Gender</p>
                        <p className="text-lg font-bold text-gray-900">{selectedRequest.student.profile.gender}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {selectedRequest.student.profile?.technicalSkills && selectedRequest.student.profile.technicalSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">💻 Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.student.profile.technicalSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {selectedRequest.student.profile?.softSkills && selectedRequest.student.profile.softSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🤝 Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.student.profile.softSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Interests */}
              {selectedRequest.student.profile?.careerInterests && selectedRequest.student.profile.careerInterests.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Career Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.student.profile.careerInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-md"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {(selectedRequest.student.profile?.linkedinProfile || selectedRequest.student.profile?.githubProfile || selectedRequest.student.profile?.portfolioLink) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Social Links</h3>
                  <div className="space-y-3">
                    {selectedRequest.student.profile?.linkedinProfile && (
                      <a
                        href={selectedRequest.student.profile.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="text-2xl">💼</span>
                        <div>
                          <p className="text-sm font-medium text-blue-700">LinkedIn Profile</p>
                          <p className="text-xs text-gray-600 truncate">{selectedRequest.student.profile.linkedinProfile}</p>
                        </div>
                      </a>
                    )}
                    {selectedRequest.student.profile?.githubProfile && (
                      <a
                        href={selectedRequest.student.profile.githubProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-2xl">💻</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">GitHub Profile</p>
                          <p className="text-xs text-gray-600 truncate">{selectedRequest.student.profile.githubProfile}</p>
                        </div>
                      </a>
                    )}
                    {selectedRequest.student.profile?.portfolioLink && (
                      <a
                        href={selectedRequest.student.profile.portfolioLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <span className="text-2xl">🌐</span>
                        <div>
                          <p className="text-sm font-medium text-purple-700">Portfolio Website</p>
                          <p className="text-xs text-gray-600 truncate">{selectedRequest.student.profile.portfolioLink}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Resume Link */}
              {selectedRequest.student.profile?.resumeLink && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📄 Resume</h3>
                  <a
                    href={selectedRequest.student.profile.resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-shadow"
                  >
                    <span className="text-3xl">📎</span>
                    <div>
                      <p className="font-bold">View Resume</p>
                      <p className="text-sm opacity-90">Click to open in new tab</p>
                    </div>
                  </a>
                </div>
              )}

              {/* Placement Preparation */}
              {(selectedRequest.student.profile?.interestedJobRole || selectedRequest.student.profile?.interviewExperienceLevel) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🎓 Placement Preparation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.student.profile?.interestedJobRole && (
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-yellow-700 font-medium mb-1">Interested Job Role</p>
                        <p className="text-lg font-bold text-gray-900">{selectedRequest.student.profile.interestedJobRole}</p>
                      </div>
                    )}
                    {selectedRequest.student.profile?.interviewExperienceLevel && (
                      <div className="bg-cyan-50 rounded-xl p-4">
                        <p className="text-sm text-cyan-700 font-medium mb-1">Interview Experience</p>
                        <p className="text-lg font-bold text-gray-900">{selectedRequest.student.profile.interviewExperienceLevel}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legacy Skills (fallback) */}
              {selectedRequest.student.skills && selectedRequest.student.skills.length > 0 && !selectedRequest.student.profile?.technicalSkills && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.student.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Details */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📨 Request Details</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">Request Type:</p>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {selectedRequest.requestType}
                  </span>
                  <p className="text-sm text-gray-600 font-medium mb-2 mt-4">Message:</p>
                  <p className="text-gray-700">{selectedRequest.message}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    📅 Requested on {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipDashboard;
