import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, DollarSign } from 'lucide-react';

const BookWorkshopModal = ({ isOpen, onClose, workshop, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    notes: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/alumni-features/workshop/${workshop._id}/book`,
        { notes: formData.notes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // If paid workshop, redirect to payment (in real app)
      if (workshop.isPaid) {
        alert(`Payment of ₹${workshop.price} required. Redirecting to payment gateway...`);
        // In real app: window.location.href = response.data.paymentUrl;
      }

      alert('Workshop booked successfully! You will receive confirmation once the mentor approves.');
      onBookingSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">Book Workshop</h2>
          <p className="text-sm text-gray-600 mt-1">{workshop.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Workshop Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                  {new Date(workshop.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-800">{workshop.duration} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-800 capitalize">
                  {workshop.workshopType.replace('-', ' ')}
                </span>
              </div>
              {workshop.isPaid && (
                <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                  <span className="font-semibold text-gray-800 flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Total Amount:</span>
                  </span>
                  <span className="text-xl font-bold text-green-600">₹{workshop.price}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any specific questions or topics you'd like to focus on?"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Share any specific areas you'd like the mentor to focus on during the session
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800">
                  I agree to the terms and conditions <span className="text-red-500">*</span>
                </span>
                <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Bookings are subject to mentor approval</li>
                  <li>You will receive a confirmation email once approved</li>
                  <li>Meeting link will be shared before the session</li>
                  {workshop.isPaid && (
                    <>
                      <li>Payment is required to confirm booking</li>
                      <li>Cancellation policy: Refund available up to 24 hours before the session</li>
                    </>
                  )}
                  <li>Please be on time for the session</li>
                  <li>You can provide feedback after the session completes</li>
                </ul>
              </div>
            </label>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">📌 Important:</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Your booking will be in "Pending" status until the mentor confirms</li>
              <li>• You'll receive an email notification once confirmed</li>
              <li>• The meeting link will be shared 1 hour before the session</li>
              {workshop.isPaid && (
                <li>• Payment will be processed only after mentor confirmation</li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-semibold"
              disabled={loading || !formData.agreeToTerms}
            >
              {loading ? 'Processing...' : workshop.isPaid ? `Proceed to Pay ₹${workshop.price}` : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookWorkshopModal;
