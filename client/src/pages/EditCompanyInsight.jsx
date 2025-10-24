import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Building2, DollarSign, Users, Briefcase, Target, Award, Lightbulb } from 'lucide-react';

const EditCompanyInsight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    company: '',
    logo: '',
    industry: '',
    recruitmentPattern: '',
    rolesOffered: '',
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD',
    },
    workCulture: '',
    benefits: '',
    tips: '',
    hiringProcess: {
      rounds: '',
      duration: '',
      description: '',
    },
    expectations: {
      technical: '',
      behavioral: '',
      educational: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'E-commerce',
    'Education',
    'Entertainment',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Other',
  ];

  useEffect(() => {
    const fetchInsightData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/company-insights/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const insight = response.data;

        // Check if user is authorized to edit
        if (insight.creator._id !== userInfo._id && userInfo.role !== 'admin') {
          setError('You are not authorized to edit this company insight');
          setTimeout(() => navigate('/company-insights'), 2000);
          return;
        }

      // Populate form with existing data
      setFormData({
        company: insight.company || '',
        logo: insight.logo || '',
        industry: insight.industry || '',
        recruitmentPattern: insight.recruitmentPattern || '',
        rolesOffered: Array.isArray(insight.rolesOffered) ? insight.rolesOffered.join(', ') : '',
        salaryRange: {
          min: insight.salaryRange?.min || '',
          max: insight.salaryRange?.max || '',
          currency: insight.salaryRange?.currency || 'USD',
        },
        workCulture: insight.workCulture || '',
        benefits: Array.isArray(insight.benefits) ? insight.benefits.join(', ') : '',
        tips: insight.tips || '',
        hiringProcess: {
          rounds: insight.hiringProcess?.rounds || '',
          duration: insight.hiringProcess?.duration || '',
          description: insight.hiringProcess?.description || '',
        },
        expectations: {
          technical: Array.isArray(insight.expectations?.technical) 
            ? insight.expectations.technical.join(', ') 
            : '',
          behavioral: Array.isArray(insight.expectations?.behavioral)
            ? insight.expectations.behavioral.join(', ')
            : '',
          educational: insight.expectations?.educational || '',
        },
      });

      setLoading(false);
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to fetch company insight');
      setLoading(false);
      setTimeout(() => navigate('/company-insights'), 2000);
    }
    };
    
    fetchInsightData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Process data before sending
      const dataToSend = {
        ...formData,
        rolesOffered: formData.rolesOffered.split(',').map(role => role.trim()).filter(Boolean),
        benefits: formData.benefits.split(',').map(benefit => benefit.trim()).filter(Boolean),
        salaryRange: {
          min: parseInt(formData.salaryRange.min),
          max: parseInt(formData.salaryRange.max),
          currency: formData.salaryRange.currency,
        },
        hiringProcess: {
          rounds: parseInt(formData.hiringProcess.rounds),
          duration: formData.hiringProcess.duration,
          description: formData.hiringProcess.description,
        },
        expectations: {
          technical: formData.expectations.technical.split(',').map(skill => skill.trim()).filter(Boolean),
          behavioral: formData.expectations.behavioral.split(',').map(skill => skill.trim()).filter(Boolean),
          educational: formData.expectations.educational,
        },
        logo: formData.logo || '🏢',
      };

      await axios.put(
        `http://localhost:5000/api/company-insights/${id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      navigate('/company-insights');
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to update company insight');
      setSubmitting(false);
    }
  };

  if (!userInfo || (userInfo.role !== 'alumni' && userInfo.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only alumni and admins can edit company insights.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading company insight...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <h1 className="text-4xl font-extrabold mb-2">✏️ Edit Company Insight</h1>
          <p className="text-purple-100 text-lg">Update the company information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-primary-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="e.g., Google, Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo (Emoji)
                </label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="🏢"
                  maxLength="2"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry *
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recruitment & Roles */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary-600" />
              Recruitment & Roles
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recruitment Pattern *
                </label>
                <textarea
                  name="recruitmentPattern"
                  value={formData.recruitmentPattern}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 resize-none"
                  placeholder="e.g., On-campus recruitment, Off-campus applications"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Roles Offered * (comma-separated)
                </label>
                <input
                  type="text"
                  name="rolesOffered"
                  value={formData.rolesOffered}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="Software Engineer, Data Analyst, Product Manager"
                />
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-primary-600" />
              Salary Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Salary (Annual) *
                </label>
                <input
                  type="number"
                  name="salaryRange.min"
                  value={formData.salaryRange.min}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="400000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Salary (Annual) *
                </label>
                <input
                  type="number"
                  name="salaryRange.max"
                  value={formData.salaryRange.max}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="1200000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Culture & Benefits */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-primary-600" />
              Work Culture & Benefits
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Culture *
                </label>
                <textarea
                  name="workCulture"
                  value={formData.workCulture}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 resize-none"
                  placeholder="Describe the work environment, culture, and atmosphere"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="Health Insurance, Remote Work, Free Meals"
                />
              </div>
            </div>
          </div>

          {/* Hiring Process */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-primary-600" />
              Hiring Process
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Rounds *
                  </label>
                  <input
                    type="number"
                    name="hiringProcess.rounds"
                    value={formData.hiringProcess.rounds}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="hiringProcess.duration"
                    value={formData.hiringProcess.duration}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                    placeholder="2-3 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Process Description *
                </label>
                <textarea
                  name="hiringProcess.description"
                  value={formData.hiringProcess.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 resize-none"
                  placeholder="Describe each round: Online test, Technical interviews, HR round"
                />
              </div>
            </div>
          </div>

          {/* Expectations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-2 text-primary-600" />
              Candidate Expectations
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Technical Skills * (comma-separated)
                </label>
                <input
                  type="text"
                  name="expectations.technical"
                  value={formData.expectations.technical}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="Python, React, SQL, AWS"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Behavioral Skills * (comma-separated)
                </label>
                <input
                  type="text"
                  name="expectations.behavioral"
                  value={formData.expectations.behavioral}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="Communication, Teamwork, Problem Solving"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Educational Requirements *
                </label>
                <input
                  type="text"
                  name="expectations.educational"
                  value={formData.expectations.educational}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200"
                  placeholder="Bachelor's in Computer Science or related field"
                />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-primary-600" />
              Tips for Candidates
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interview Tips
              </label>
              <textarea
                name="tips"
                value={formData.tips}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors duration-200 resize-none"
                placeholder="Share helpful tips for candidates applying to this company"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/company-insights')}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-4 rounded-xl font-bold transition-all duration-200 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {submitting ? 'Updating...' : 'Update Company Insight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyInsight;
