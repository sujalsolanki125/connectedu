import React, { useState } from 'react';

const RatingModal = ({ isOpen, onClose, alumniName, sessionType, onSubmit }) => {
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    knowledge: 0,
    communication: 0,
    helpfulness: 0,
    punctuality: 0
  });
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'knowledge', label: 'Knowledge & Expertise', icon: '🧠' },
    { id: 'communication', label: 'Communication Skills', icon: '💬' },
    { id: 'helpfulness', label: 'Helpfulness', icon: '🤝' },
    { id: 'punctuality', label: 'Punctuality', icon: '⏰' }
  ];

  const handleCategoryRating = (category, rating) => {
    setCategoryRatings({ ...categoryRatings, [category]: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    const incompleteCategories = Object.values(categoryRatings).filter(r => r === 0);
    if (incompleteCategories.length > 0) {
      alert('Please rate all categories');
      return;
    }

    setIsSubmitting(true);

    // Prepare rating data
    const ratingData = {
      overallRating,
      categoryRatings,
      review: review.trim(),
      sessionType,
      alumniName,
      date: new Date().toISOString()
    };

    // Call parent submit handler
    await onSubmit(ratingData);
    
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setOverallRating(0);
    setCategoryRatings({
      knowledge: 0,
      communication: 0,
      helpfulness: 0,
      punctuality: 0
    });
    setReview('');
    onClose();
  };

  const renderStars = (rating, onRatingChange, hoverValue, onHover) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          >
            <span className={star <= (hoverValue || rating) ? 'text-yellow-400' : 'text-gray-300'}>
              ⭐
            </span>
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Rate Your Session 🌟</h2>
              <p className="text-white/90">
                Session with <strong>{alumniName}</strong> • {sessionType}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Overall Experience
            </label>
            <div className="flex items-center gap-4">
              {renderStars(overallRating, setOverallRating, hoverRating, setHoverRating)}
              {overallRating > 0 && (
                <span className="text-2xl font-bold text-gray-900">
                  {overallRating}.0
                </span>
              )}
            </div>
            {overallRating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {overallRating === 5 && '🎉 Excellent! You had an amazing experience!'}
                {overallRating === 4 && '👍 Great! You had a very good experience!'}
                {overallRating === 3 && '😊 Good! The session met expectations.'}
                {overallRating === 2 && '😐 Fair. There\'s room for improvement.'}
                {overallRating === 1 && '😞 Poor. We\'re sorry to hear that.'}
              </p>
            )}
          </div>

          {/* Category Ratings */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rate Different Aspects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <label className="block font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    {category.label}
                  </label>
                  <div className="flex items-center gap-3">
                    {renderStars(
                      categoryRatings[category.id],
                      (rating) => handleCategoryRating(category.id, rating)
                    )}
                    {categoryRatings[category.id] > 0 && (
                      <span className="text-lg font-bold text-gray-700">
                        {categoryRatings[category.id]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Written Review (Optional) */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Share Your Experience (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
              maxLength="500"
              placeholder="What did you like? How did this session help you? Any suggestions for improvement?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 resize-none"
            />
            <div className="text-sm text-gray-500 mt-2 text-right">
              {review.length}/500 characters
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-sm text-blue-900 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                Your feedback helps us maintain quality and helps other students make informed decisions. 
                Your review will be displayed on the alumni's profile as a verified review.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || overallRating === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
