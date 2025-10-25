import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CompleteStudentProfile = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    
    // College / Academic Details
    collegeName: '',
    universityName: '',
    branch: '',
    currentYear: '',
    graduationYear: '',
    enrollmentNumber: '',
    cgpa: '',
    backlogs: '',
    
    // Skills and Interests
    technicalSkills: [],
    softSkills: [],
    careerInterests: [],
    preferredCompanies: [],
    
    // Placement Preparation Details
    resumeLink: '',
    interestedJobRole: '',
    interviewExperienceLevel: '',
    interviewPreparationStatus: '',
    
    // Contact & Social Links
    linkedinProfile: '',
    githubProfile: '',
    portfolioLink: '',
    contactPreference: 'Email',
    
    // Additional
    bio: '',
  });

  // Input fields for skills (comma-separated)
  const [skillsInput, setSkillsInput] = useState({
    technicalSkills: '',
    softSkills: '',
    careerInterests: '',
    preferredCompanies: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!userInfo) {
      navigate('/login');
      return;
    }

    // Check if user is a student
    if (userInfo.role !== 'student') {
      navigate(`/${userInfo.role}-dashboard`);
      return;
    }

    // Fetch existing profile data
    fetchProfile();
  }, [userInfo, navigate]);

  const fetchProfile = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || '${process.env.BACKEND_URL}'}/api/profile/student`,
        config
      );

      if (data.profile) {
        setFormData({
          ...formData,
          ...data.profile,
        });

        // Set skills input fields
        setSkillsInput({
          technicalSkills: data.profile.technicalSkills?.join(', ') || '',
          softSkills: data.profile.softSkills?.join(', ') || '',
          careerInterests: data.profile.careerInterests?.join(', ') || '',
          preferredCompanies: data.profile.preferredCompanies?.join(', ') || '',
        });
      }
    } catch (err) {
      // Error handled silently
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSkillsChange = (e) => {
    const { name, value } = e.target;
    setSkillsInput({
      ...skillsInput,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Convert comma-separated skills to arrays
      const profileData = {
        ...formData,
        technicalSkills: skillsInput.technicalSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill !== ''),
        softSkills: skillsInput.softSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill !== ''),
        careerInterests: skillsInput.careerInterests
          .split(',')
          .map(interest => interest.trim())
          .filter(interest => interest !== ''),
        preferredCompanies: skillsInput.preferredCompanies
          .split(',')
          .map(company => company.trim())
          .filter(company => company !== ''),
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL || '${process.env.BACKEND_URL}'}/api/profile/student`,
        profileData,
        config
      );

      setSuccess('Profile updated successfully!');
      setLoading(false);

      // Redirect to student dashboard after 2 seconds
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('First Name and Last Name are required fields');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.collegeName || !formData.branch || !formData.currentYear || 
          !formData.graduationYear || !formData.cgpa || formData.backlogs === '') {
        setError('College Name, Branch, Current Year, Graduation Year, CGPA, and Backlogs are required fields');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!skillsInput.technicalSkills || !skillsInput.careerInterests) {
        setError('Technical Skills and Career Interests are required fields');
        return false;
      }
    }
    
    if (currentStep === 4) {
      if (!formData.linkedinProfile && !formData.resumeLink) {
        setError('Either LinkedIn Profile or Resume Link is required');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Student Profile
            </h1>
            <p className="text-gray-600 mb-3">
              Help us match you with the best alumni mentors and opportunities
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">📋 Important:</span> All fields marked with <span className="text-red-500">*</span> are required. 
                This information helps us understand your interests and connect you with the right mentors.
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
              <span className="ml-4 text-sm text-gray-600">Step {step} of 4</span>
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  1. Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Auto-filled)
                    </label>
                    <input
                      type="email"
                      value={userInfo?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: College / Academic Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  2. College / Academic Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., IIT Delhi, NIT Trichy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University Name
                    </label>
                    <input
                      type="text"
                      name="universityName"
                      value={formData.universityName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Delhi University"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Computer Science, IT, Mechanical"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currentYear"
                      value={formData.currentYear}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      required
                      min="2020"
                      max="2030"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your enrollment/roll number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CGPA <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 8.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backlogs <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="backlogs"
                      value={formData.backlogs}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Number of backlogs (0 if none)"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Skills and Career Interests */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  3. Skills and Career Interests
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technical Skills <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="technicalSkills"
                      value={skillsInput.technicalSkills}
                      onChange={handleSkillsChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Java, Python, HTML, DSA (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter skills separated by commas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soft Skills
                    </label>
                    <input
                      type="text"
                      name="softSkills"
                      value={skillsInput.softSkills}
                      onChange={handleSkillsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Communication, Leadership, Teamwork (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Career Interests (or Job Role) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="careerInterests"
                      value={skillsInput.careerInterests}
                      onChange={handleSkillsChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Software Development, Data Science, AI/ML (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Companies
                    </label>
                    <input
                      type="text"
                      name="preferredCompanies"
                      value={skillsInput.preferredCompanies}
                      onChange={handleSkillsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Google, Microsoft, TCS, Infosys (comma-separated)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interested Job Role
                    </label>
                    <input
                      type="text"
                      name="interestedJobRole"
                      value={formData.interestedJobRole}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Frontend Developer, Data Analyst"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Experience Level
                      </label>
                      <select
                        name="interviewExperienceLevel"
                        value={formData.interviewExperienceLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Preparation Status
                      </label>
                      <select
                        name="interviewPreparationStatus"
                        value={formData.interviewPreparationStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Status</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Ready">Ready</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Contact & Social Links */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  4. Contact & Social Links
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="linkedinProfile"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      LinkedIn profile is required for networking and mentorship
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      name="githubProfile"
                      value={formData.githubProfile}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Link
                    </label>
                    <input
                      type="url"
                      name="portfolioLink"
                      value={formData.portfolioLink}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="resumeLink"
                      value={formData.resumeLink}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Resume link is required for mentors to understand your background
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Preference
                    </label>
                    <select
                      name="contactPreference"
                      value={formData.contactPreference}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Phone">Phone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio (Optional)
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself, your goals, and what you're looking for..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Complete Profile ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteStudentProfile;
