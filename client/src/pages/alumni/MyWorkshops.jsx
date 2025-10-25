import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Filter } from 'lucide-react';
import WorkshopCard from './WorkshopCard';
import CreateWorkshopModal from './CreateWorkshopModal';
import BookingManagement from './BookingManagement';
import EditWorkshopModal from './EditWorkshopModal';

const MyWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMyWorkshops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workshops, filterStatus]);

  const fetchMyWorkshops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      
      const response = await axios.get(
        '${process.env.BACKEND_URL}/api/alumni-features/my-workshops',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      
      setWorkshops(response.data.data || []);
      setError('');
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to fetch workshops');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...workshops];
    const now = new Date();

    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => {
        const scheduledDate = w.scheduledDate ? new Date(w.scheduledDate) : null;
        if (filterStatus === 'upcoming') {
          return w.isActive && scheduledDate && scheduledDate > now;
        } else if (filterStatus === 'completed') {
          return scheduledDate && scheduledDate <= now;
        } else if (filterStatus === 'cancelled') {
          return !w.isActive;
        }
        return true;
      });
    }

    // Sort by date (upcoming first, then by nearest date)
    filtered.sort((a, b) => {
      const aDate = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
      const bDate = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
      const aIsUpcoming = a.isActive && aDate > now;
      const bIsUpcoming = b.isActive && bDate > now;
      
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;
      return aDate - bDate;
    });

    setFilteredWorkshops(filtered);
  };

  const handleWorkshopCreated = (newWorkshop) => {
    setWorkshops(prev => [newWorkshop, ...prev]);
    setShowCreateModal(false);
  };

  const handleEdit = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowEditModal(true);
  };

  const handleWorkshopUpdated = (updatedWorkshop) => {
    setWorkshops(prev => 
      prev.map(w => w._id === updatedWorkshop._id ? updatedWorkshop : w)
    );
    setShowEditModal(false);
    setSelectedWorkshop(null);
  };

  const handleDelete = async (workshopId) => {
    if (!window.confirm('Are you sure you want to delete this workshop? All bookings will be cancelled.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.BACKEND_URL}/api/alumni-features/workshop/${workshopId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setWorkshops(prev => prev.filter(w => w._id !== workshopId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workshop');
    }
  };

  const handleManageBookings = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowBookingModal(true);
  };

  const handleBookingsUpdated = (workshopId, updatedBookings) => {
    setWorkshops(prev =>
      prev.map(w => w._id === workshopId ? { ...w, bookings: updatedBookings } : w)
    );
  };

  const getStats = () => {
    const total = workshops.length;
    const now = new Date();
    const upcoming = workshops.filter(w => {
      const scheduledDate = w.scheduledDate ? new Date(w.scheduledDate) : null;
      return w.isActive && scheduledDate && scheduledDate > now;
    }).length;
    const completed = workshops.filter(w => {
      const scheduledDate = w.scheduledDate ? new Date(w.scheduledDate) : null;
      return scheduledDate && scheduledDate <= now;
    }).length;
    const totalBookings = workshops.reduce((sum, w) => sum + (w.bookings?.length || 0), 0);

    return { total, upcoming, completed, totalBookings };
  };

  const stats = getStats();

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">My Workshops</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Workshop</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Total Workshops</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex space-x-2">
            {['all', 'upcoming', 'completed', 'cancelled'].map(status => (
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
        </div>
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
          <p className="text-gray-600 mb-4">
            {filterStatus === 'all'
              ? "You haven't created any workshops yet"
              : `No ${filterStatus} workshops`}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Workshop
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map(workshop => (
            <WorkshopCard
              key={workshop._id}
              workshop={workshop}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageBookings={handleManageBookings}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateWorkshopModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkshopCreated={handleWorkshopCreated}
      />

      {showEditModal && selectedWorkshop && (
        <EditWorkshopModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWorkshop(null);
          }}
          workshop={selectedWorkshop}
          onWorkshopUpdated={handleWorkshopUpdated}
        />
      )}

      {showBookingModal && selectedWorkshop && (
        <BookingManagement
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedWorkshop(null);
          }}
          workshop={selectedWorkshop}
          onBookingsUpdated={handleBookingsUpdated}
        />
      )}
    </div>
  );
};

export default MyWorkshops;
