import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Calendar, MapPin, Briefcase, TrendingUp, Eye, ThumbsUp, Award } from 'lucide-react';
import Footer from '../components/Footer';

const InterviewExperiencesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [markingHelpful, setMarkingHelpful] = useState(null); // Track which card is being marked

  // Fetch interview experiences from backend
  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async (companyName = '') => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      if (!userInfo || !userInfo.token) {
        // Error handled silently
        setLoading(false);
        return;
      }

      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Add search query parameter if provided
      const url = companyName 
        ? `http://localhost:5000/api/interviews?company=${encodeURIComponent(companyName)}`
        : 'http://localhost:5000/api/interviews';

      const response = await axios.get(url, config);
      setExperiences(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchExperiences(searchQuery);
  };

  const handleViewDetails = (experience) => {
    setSelectedExperience(experience);
    setShowModal(true);
  };

  const handleMarkHelpful = async (experienceId) => {
    if (!userInfo || !userInfo.token) {
      alert('Please login to mark as helpful');
      return;
    }

    // Prevent multiple clicks
    if (markingHelpful === experienceId) {
      return;
    }

    try {
      setMarkingHelpful(experienceId);
      
      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      

      // Optimistic update - update UI immediately
      setExperiences(prevExperiences => 
        prevExperiences.map(exp => 
          exp._id === experienceId 
            ? { ...exp, helpfulCount: (exp.helpfulCount || 0) + 1 }
            : exp
        )
      );

      // Send request to backend
      const response = await axios.put(
        `http://localhost:5000/api/interviews/${experienceId}/helpful`, 
        {}, 
        config
      );
      
      
      
      // Refresh to get accurate data from server
      setTimeout(() => {
        fetchExperiences(searchQuery);
        setMarkingHelpful(null);
      }, 500);
      
    } catch (error) {
      // Error handled silently
      alert('Error: ' + (error.response?.data?.message || 'Failed to mark as helpful. Please make sure the backend server is running.'));
      // Revert optimistic update on error
      fetchExperiences(searchQuery);
      setMarkingHelpful(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'selected':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'pending':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center">
                <span className="text-4xl mr-2">📘</span>
                Interview Experiences
              </h1>
              <p className="text-gray-600 text-sm">
                Learn from real interview experiences shared by alumni
              </p>
            </div>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-80 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search by company name..."
                className="flex-1 px-3 py-2 text-sm border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {!userInfo ? (
          /* Not Logged In */
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 text-lg mb-6">
              Please log in to view interview experiences shared by alumni.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Go to Login
            </a>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading interview experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Experiences Yet</h2>
            <p className="text-gray-600 text-lg">
              Alumni haven't shared any interview experiences yet. Check back soon!
            </p>
          </div>
        ) : (
          /* Experience Cards - Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map((exp, index) => {
              // Define gradient colors for cards
              const gradients = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500',
                'from-green-500 to-teal-500',
                'from-orange-500 to-red-500',
                'from-indigo-500 to-purple-500',
                'from-pink-500 to-rose-500',
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <div
                  key={exp._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
                >
                  {/* Colorful Header */}
                  <div className={`bg-gradient-to-r ${gradient} text-white p-3`}>
                    <h3 className="text-lg font-bold mb-1.5">{exp.company}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {exp.outcome?.charAt(0).toUpperCase() + exp.outcome?.slice(1)}
                      </span>
                      <span className="px-2 py-0.5 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-xs font-semibold">
                        {exp.difficulty?.charAt(0).toUpperCase() + exp.difficulty?.slice(1)} Level
                      </span>
                      <span className="px-2 py-0.5 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {exp.rounds} {exp.rounds === 1 ? 'Round' : 'Rounds'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col">
                    {/* Question Previews */}
                    <div className="space-y-2 mb-3 flex-1">
                      {/* Question 1 */}
                      {(exp.technicalQuestions?.[0] || exp.hrQuestions?.[0]) && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-3 border-blue-500 rounded-lg p-2.5">
                          <p className="text-xs font-bold text-blue-600 mb-1">Question 1 Preview:</p>
                          <p className="text-sm text-gray-800 line-clamp-2">
                            {exp.technicalQuestions?.[0]?.question || exp.hrQuestions?.[0]?.question}
                          </p>
                        </div>
                      )}
                      
                      {/* Question 2 */}
                      {(exp.technicalQuestions?.[1] || exp.hrQuestions?.[1] || 
                        (exp.technicalQuestions?.[0] && exp.hrQuestions?.[0])) && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-3 border-purple-500 rounded-lg p-2.5">
                          <p className="text-xs font-bold text-purple-600 mb-1">Question 2 Preview:</p>
                          <p className="text-sm text-gray-800 line-clamp-2">
                            {exp.technicalQuestions?.[1]?.question || 
                             (exp.technicalQuestions?.[0] && exp.hrQuestions?.[0]?.question) ||
                             exp.hrQuestions?.[1]?.question}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                      <button
                        onClick={() => handleMarkHelpful(exp._id)}
                        disabled={markingHelpful === exp._id}
                        className={`px-2.5 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg ${
                          markingHelpful === exp._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {markingHelpful === exp._id ? (
                          <>
                            <span className="animate-spin mr-1">⏳</span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                            Helpful ({exp.helpfulCount || 0})
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleViewDetails(exp)}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Alumni Info */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Shared by:</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 shadow-md`}>
                            {exp.alumni?.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{exp.alumni?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">Posted on {formatDate(exp.createdAt)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => window.location.href = `/alumni-profile/${exp.alumni?._id}`}
                          className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors duration-200 whitespace-nowrap"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white px-6 py-5 rounded-t-3xl z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold mb-2">{selectedExperience.company}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOutcomeColor(selectedExperience.outcome)}`}>
                      {selectedExperience.outcome?.charAt(0).toUpperCase() + selectedExperience.outcome?.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-bold">
                      {selectedExperience.difficulty?.charAt(0).toUpperCase() + selectedExperience.difficulty?.slice(1)} Level
                    </span>
                    <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-xs font-bold flex items-center">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {selectedExperience.rounds} {selectedExperience.rounds === 1 ? 'Round' : 'Rounds'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200 ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {/* Interview Questions */}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Interview Questions:</h3>
                
                {/* Technical Questions */}
                {selectedExperience.technicalQuestions && selectedExperience.technicalQuestions.length > 0 && (
                  <div className="space-y-3">
                    {selectedExperience.technicalQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-blue-700 flex-1">
                            Q{idx + 1}: {q.question}
                          </p>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
                            Technical
                          </span>
                        </div>
                        
                        {q.myAnswer && (
                          <div className="mb-2">
                            <p className="text-xs font-bold text-gray-600 mb-1">My Answer:</p>
                            <p className="text-gray-800 text-sm bg-blue-50 p-2.5 rounded border border-blue-200">
                              {q.myAnswer}
                            </p>
                          </div>
                        )}
                        
                        {q.expectedAnswer && (
                          <div>
                            <p className="text-xs font-bold text-gray-600 mb-1">Expected:</p>
                            <p className="text-gray-800 text-sm bg-green-50 p-2.5 rounded border border-green-200">
                              {q.expectedAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* HR Questions */}
                {selectedExperience.hrQuestions && selectedExperience.hrQuestions.length > 0 && (
                  <div className="space-y-3 mt-3">
                    {selectedExperience.hrQuestions.map((q, idx) => (
                      <div key={idx} className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-blue-700 flex-1">
                            Q{idx + selectedExperience.technicalQuestions.length + 1}: {q.question}
                          </p>
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold whitespace-nowrap">
                            HR
                          </span>
                        </div>
                        
                        {q.myAnswer && (
                          <div className="mb-2">
                            <p className="text-xs font-bold text-gray-600 mb-1">My Answer:</p>
                            <p className="text-gray-800 text-sm bg-blue-50 p-2.5 rounded border border-blue-200">
                              {q.myAnswer}
                            </p>
                          </div>
                        )}
                        
                        {q.expectedAnswer && (
                          <div>
                            <p className="text-xs font-bold text-gray-600 mb-1">Expected:</p>
                            <p className="text-gray-800 text-sm bg-green-50 p-2.5 rounded border border-green-200">
                              {q.expectedAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Company Expectations */}
              {selectedExperience.companyExpectations && (
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Company Expectations:</h3>
                  <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">{selectedExperience.companyExpectations}</p>
                  </div>
                </div>
              )}

              {/* Tips */}
              {selectedExperience.tips && (
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Preparation Tips
                  </h3>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">{selectedExperience.tips}</p>
                  </div>
                </div>
              )}

              {/* Alumni Info */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-300 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Shared By:</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-base mr-3">
                    {selectedExperience.alumni?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-base text-gray-900">{selectedExperience.alumni?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">Posted on {formatDate(selectedExperience.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default InterviewExperiencesPage;
