import React from 'react';
import { Calendar, Clock, Users, DollarSign, Video, Edit, Trash2 } from 'lucide-react';

const WorkshopCard = ({ workshop, onEdit, onDelete, onManageBookings }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWorkshopStatus = () => {
    if (!workshop.isActive) return 'cancelled';
    const scheduledDate = workshop.scheduledDate ? new Date(workshop.scheduledDate) : null;
    if (!scheduledDate) return 'upcoming';
    return scheduledDate > new Date() ? 'upcoming' : 'completed';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getBookingStats = () => {
    const confirmed = workshop.bookings?.filter(b => b.status === 'Confirmed').length || 0;
    const pending = workshop.bookings?.filter(b => b.status === 'Pending').length || 0;
    const total = workshop.bookings?.length || 0;
    
    return { confirmed, pending, total };
  };

  const workshopStatus = getWorkshopStatus();
  const { confirmed, pending, total } = getBookingStats();
  const spotsLeft = workshop.maxParticipants - confirmed;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{workshop.title || 'Untitled Workshop'}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(workshopStatus)}`}>
                {workshopStatus.toUpperCase()}
              </span>
              {workshop.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {workshop.category.toUpperCase()}
                </span>
              )}
              {workshop.workshopType && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  {workshop.workshopType.replace('-', ' ').toUpperCase()}
                </span>
              )}
              {workshop.isPaidSession && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  PAID
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workshop.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{formatDate(workshop.scheduledDate)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-green-500" />
            <span>{workshop.duration} minutes</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-purple-500" />
            <span>
              {confirmed}/{workshop.maxParticipants} confirmed
              {pending > 0 && <span className="text-orange-600"> (+{pending} pending)</span>}
            </span>
          </div>
          {workshop.isPaidSession && workshop.sessionCharge && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              <span>₹{workshop.sessionCharge}</span>
            </div>
          )}
        </div>

        {/* Meeting Link */}
        {workshop.meetingLink && (
          <div className="flex items-center space-x-2 text-sm mb-4 p-3 bg-blue-50 rounded-lg">
            <Video className="w-4 h-4 text-blue-600" />
            <a
              href={workshop.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline truncate"
            >
              {workshop.meetingLink}
            </a>
          </div>
        )}

        {/* Topics */}
        {workshop.topics && workshop.topics.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {workshop.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-500">Category: </span>
          <span className="text-xs text-gray-700">{workshop.category}</span>
        </div>

        {/* Availability Alert */}
        {workshopStatus === 'upcoming' && spotsLeft <= 3 && spotsLeft > 0 && (
          <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
            ⚠️ Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left!
          </div>
        )}

        {workshopStatus === 'upcoming' && spotsLeft <= 0 && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            🚫 Workshop is fully booked
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {workshopStatus === 'upcoming' && (
            <>
              {total > 0 && (
                <button
                  onClick={() => onManageBookings(workshop)}
                  className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Manage Bookings ({total})
                </button>
              )}
              <button
                onClick={() => onEdit(workshop)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(workshop._id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}

          {workshopStatus === 'completed' && (
            <div className="w-full text-center text-sm text-gray-500">
              ✅ Workshop completed • {total} {total === 1 ? 'participant' : 'participants'}
            </div>
          )}

          {workshopStatus === 'cancelled' && (
            <div className="w-full text-center text-sm text-red-500">
              ❌ Workshop cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
