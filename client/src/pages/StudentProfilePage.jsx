import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Camera, Trash2, Upload } from "lucide-react";

const StudentProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

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
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/profile/student`,
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
      profileData.profile.collegeName,
      profileData.profile.branch,
      profileData.profile.cgpa,
      profileData.profile.technicalSkills?.length > 0,
      profileData.profile.careerInterests?.length > 0,
      profileData.profile.linkedinProfile,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PNG and JPG images are allowed');
      return;
    }

    // Validate file size (3MB = 3 * 1024 * 1024 bytes)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be less than 3MB');
      return;
    }

    // Upload the file
    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    try {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/profile/upload-avatar`,
        formData,
        config
      );

      setUploadSuccess("Profile picture updated successfully!");
      
      // Update profile data with new avatar
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: data.avatar,
          avatarPublicId: data.avatarPublicId,
        },
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (err) {
      // Error handled silently
      setUploadError(err.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async () => {
    if (!window.confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/profile/avatar`,
        config
      );

      // Update profile data to remove avatar
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          avatar: null,
          avatarPublicId: null,
        },
      }));

      setUploadSuccess("Profile picture deleted successfully!");
      setTimeout(() => setUploadSuccess(""), 3000);
    } catch (err) {
      // Error handled silently
      setUploadError(err.response?.data?.message || "Failed to delete profile picture");
    } finally {
      setUploading(false);
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

  if (error) {
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">👤 My Profile</h1>
          <p className="text-xl text-white/90">Manage your profile information and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Profile Completion Banner */}
        {completionPercentage < 100 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl mb-8 shadow-lg">
            <div className="flex items-start">
              <span className="text-4xl mr-4">⚠️</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">
                  Complete Your Profile ({completionPercentage}%)
                </h3>
                <p className="text-yellow-700 mb-3">
                  A complete profile increases your visibility to alumni mentors and helps them understand you better.
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

        {/* Action Buttons */}
        <div className="flex justify-end mb-6 gap-4">
          <button
            onClick={() => navigate("/complete-profile")}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <span>✏️</span>
            Edit Profile
          </button>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              {/* Profile Picture Upload */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-purple-500 shadow-lg">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                      {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "S"}
                    </div>
                  )}
                </div>
                
                {/* Upload/Delete Buttons - Smaller, cleaner design */}
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <label
                    htmlFor="avatar-upload"
                    className={`bg-primary-600 hover:bg-primary-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-all hover:scale-110 ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="Upload profile picture"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/jpg, image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  
                  {profile.avatar && (
                    <button
                      onClick={deleteProfilePicture}
                      disabled={uploading}
                      className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 disabled:opacity-50"
                      title="Delete profile picture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Messages */}
              {uploadError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {uploadSuccess}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mb-4">
                PNG, JPG • Max 3MB
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.firstName && profile.lastName 
                  ? `${profile.firstName} ${profile.lastName}` 
                  : profileData.name || "Student Name"}
              </h2>
              <p className="text-gray-600 mb-4">{profileData.email}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{profile.cgpa || "-"}</div>
                  <div className="text-xs text-gray-600">CGPA</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">{profile.technicalSkills?.length || 0}</div>
                  <div className="text-xs text-gray-600">Skills</div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
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
                {profile.gender && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Gender</label>
                    <p className="text-gray-900 font-medium">{profile.gender}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔗</span>
                Social Links
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">LinkedIn</label>
                  {profile.linkedinProfile ? (
                    <a 
                      href={profile.linkedinProfile.startsWith("http") ? profile.linkedinProfile : `https://${profile.linkedinProfile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary-600 hover:text-primary-700 font-medium mt-1 truncate"
                    >
                      {profile.linkedinProfile}
                    </a>
                  ) : (
                    <p className="text-gray-400 italic mt-1">Not added</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-600">GitHub</label>
                  {profile.githubProfile ? (
                    <a 
                      href={profile.githubProfile.startsWith("http") ? profile.githubProfile : `https://${profile.githubProfile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary-600 hover:text-primary-700 font-medium mt-1 truncate"
                    >
                      {profile.githubProfile}
                    </a>
                  ) : (
                    <p className="text-gray-400 italic mt-1">Not added</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-600">Portfolio</label>
                  {profile.portfolioLink ? (
                    <a 
                      href={profile.portfolioLink.startsWith("http") ? profile.portfolioLink : `https://${profile.portfolioLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary-600 hover:text-primary-700 font-medium mt-1 truncate"
                    >
                      {profile.portfolioLink}
                    </a>
                  ) : (
                    <p className="text-gray-400 italic mt-1">Not added</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
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
                <span className="text-2xl mr-2">🎓</span>
                Academic Details
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
                {profile.currentYear && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Year</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.currentYear}</p>
                  </div>
                )}
                {profile.graduationYear && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Graduation</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.graduationYear}</p>
                  </div>
                )}
                {profile.cgpa && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">CGPA</label>
                    <p className="text-gray-900 font-medium mt-1">{profile.cgpa}</p>
                  </div>
                )}
              </div>
              {!profile.collegeName && !profile.branch && (
                <p className="text-gray-500 italic">No academic details added yet</p>
              )}
            </div>

            {profile.careerInterests && profile.careerInterests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Career Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.careerInterests.map((interest, idx) => (
                    <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.technicalSkills && profile.technicalSkills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💻</span>
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.technicalSkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
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

            {profile.preferredCompanies && profile.preferredCompanies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏢</span>
                  Target Companies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredCompanies.map((company, idx) => (
                    <span key={idx} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                      {company}
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
                  Add your academic details, skills, and career interests to help alumni mentors find you.
                </p>
                <button
                  onClick={() => navigate("/complete-profile")}
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

export default StudentProfilePage;
