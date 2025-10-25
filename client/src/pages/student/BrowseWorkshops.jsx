import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterBar from '../../components/FilterBar';
import { Calendar, Clock, Users, DollarSign, Award, ChevronRight } from 'lucide-react';
import BadgeDisplay from '../../components/BadgeDisplay';
import RatingStars from '../../components/RatingStars';
import WorkshopDetailModal from './WorkshopDetailModal';

const BrowseWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    priceType: ''
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workshops, filters]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/workshops',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Only show upcoming workshops
      const upcomingWorkshops = (response.data.workshops || []).filter(
        w => w.status === 'upcoming'
      );
      setWorkshops(upcomingWorkshops);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workshops');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...workshops];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.title.toLowerCase().includes(searchLower) ||
        w.description.toLowerCase().includes(searchLower) ||
        w.topics?.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(w => w.category === filters.category);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(w => w.workshopType === filters.type);
    }

    // Price filter
    if (filters.priceType) {
      if (filters.priceType === 'free') {
        filtered = filtered.filter(w => !w.isPaid);
      } else if (filters.priceType === 'paid') {
        filtered = filtered.filter(w => w.isPaid);
      }
    }

    // Sort by date (nearest first)
    filtered.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    setFilteredWorkshops(filtered);
  };

  const handleViewDetails = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowDetailModal(true);
  };

  const getAvailableSpots = (workshop) => {
    const confirmed = workshop.bookings?.filter(b => b.status === 'confirmed').length || 0;
    return workshop.maxParticipants - confirmed;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(workshops.map(w => w.category))];
    return categories.sort();
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

  const filterOptions = [
    {
      label: 'Category',
      value: filters.category,
      onChange: (value) => setFilters(prev => ({ ...prev, category: value })),
      options: ['All Categories', ...getUniqueCategories()]
    },
    {
      label: 'Type',
      value: filters.type,
      onChange: (value) => setFilters(prev => ({ ...prev, type: value })),
      options: ['All Types', 'mentorship', 'workshop', 'mock-interview', 'career-guidance']
    },
    {
      label: 'Price',
      value: filters.priceType,
      onChange: (value) => setFilters(prev => ({ ...prev, priceType: value })),
      options: ['All Prices', 'free', 'paid']
    }
  ];

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Workshops</h1>
        <p className="text-gray-600">
          Find mentorship sessions and workshops hosted by experienced alumni
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        filterOptions={filterOptions}
        activeFilters={filters}
        onReset={() => setFilters({ search: '', category: '', type: '', priceType: '' })}
      />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredWorkshops.length} of {workshops.length} workshops
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Workshops Grid */}
      {filteredWorkshops.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No workshops found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => {
            const availableSpots = getAvailableSpots(workshop);
            const isFullyBooked = availableSpots <= 0;

            return (
              <div
                key={workshop._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {workshop.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                        {workshop.workshopType.replace('-', ' ').toUpperCase()}
                      </span>
                      {workshop.isPaid ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                          ₹{workshop.price}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                    {workshop.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-xs">{formatDate(workshop.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{workshop.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>
                        {availableSpots > 0 ? (
                          <>{availableSpots} spots left</>
                        ) : (
                          <span className="text-red-600 font-semibold">Fully Booked</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-4 text-xs text-gray-500">
                    Category: <span className="text-gray-700">{workshop.category}</span>
                  </div>

                  {/* Mentor Info */}
                  {workshop.mentorInfo && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Mentor</p>
                          <p className="font-medium text-sm text-gray-800">
                            {workshop.mentorInfo.name || 'Alumni'}
                          </p>
                          {workshop.mentorInfo.averageRating > 0 && (
                            <RatingStars rating={workshop.mentorInfo.averageRating} size="sm" />
                          )}
                        </div>
                        {workshop.mentorInfo.badges && workshop.mentorInfo.badges.length > 0 && (
                          <BadgeDisplay badges={workshop.mentorInfo.badges.slice(0, 2)} size="sm" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewDetails(workshop)}
                    className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isFullyBooked
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workshop Detail Modal */}
      {showDetailModal && selectedWorkshop && (
        <WorkshopDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWorkshop(null);
          }}
          workshop={selectedWorkshop}
          onBooked={fetchWorkshops}
        />
      )}
    </div>
  );
};

export default BrowseWorkshops;
