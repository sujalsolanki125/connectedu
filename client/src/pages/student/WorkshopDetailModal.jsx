import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, DollarSign, Video, Award, X } from 'lucide-react';
import BadgeDisplay from '../../components/BadgeDisplay';
import RatingStars from '../../components/RatingStars';
import BookWorkshopModal from './BookWorkshopModal';

const WorkshopDetailModal = ({ isOpen, onClose, workshop, onBooked }) => {
  const [showBookModal, setShowBookModal] = useState(false);

  if (!isOpen || !workshop) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableSpots = () => {
    const confirmed = workshop.bookings?.filter(b => b.status === 'confirmed').length || 0;
    return workshop.maxParticipants - confirmed;
  };

  const availableSpots = getAvailableSpots();
  const isFullyBooked = availableSpots <= 0;

  const handleBookClick = () => {
    setShowBookModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookModal(false);
    onBooked();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{workshop.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                    {workshop.workshopType.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {workshop.category}
                  </span>
                  {workshop.isPaid ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      ₹{workshop.price}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      FREE
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Workshop</h3>
              <p className="text-gray-700 leading-relaxed">{workshop.description}</p>
            </div>

            {/* Workshop Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Workshop Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{formatDate(workshop.scheduledDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Clock className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{workshop.duration} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Available Spots</p>
                      <p className="font-medium">
                        {isFullyBooked ? (
                          <span className="text-red-600">Fully Booked</span>
                        ) : (
                          <>{availableSpots} of {workshop.maxParticipants} spots left</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentor Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Mentor</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-800 mb-2">
                    {workshop.mentorInfo?.name || 'Alumni Mentor'}
                  </p>
                  
                  {workshop.mentorInfo?.averageRating > 0 && (
                    <div className="mb-3">
                      <RatingStars rating={workshop.mentorInfo.averageRating} size="md" />
                      <p className="text-sm text-gray-600 mt-1">
                        {workshop.mentorInfo.averageRating.toFixed(1)} average rating
                        {workshop.mentorInfo.totalRatings && ` (${workshop.mentorInfo.totalRatings} reviews)`}
                      </p>
                    </div>
                  )}

                  {workshop.mentorInfo?.totalSessionsConducted > 0 && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Sessions Conducted:</span> {workshop.mentorInfo.totalSessionsConducted}
                    </p>
                  )}

                  {workshop.mentorInfo?.badges && workshop.mentorInfo.badges.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Badges:</p>
                      <BadgeDisplay badges={workshop.mentorInfo.badges} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Topics Covered */}
            {workshop.topics && workshop.topics.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {workshop.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {workshop.prerequisites && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Prerequisites</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {workshop.prerequisites}
                </p>
              </div>
            )}

            {/* Meeting Link (if available) */}
            {workshop.meetingLink && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Video className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-800">Meeting Link Available</h3>
                </div>
                <p className="text-sm text-gray-600">
                  The meeting link will be shared with you after booking confirmation
                </p>
              </div>
            )}

            {/* Booking Alert */}
            {availableSpots <= 3 && availableSpots > 0 && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-700 font-medium">
                  ⚠️ Only {availableSpots} {availableSpots === 1 ? 'spot' : 'spots'} left! Book now before it fills up.
                </p>
              </div>
            )}

            {/* Book Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleBookClick}
                disabled={isFullyBooked}
                className={`px-8 py-2 rounded-lg font-semibold transition-colors ${
                  isFullyBooked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFullyBooked ? 'Fully Booked' : workshop.isPaid ? `Book for ₹${workshop.price}` : 'Book Now (Free)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Workshop Modal */}
      {showBookModal && (
        <BookWorkshopModal
          isOpen={showBookModal}
          onClose={() => setShowBookModal(false)}
          workshop={workshop}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default WorkshopDetailModal;
