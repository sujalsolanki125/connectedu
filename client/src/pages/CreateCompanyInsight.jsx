import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, Building2, DollarSign, Users, Briefcase, Star, Target } from 'lucide-react';

const CreateCompanyInsight = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    company: '',
    logo: '',
    industry: '',
    companySize: 'Medium',
    location: '',
    recruitmentPattern: '',
    rolesOffered: '',
    hiringProcess: {
      rounds: '',
      duration: '',
      description: '',
    },
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD',
    },
    workCulture: '',
    benefits: '',
    tips: '',
    expectations: {
      technical: '',
      behavioral: '',
      educational: '',
    },
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Process the data before sending
      const processedData = {
        company: formData.company,
        logo: formData.logo || '🏢',
        industry: formData.industry,
        recruitmentPattern: formData.recruitmentPattern,
        rolesOffered: formData.rolesOffered.split(',').map(role => role.trim()).filter(role => role),
        expectations: {
          technical: formData.expectations.technical.split(',').map(item => item.trim()).filter(item => item),
          behavioral: formData.expectations.behavioral.split(',').map(item => item.trim()).filter(item => item),
          educational: formData.expectations.educational,
        },
        hiringProcess: {
          rounds: parseInt(formData.hiringProcess.rounds) || 0,
          duration: formData.hiringProcess.duration,
          description: formData.hiringProcess.description,
        },
        salaryRange: {
          min: parseInt(formData.salaryRange.min) || 0,
          max: parseInt(formData.salaryRange.max) || 0,
          currency: formData.salaryRange.currency,
        },
        workCulture: formData.workCulture,
        benefits: formData.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit),
        tips: formData.tips,
      };

      const response = await axios.post(
        'http://localhost:5000/api/company-insights',
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      
      
      // Navigate back to company insights page
      navigate('/company-insights');
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to create company insight');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo || (userInfo.role !== 'alumni' && userInfo.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only alumni and admins can add company insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/company-insights')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Company Insights
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-primary-600" />
            Add Company Insight
          </h1>
          <p className="text-gray-600 mt-2">Share your knowledge to help fellow students and alumni</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-primary-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Google, Microsoft, Amazon"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Emoji (optional)
                </label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="🏢"
                  maxLength={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none text-2xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore, India"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Recruitment Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-primary-600" />
              Recruitment Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recruitment Pattern *
                </label>
                <textarea
                  name="recruitmentPattern"
                  value={formData.recruitmentPattern}
                  onChange={handleChange}
                  required
                  placeholder="Describe how the company recruits (e.g., on-campus, online, referrals)"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles Offered (comma-separated) *
                </label>
                <input
                  type="text"
                  name="rolesOffered"
                  value={formData.rolesOffered}
                  onChange={handleChange}
                  required
                  placeholder="Software Engineer, Data Scientist, Product Manager"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Separate roles with commas</p>
              </div>
            </div>
          </div>

          {/* Hiring Process */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-primary-600" />
              Hiring Process
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rounds
                </label>
                <input
                  type="number"
                  name="hiringProcess.rounds"
                  value={formData.hiringProcess.rounds}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="hiringProcess.duration"
                  value={formData.hiringProcess.duration}
                  onChange={handleChange}
                  placeholder="e.g., 2-3 weeks"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Process Description
                </label>
                <textarea
                  name="hiringProcess.description"
                  value={formData.hiringProcess.description}
                  onChange={handleChange}
                  placeholder="Describe the hiring process (e.g., Online Test → Technical Round → HR Round)"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Expectations */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-primary-600" />
              Expectations
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="expectations.technical"
                  value={formData.expectations.technical}
                  onChange={handleChange}
                  placeholder="Java, Python, React, AWS"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Behavioral Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="expectations.behavioral"
                  value={formData.expectations.behavioral}
                  onChange={handleChange}
                  placeholder="Communication, Leadership, Teamwork"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educational Requirements
                </label>
                <input
                  type="text"
                  name="expectations.educational"
                  value={formData.expectations.educational}
                  onChange={handleChange}
                  placeholder="Bachelor's in Computer Science or related field"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-primary-600" />
              Salary Range
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salaryRange.min"
                  value={formData.salaryRange.min}
                  onChange={handleChange}
                  placeholder="140000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salaryRange.max"
                  value={formData.salaryRange.max}
                  onChange={handleChange}
                  placeholder="230000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Culture & Benefits */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary-600" />
              Culture & Benefits
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Culture
                </label>
                <textarea
                  name="workCulture"
                  value={formData.workCulture}
                  onChange={handleChange}
                  placeholder="Describe the work culture, environment, and values"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits (comma-separated)
                </label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Health Insurance, Stock Options, Remote Work, Learning Budget"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              💡 Tips for Candidates
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advice & Tips
              </label>
              <textarea
                name="tips"
                value={formData.tips}
                onChange={handleChange}
                placeholder="Share advice for candidates applying to this company"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/company-insights')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Company Insight'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyInsight;
