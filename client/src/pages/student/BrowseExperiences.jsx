import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterBar from '../../components/FilterBar';
import { ThumbsUp, Building, Briefcase, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const BrowseExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    difficulty: '',
    result: ''
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [experiences, filters]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/alumni-features/interview-experiences',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setExperiences(response.data.experiences || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch experiences');
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...experiences];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(exp =>
        exp.companyName.toLowerCase().includes(searchLower) ||
        exp.role.toLowerCase().includes(searchLower) ||
        exp.questions.some(q => q.question.toLowerCase().includes(searchLower))
      );
    }

    // Company filter
    if (filters.company) {
      filtered = filtered.filter(exp => exp.companyName === filters.company);
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(exp => exp.difficulty === filters.difficulty);
    }

    // Result filter
    if (filters.result) {
      filtered = filtered.filter(exp => exp.result === filters.result);
    }

    // Sort by helpful votes
    filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);

    setFilteredExperiences(filtered);
  };

  const handleMarkHelpful = async (experienceId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/alumni-features/interview-experience/${experienceId}/helpful`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local state
      setExperiences(prev =>
        prev.map(exp =>
          exp._id === experienceId
            ? { ...exp, helpfulCount: exp.helpfulCount + 1 }
            : exp
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as helpful');
    }
  };

  const getUniqueCompanies = () => {
    const companies = [...new Set(experiences.map(exp => exp.companyName))];
    return companies.sort();
  };

  const getDifficultyBadgeColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getResultBadgeColor = (result) => {
    const colors = {
      Selected: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Pending: 'bg-blue-100 text-blue-800'
    };
    return colors[result] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const filterOptions = [
    {
      label: 'Company',
      value: filters.company,
      onChange: (value) => setFilters(prev => ({ ...prev, company: value })),
      options: ['All Companies', ...getUniqueCompanies()]
    },
    {
      label: 'Difficulty',
      value: filters.difficulty,
      onChange: (value) => setFilters(prev => ({ ...prev, difficulty: value })),
      options: ['All Difficulties', 'Easy', 'Medium', 'Hard']
    },
    {
      label: 'Result',
      value: filters.result,
      onChange: (value) => setFilters(prev => ({ ...prev, result: value })),
      options: ['All Results', 'Selected', 'Rejected', 'Pending']
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Interview Experiences</h1>
        <p className="text-gray-600">
          Learn from alumni who have successfully interviewed at top companies
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
        filterOptions={filterOptions}
        activeFilters={filters}
        onReset={() => setFilters({ search: '', company: '', difficulty: '', result: '' })}
      />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredExperiences.length} of {experiences.length} experiences
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Experiences List */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No interview experiences found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExperiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">{exp.companyName}</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{exp.role}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyBadgeColor(exp.difficulty)}`}>
                      {exp.difficulty}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultBadgeColor(exp.result)}`}>
                      {exp.result}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(exp.interviewDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Rounds:</span> {exp.rounds}
                  </div>
                  <div>
                    <span className="font-medium">Questions:</span> {exp.questions.length}
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Questions Preview:</h4>
                  <div className="space-y-2">
                    {exp.questions.slice(0, expandedId === exp._id ? undefined : 2).map((q, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-800">{q.question}</p>
                          {q.round && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                              {q.round}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{q.answer}</p>
                        <div className="flex flex-wrap gap-1">
                          {q.types.map((type, i) => (
                            <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expand/Collapse Button */}
                  {exp.questions.length > 2 && (
                    <button
                      onClick={() => setExpandedId(expandedId === exp._id ? null : exp._id)}
                      className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {expandedId === exp._id ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Show All {exp.questions.length} Questions</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleMarkHelpful(exp._id)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">Helpful ({exp.helpfulCount})</span>
                  </button>
                  <span className="text-xs text-gray-500">
                    Shared by Alumni ID: {exp.alumniId}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseExperiences;
