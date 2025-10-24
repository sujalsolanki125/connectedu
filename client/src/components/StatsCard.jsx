import React from 'react';

/**
 * StatsCard Component
 * Reusable card for displaying statistics
 * Used in dashboards and profile pages
 */
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue', 
  trend = null,
  onClick = null 
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900',
      border: 'border-green-200',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      border: 'border-purple-200',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      border: 'border-orange-200',
    },
    pink: {
      bg: 'bg-pink-50',
      icon: 'text-pink-600',
      text: 'text-pink-900',
      border: 'border-pink-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      border: 'border-yellow-200',
    },
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <div
      onClick={onClick}
      className={`${colors.bg} rounded-xl p-6 border-2 ${colors.border} transition-all duration-300 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon */}
          {icon && (
            <div className={`${colors.icon} text-3xl mb-3`}>
              {icon}
            </div>
          )}

          {/* Title */}
          <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-2">
            {title}
          </h3>

          {/* Value */}
          <div className={`${colors.text} text-3xl font-bold mb-1`}>
            {value}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">
              {subtitle}
            </p>
          )}

          {/* Trend */}
          {trend && (
            <div className="mt-3 flex items-center gap-1">
              {trend.direction === 'up' ? (
                <span className="text-green-600 text-sm">↑ {trend.value}</span>
              ) : trend.direction === 'down' ? (
                <span className="text-red-600 text-sm">↓ {trend.value}</span>
              ) : (
                <span className="text-gray-600 text-sm">→ {trend.value}</span>
              )}
              <span className="text-gray-500 text-xs">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * StatsGrid Component
 * Grid layout for multiple stats cards
 */
export const StatsGrid = ({ children, columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {children}
    </div>
  );
};

export default StatsCard;
