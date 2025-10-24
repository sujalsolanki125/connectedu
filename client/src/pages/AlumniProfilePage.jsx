import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, Trash2 } from "lucide-react";

const AlumniProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  
  // Profile picture upload states
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/profile/alumni`,
        config
      );

      setProfileData(data);
      setLoading(false);
    } catch (err) {
      // Error handled silently
      setError("Failed to load profile data");
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    if (!profileData?.profile) return 0;
    
    const fields = [
      profileData.profile.firstName,
      profileData.profile.lastName,
      profileData.profile.phoneNumber,
      profileData.profile.currentCompany,
      profileData.profile.currentPosition,
      profileData.profile.collegeName,
      profileData.profile.branch,
      profileData.profile.graduationYear,
      profileData.profile.technicalSkills?.length > 0,
      profileData.profile.linkedinProfile,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Handle profile picture file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Only PNG and JPG images are allowed!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError('File size must be less than 3MB!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    await uploadProfilePicture(file);
  };

  // Upload profile picture to Cloudinary
  const uploadProfilePicture = async (file) => {
    try {
      setUploadingPicture(true);
      setError('');

      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/profile/upload-avatar`,
        formData,
        config
      );

      // Update profile data with new avatar
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: data.avatar
        }
      }));

      setError('Profile picture updated successfully! ✅');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to upload profile picture');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploadingPicture(false);
    }
  };

  // Delete profile picture
  const deleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      setDeletingPicture(true);
      setError('');

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/profile/avatar`,
        config
      );

      // Update profile data - remove avatar
      setProfileData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: null
        }
      }));

      setError('Profile picture deleted successfully! ✅');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to delete profile picture');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeletingPicture(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button 
            onClick={fetchProfileData}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile || {};
  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-12">
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">👨‍💼 My Alumni Profile</h1>
          <p className="text-xl text-white/90">Share your experience and mentor students</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Success/Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl ${error.includes('✅') ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <p className={`font-semibold ${error.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>
              {error}
            </p>
          </div>
        )}
        {completionPercentage < 100 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl mb-8 shadow-lg">
            <div className="flex items-start">
              <span className="text-4xl mr-4">⚠️</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  Complete Your Profile ({completionPercentage}%)
                </h3>
                <p className="text-yellow-700 mb-3">
                  A complete profile helps students find you for mentorship.
                </p>
                <div className="w-full bg-yellow-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-6 gap-4">
          <button
            onClick={() => navigate("/complete-alumni-profile")}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span>✏️</span>
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              {/* Profile Picture Upload Section */}
              <div className="relative inline-block mb-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Alumni Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 shadow-lg mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-primary-100 shadow-lg mx-auto">
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
                      : profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '👨‍💼'}
                  </div>
                )}

                {/* Upload/Delete Buttons - Small, clean design */}
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <label
                    className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white rounded-full p-1.5 shadow-md transition-all hover:scale-110 flex items-center justify-center"
                    title="Upload profile picture"
                  >
                    {uploadingPicture ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingPicture}
                    />
                  </label>

                  {profile.avatar && (
                    <button
                      onClick={deleteProfilePicture}
                      disabled={deletingPicture}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-all hover:scale-110 flex items-center justify-center disabled:opacity-50"
                      title="Delete profile picture"
                    >
                      {deletingPicture ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}` 
                  : profileData.name || "Alumni Name"}
              </h2>
              <p className="text-gray-600 mb-2">{profileData.email}</p>
              
              {profile.currentPosition && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">{profile.currentPosition}</p>
                  {profile.currentCompany && (
                    <p className="text-sm text-green-700">@ {profile.currentCompany}</p>
                  )}
                </div>
              )}

              {profile.totalExperience && (
                <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                  {profile.totalExperience} Experience
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📞</span>
                Contact Information
              </h3>
              <div className="space-y-3">
                {profile.phoneNumber ? (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Phone</label>
                    <p className="text-gray-900 font-medium">{profile.phoneNumber}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No phone number added</p>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <p className="text-gray-900 font-medium">{profileData.email}</p>
                </div>
                {profile.workLocation && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Location</label>
                    <p className="text-gray-900 font-medium">{profile.workLocation}</p>
                  </div>
                )}
              </div>
            </div>

            {(profile.linkedinProfile || profile.githubProfile || profile.portfolioLink) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔗</span>
                  Social Links
                </h3>
                <div className="space-y-3">
                  {profile.linkedinProfile && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">LinkedIn</label>
                      <a 
                        href={profile.linkedinProfile.startsWith("http") ? profile.linkedinProfile : `https://${profile.linkedinProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-700 font-medium mt-1 truncate"
                      >
                        {profile.linkedinProfile}
                      </a>
                    </div>
                  )}
                  {profile.githubProfile && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">GitHub</label>
                      <a 
                        href={profile.githubProfile.startsWith("http") ? profile.githubProfile : `https://${profile.githubProfile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-700 font-medium mt-1 truncate"
                      >
                        {profile.githubProfile}
                      </a>
                    </div>
                  )}
                  {profile.portfolioLink && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Portfolio</label>
                      <a 
                        href={profile.portfolioLink.startsWith("http") ? profile.portfolioLink : `https://${profile.portfolioLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-700 font-medium mt-1 truncate"
                      >
                        {profile.portfolioLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {profile.bio && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📝</span>
                  About Me
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">💼</span>
                Professional Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.currentCompany && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Current Company</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.currentCompany}</p>
                  </div>
                )}
                {profile.currentPosition && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Position</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.currentPosition}</p>
                  </div>
                )}
                {profile.totalExperience && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Experience</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.totalExperience}</p>
                  </div>
                )}
                {profile.industryDomain && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Industry</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.industryDomain}</p>
                  </div>
                )}
              </div>
              {profile.previousCompanies && profile.previousCompanies.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-600">Previous Companies</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.previousCompanies.map((company, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!profile.currentCompany && !profile.currentPosition && (
                <p className="text-gray-500 italic">No professional experience added yet</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎓</span>
                Educational Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.collegeName && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">College</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.collegeName}</p>
                  </div>
                )}
                {profile.branch && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Branch</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.branch}</p>
                  </div>
                )}
                {profile.graduationYear && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Graduation</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.graduationYear}</p>
                  </div>
                )}
                {profile.degree && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Degree</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.degree}</p>
                  </div>
                )}
              </div>
              {!profile.collegeName && !profile.branch && (
                <p className="text-gray-500 italic">No educational background added yet</p>
              )}
            </div>

            {profile.technicalSkills && profile.technicalSkills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💻</span>
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.technicalSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.softSkills && profile.softSkills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🤝</span>
                  Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.softSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {completionPercentage < 30 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-gray-600 mb-6">
                  Add your experience and skills to help students connect with you.
                </p>
                <button
                  onClick={() => navigate("/complete-alumni-profile")}
                  className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Complete Profile Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfilePage;
