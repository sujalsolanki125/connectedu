import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Video, Mail, Calendar } from 'lucide-react';

const BookingManagement = ({ isOpen, onClose, workshop, onBookingsUpdated }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetingLink, setMeetingLink] = useState(workshop.meetingLink || '');

  useEffect(() => {
    if (workshop.bookings) {
      // Populate student details (in real app, fetch from API)
      setBookings(workshop.bookings);
    }
  }, [workshop]);

  const handleConfirmBooking = async (bookingId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/alumni-features/workshop/${workshop._id}/booking/${bookingId}`,
        { 
          status: 'Confirmed',
          meetingLink: meetingLink || workshop.meetingLink
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedBookings = bookings.map(b =>
          b._id === bookingId ? { ...b, status: 'Confirmed' } : b
        );
        setBookings(updatedBookings);
        if (onBookingsUpdated) {
          onBookingsUpdated(workshop._id, updatedBookings);
        }
        
        alert('✅ Booking confirmed successfully! Student will be notified.');
        setError('');
      }
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to confirm booking');
      alert('❌ Failed to confirm booking: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to reject/cancel this booking?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/alumni-features/workshop/${workshop._id}/booking/${bookingId}`,
        { status: 'Cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedBookings = bookings.map(b =>
          b._id === bookingId ? { ...b, status: 'Cancelled' } : b
        );
        setBookings(updatedBookings);
        if (onBookingsUpdated) {
          onBookingsUpdated(workshop._id, updatedBookings);
        }
        
        alert('✅ Booking cancelled successfully!');
        setError('');
      }
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to cancel booking');
      alert('❌ Failed to cancel booking: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeetingLink = async () => {
    if (!meetingLink.trim()) {
      setError('Please enter a valid meeting link');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.patch(
        `http://localhost:5000/api/alumni-features/workshop/${workshop._id}/meeting-link`,
        { meetingLink },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setError('');
      alert('Meeting link added successfully! Students will be notified.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add meeting link');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkshop = async () => {
    if (!window.confirm('Mark this workshop as completed? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `http://localhost:5000/api/alumni-features/workshop/${workshop._id}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Workshop marked as completed!');
      onClose();
      window.location.reload(); // Refresh to show updated status
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete workshop');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      Confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      Cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      Completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
      // Support old lowercase values for backward compatibility
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
      attended: { color: 'bg-blue-100 text-blue-800', text: 'Attended' },
      absent: { color: 'bg-gray-100 text-gray-800', text: 'Absent' }
    };
    const badge = badges[status] || badges.Pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending' || b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed' || b.status === 'confirmed').length,
    rejected: bookings.filter(b => b.status === 'Cancelled' || b.status === 'cancelled' || b.status === 'rejected').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Manage Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">{workshop.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-600">Total</p>
              <p className="text-xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-yellow-600">Pending</p>
              <p className="text-xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-green-600">Confirmed</p>
              <p className="text-xl font-bold text-green-800">{stats.confirmed}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-red-600">Rejected</p>
              <p className="text-xl font-bold text-red-800">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Meeting Link Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Video className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Meeting Link</h3>
            </div>
            <div className="flex space-x-2">
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xxx or https://zoom.us/j/xxx"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddMeetingLink}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {workshop.meetingLink ? 'Update' : 'Add'} Link
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Share the meeting link with confirmed participants
            </p>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-3">Bookings ({bookings.length})</h3>
            
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings yet
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {booking.studentName || `Student ID: ${booking.studentId}`}
                        </h4>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Booked: {formatDate(booking.bookedAt)}</span>
                        </div>
                        {booking.studentEmail && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{booking.studentEmail}</span>
                          </div>
                        )}
                      </div>

                      {booking.notes && (
                        <p className="mt-2 text-sm text-gray-700 italic bg-gray-50 p-2 rounded">
                          Note: {booking.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {(booking.status === 'Pending' || booking.status === 'pending') && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleConfirmBooking(booking._id)}
                          disabled={loading}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 font-medium"
                          title="Accept Booking"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking._id)}
                          disabled={loading}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 font-medium"
                          title="Reject Booking"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                    
                    {(booking.status === 'Confirmed' || booking.status === 'confirmed') && (
                      <div className="ml-4">
                        <span className="text-green-600 text-sm font-medium flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span>Confirmed</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Complete Workshop Button */}
          {workshop.status === 'upcoming' && stats.confirmed > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCompleteWorkshop}
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 font-semibold"
              >
                Mark Workshop as Completed
              </button>
              <p className="text-xs text-gray-600 text-center mt-2">
                This will mark the workshop as completed and allow students to submit feedback
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
