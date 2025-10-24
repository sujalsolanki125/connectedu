import React from 'react';

/**
 * RatingStars Component
 * Displays star rating (read-only or interactive)
 * Used for displaying ratings and collecting feedback
 */
const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium', 
  interactive = false, 
  onChange = null,
  showValue = true 
}) => {
  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-xl',
    large: 'text-3xl',
  };

  const handleStarClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = starValue <= Math.floor(rating);
    const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0;

    return (
      <span
        key={index}
        onClick={() => handleStarClick(starValue)}
        className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform ${sizeClasses[size]}`}
        style={{ display: 'inline-block' }}
      >
        {isFilled ? (
          <span className="text-yellow-400">★</span>
        ) : isHalfFilled ? (
          <span className="relative">
            <span className="text-gray-300">★</span>
            <span className="absolute top-0 left-0 text-yellow-400 overflow-hidden" style={{ width: '50%' }}>★</span>
          </span>
        ) : (
          <span className="text-gray-300">★</span>
        )}
      </span>
    );
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => renderStar(index))}
      </div>
      {showValue && (
        <span className={`font-semibold ${sizeClasses[size]} text-gray-700`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

/**
 * InteractiveRatingStars Component
 * For collecting user ratings (1-5 stars)
 */
export const InteractiveRatingStars = ({ value, onChange, error }) => {
  const [hoverValue, setHoverValue] = React.useState(0);

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="text-3xl transition-transform hover:scale-125 focus:outline-none"
          >
            <span className={`${(hoverValue || value) >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
              ★
            </span>
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-gray-600 font-medium">{value} / 5</span>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RatingStars;
