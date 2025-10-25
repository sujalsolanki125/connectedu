import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, Video, MessageSquare, CheckCircle, XCircle, Clock as Pending } from 'lucide-react';
import SubmitFeedbackModal from './SubmitFeedbackModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/my-bookings',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setBookings(response.data.bookings || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackModal(false);
    setSelectedBooking(null);
    fetchMyBookings(); // Refresh bookings
  };

  const getFilteredBookings = () => {
    if (filterStatus === 'all') return bookings;
    return bookings.filter(b => b.status === filterStatus);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Pending className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      attended: 'bg-blue-100 text-blue-800',
      absent: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isWorkshopCompleted = (scheduledDate) => {
    return new Date(scheduledDate) < new Date();
  };

  const canSubmitFeedback = (booking) => {
    // Can submit feedback if workshop is completed and booking was confirmed/attended
    return (
      isWorkshopCompleted(booking.workshop.scheduledDate) &&
      (booking.status === 'confirmed' || booking.status === 'attended') &&
      !booking.feedbackSubmitted
    );
  };

  const getStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b =>
      (b.status === 'attended' || b.status === 'confirmed') &&
      isWorkshopCompleted(b.workshop.scheduledDate)
    ).length;

    return { total, pending, confirmed, completed };
  };

  const stats = getStats();
  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
        <p className="text-gray-600">Track your workshop bookings and provide feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        {['all', 'pending', 'confirmed', 'attended', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-2">
            {bookings.length === 0
              ? "You haven't booked any workshops yet"
              : "No bookings match the selected filter"}
          </p>
          <p className="text-sm text-gray-500">
            Browse available workshops and book your first mentorship session!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {booking.workshop.title}
                    </h3>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                        {booking.status.toUpperCase()}
                      </span>
                      {booking.feedbackSubmitted && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          ✓ FEEDBACK SUBMITTED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workshop Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>{formatDate(booking.workshop.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{booking.workshop.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="capitalize">{booking.workshop.workshopType.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Mentor:</span>{' '}
                      <span className="font-medium text-gray-800">
                        {booking.workshop.mentorName || 'Alumni Mentor'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Booked on:</span>{' '}
                      <span className="text-gray-800">
                        {new Date(booking.bookedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {booking.workshop.isPaid && (
                      <div>
                        <span className="text-gray-600">Amount Paid:</span>{' '}
                        <span className="font-medium text-green-600">₹{booking.workshop.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Your Notes:</p>
                    <p className="text-sm text-gray-800">{booking.notes}</p>
                  </div>
                )}

                {/* Meeting Link */}
                {booking.status === 'confirmed' && booking.workshop.meetingLink && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-800">Meeting Link:</span>
                    </div>
                    <a
                      href={booking.workshop.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {booking.workshop.meetingLink}
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Booking ID: {booking._id.slice(-8)}
                  </div>
                  
                  {canSubmitFeedback(booking) && (
                    <button
                      onClick={() => handleSubmitFeedback(booking)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Submit Feedback</span>
                    </button>
                  )}

                  {booking.status === 'pending' && (
                    <div className="text-sm text-yellow-600 font-medium">
                      ⏳ Waiting for mentor confirmation
                    </div>
                  )}

                  {booking.status === 'rejected' && (
                    <div className="text-sm text-red-600 font-medium">
                      ❌ Booking was not approved by mentor
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Feedback Modal */}
      {showFeedbackModal && selectedBooking && (
        <SubmitFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default MyBookings;
