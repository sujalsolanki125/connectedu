import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Edit2, Trash2, MessageCircle } from 'lucide-react';
import Footer from '../components/Footer';

const CompanyInsightsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCompanySize, setSelectedCompanySize] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch company insights from API
  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get('${process.env.BACKEND_URL}/api/company-insights', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      setInsights(response.data);
      setFilteredInsights(response.data);
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to fetch company insights');
      setInsights([]);
      setFilteredInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedIndustry, selectedCompanySize, sortBy, insights]);

  const filterAndSortInsights = () => {
    let filtered = [...insights];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (insight) =>
          insight.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (insight.workCulture && insight.workCulture.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (insight.rolesOffered && insight.rolesOffered.some((role) => role.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter((insight) => insight.industry === selectedIndustry);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'reviews':
          return (b.totalRatings || 0) - (a.totalRatings || 0);
        case 'salary':
          return (b.salaryRange?.max || 0) - (a.salaryRange?.max || 0);
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredInsights(filtered);
  };

  const industries = ['all', ...new Set(insights.map((i) => i.industry).filter(Boolean))];
  const companySizes = ['all', 'Small', 'Medium', 'Large'];

  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return 'Not specified';
    const symbol = salary.currency === 'INR' ? '₹' : salary.currency === 'EUR' ? '€' : salary.currency === 'GBP' ? '£' : '$';
    return `${symbol}${(salary.min / 1000).toFixed(0)}K - ${symbol}${(salary.max / 1000).toFixed(0)}K`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const openModal = (insight) => {
    setSelectedInsight(insight);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInsight(null);
  };

  const openRatingModal = (insight) => {
    setSelectedInsight(insight);
    const userRating = insight.ratings?.find(r => r.user === userInfo._id);
    if (userRating) {
      setRating(userRating.rating);
      setRatingComment(userRating.comment || '');
    } else {
      setRating(0);
      setRatingComment('');
    }
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedInsight(null);
    setRating(0);
    setHoverRating(0);
    setRatingComment('');
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/company-insights/${selectedInsight._id}/rate`,
        { rating, comment: ratingComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage('Rating submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update the insights list
      setInsights(insights.map(ins => 
        ins._id === selectedInsight._id ? response.data : ins
      ));
      setFilteredInsights(filteredInsights.map(ins => 
        ins._id === selectedInsight._id ? response.data : ins
      ));
      
      closeRatingModal();
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to submit rating');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (insightId) => {
    navigate(`/company-insights/edit/${insightId}`);
  };

  const handleDelete = async (insightId) => {
    if (!window.confirm('Are you sure you want to delete this company insight?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.BACKEND_URL}/api/company-insights/${insightId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage('Company insight deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Remove from insights list
      setInsights(insights.filter(ins => ins._id !== insightId));
      setFilteredInsights(filteredInsights.filter(ins => ins._id !== insightId));
      
      if (showModal) {
        closeModal();
      }
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to delete company insight');
      setTimeout(() => setError(''), 3000);
    }
  };

  const canEditOrDelete = (insight) => {
    return userInfo && (
      insight.creator?._id === userInfo._id || 
      userInfo.role === 'admin'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold mb-2 animate-fade-in">
                🏢 Company Insights
              </h1>
              <p className="text-purple-100 text-lg animate-fade-in">
                Discover detailed information about companies, salaries, culture, and more
              </p>
            </div>
            {(userInfo?.role === 'alumni' || userInfo?.role === 'admin') && (
              <Link
                to="/company-insights/create"
                className="mt-4 md:mt-0 px-6 py-3 bg-white text-primary-600 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Company Insight
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in">
            <p className="font-medium">Success</p>
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search companies, roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size Filter */}
            <div>
              <select
                value={selectedCompanySize}
                onChange={(e) => setSelectedCompanySize(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
              >
                {companySizes.map((size) => (
                  <option key={size} value={size}>
                    {size === 'all' ? 'All Sizes' : size}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <p>
              Showing <span className="font-bold text-primary-600">{filteredInsights.length}</span> of{' '}
              <span className="font-bold">{insights.length}</span> companies
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary-600 hover:text-primary-700 font-medium text-xs"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading company insights...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustry('all');
                setSelectedCompanySize('all');
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors duration-200"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Company Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInsights.map((insight, index) => (
              <div
                key={insight._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => openModal(insight)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                      {insight.logo || '🏢'}
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white truncate">{insight.company}</h3>
                      <p className="text-purple-100 text-xs truncate">{insight.industry}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`text-xl font-bold ${getRatingColor(insight.averageRating || 0)}`}>
                        {insight.averageRating ? insight.averageRating.toFixed(1) : 'N/A'}
                      </div>
                      <div className="ml-1.5 flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(insight.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">({insight.totalRatings || 0})</span>
                  </div>

                  {/* Work Culture */}
                  {insight.workCulture && (
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">{insight.workCulture}</p>
                  )}

                  {/* Salary Range */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium">Salary Range</span>
                      <span className="text-xs font-bold text-green-700">{formatSalary(insight.salaryRange)}</span>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-1.5">Popular Roles:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.rolesOffered && insight.rolesOffered.length > 0 ? (
                        insight.rolesOffered.slice(0, 3).map((role, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded font-medium"
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No roles specified</span>
                      )}
                    </div>
                  </div>

                  {/* Hiring Process */}
                  {insight.hiringProcess && insight.hiringProcess.rounds && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">Rounds</p>
                        <p className="text-xs font-bold text-blue-600">{insight.hiringProcess.rounds}</p>
                      </div>
                      <div className="text-center p-1.5 bg-purple-50 rounded-lg">
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-xs font-bold text-purple-600">{insight.hiringProcess.duration || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 mb-2">
                    {/* Rate Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openRatingModal(insight);
                      }}
                      className="flex-1 py-1.5 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg text-xs font-semibold hover:bg-yellow-100 transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Rate
                    </button>

                    {/* Edit Button */}
                    {canEditOrDelete(insight) && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(insight._id);
                          }}
                          className="py-1.5 px-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        {/* Delete Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(insight._id);
                          }}
                          className="py-1.5 px-2 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button className="w-full py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center group">
                    View Full Details
                    <svg
                      className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {showModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeModal}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-5xl shadow-lg">
                    {selectedInsight.logo || '🏢'}
                  </div>
                  <div className="ml-6">
                    <h2 className="text-3xl font-extrabold">{selectedInsight.company}</h2>
                    <p className="text-purple-100 mt-1">{selectedInsight.industry}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-2xl font-bold">{selectedInsight.averageRating ? selectedInsight.averageRating.toFixed(1) : 'N/A'}</span>
                        <div className="ml-2 flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(selectedInsight.averageRating || 0) ? 'text-yellow-300' : 'text-white text-opacity-30'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm">({selectedInsight.totalRatings || 0})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Work Culture */}
              {selectedInsight.workCulture && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🏢</span>
                    Work Culture
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedInsight.workCulture}</p>
                </div>
              )}

              {/* Salary Range */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">💰</span>
                    <h4 className="text-lg font-bold text-gray-900">Salary Range</h4>
                  </div>
                  <p className="text-3xl font-extrabold text-green-600">{formatSalary(selectedInsight.salaryRange)}</p>
                  <p className="text-sm text-gray-600 mt-1">Annual ({selectedInsight.salaryRange?.currency || 'USD'})</p>
                </div>
              </div>

              {/* Recruitment Pattern */}
              {selectedInsight.recruitmentPattern && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📢</span>
                    Recruitment Pattern
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedInsight.recruitmentPattern}</p>
                </div>
              )}

              {/* Hiring Process */}
              {selectedInsight.hiringProcess && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Hiring Process
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Number of Rounds</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedInsight.hiringProcess.rounds || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="text-2xl font-bold text-purple-600">{selectedInsight.hiringProcess.duration || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedInsight.hiringProcess.description && (
                    <p className="text-gray-700 leading-relaxed">{selectedInsight.hiringProcess.description}</p>
                  )}
                </div>
              )}

              {/* Roles Offered */}
              {selectedInsight.rolesOffered && selectedInsight.rolesOffered.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">💼</span>
                    Roles Offered
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedInsight.rolesOffered.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-primary-100 to-purple-100 border border-primary-300 text-primary-700 rounded-full font-semibold"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expectations */}
              {selectedInsight.expectations && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">⭐</span>
                    Expectations
                  </h3>
                  {selectedInsight.expectations.technical && selectedInsight.expectations.technical.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedInsight.expectations.technical.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedInsight.expectations.behavioral && selectedInsight.expectations.behavioral.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Behavioral Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedInsight.expectations.behavioral.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedInsight.expectations.educational && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Educational Requirements</h4>
                      <p className="text-gray-700">{selectedInsight.expectations.educational}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Benefits */}
              {selectedInsight.benefits && selectedInsight.benefits.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🎁</span>
                    Benefits
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedInsight.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {selectedInsight.tips && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Tips for Candidates
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">{selectedInsight.tips}</p>
                </div>
              )}

              {/* Added By */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Added on {new Date(selectedInsight.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    closeModal();
                    openRatingModal(selectedInsight);
                  }}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Rate this Company
                </button>

                {canEditOrDelete(selectedInsight) && (
                  <>
                    <button 
                      onClick={() => handleEdit(selectedInsight._id)}
                      className="py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Edit2 className="w-5 h-5" />
                      Edit
                    </button>

                    <button 
                      onClick={() => handleDelete(selectedInsight._id)}
                      className="py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeRatingModal}>
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Rating Modal Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold">Rate Company</h2>
                  <p className="text-yellow-100 mt-1">{selectedInsight.company}</p>
                </div>
                <button
                  onClick={closeRatingModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Rating Modal Body */}
            <div className="p-8">
              {/* Star Rating */}
              <div className="text-center mb-6">
                <p className="text-gray-700 font-semibold mb-4">How would you rate this company?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform duration-200 hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-3 text-lg font-bold text-yellow-600">
                    {rating === 1 && '⭐ Poor'}
                    {rating === 2 && '⭐⭐ Fair'}
                    {rating === 3 && '⭐⭐⭐ Good'}
                    {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                    {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Your Review (Optional)
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your experience with this company..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-colors duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleRatingSubmit}
                disabled={rating === 0}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-200 ${
                  rating === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg transform hover:scale-105'
                }`}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CompanyInsightsPage;
