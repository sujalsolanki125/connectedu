import React from 'react';

/**
 * BadgeDisplay Component
 * Displays badges with icons and tooltips
 * Used in alumni profiles, leaderboard, and achievements
 */
const BadgeDisplay = ({ badges = [], size = 'medium', showTooltip = true }) => {
  // Badge icon mapping
  const badgeConfig = {
    'Star Mentor': { icon: '⭐', color: 'text-yellow-500', bg: 'bg-yellow-50', description: 'Average rating ≥ 4.0' },
    'Top Rated': { icon: '🏆', color: 'text-orange-500', bg: 'bg-orange-50', description: 'Average rating ≥ 4.5' },
    '50 Sessions': { icon: '🎯', color: 'text-blue-500', bg: 'bg-blue-50', description: 'Conducted 50+ sessions' },
    '100 Sessions': { icon: '💯', color: 'text-purple-500', bg: 'bg-purple-50', description: 'Conducted 100+ sessions' },
    'Community Hero': { icon: '👑', color: 'text-pink-500', bg: 'bg-pink-50', description: 'Helpful votes ≥ 50' },
  };

  // Size classes
  const sizeClasses = {
    small: 'text-lg px-2 py-1',
    medium: 'text-2xl px-3 py-2',
    large: 'text-3xl px-4 py-3',
  };

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => {
        const config = badgeConfig[badge] || { icon: '🎖️', color: 'text-gray-500', bg: 'bg-gray-50', description: badge };
        
        return (
          <div
            key={index}
            className={`relative group inline-flex items-center justify-center rounded-lg ${config.bg} ${sizeClasses[size]} transition-transform hover:scale-110`}
            title={showTooltip ? `${badge}: ${config.description}` : badge}
          >
            <span className={config.color}>{config.icon}</span>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{badge}</div>
                  <div className="text-gray-300 text-xs mt-1">{config.description}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BadgeDisplay;
