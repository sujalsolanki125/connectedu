import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AlumniPublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaderboardRank, setLeaderboardRank] = useState(null);

  useEffect(() => {
    fetchAlumniProfile();
  }, [id]);

  const fetchAlumniProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch alumni profile
      const { data } = await axios.get(
        `http://localhost:5000/api/users/${id}`,
        config
      );

      setAlumni(data);

      // Fetch leaderboard rank
      try {
        const leaderboardRes = await axios.get(
          `http://localhost:5000/api/leaderboard?limit=1000`,
          config
        );
        
        const userEntry = leaderboardRes.data.find(entry => entry.user?._id === id);
        if (userEntry) {
          setLeaderboardRank({
            rank: userEntry.rank,
            points: userEntry.points,
            level: userEntry.level
          });
        }
      } catch (lbError) {
        // Error handled silently
      }

      setLoading(false);
    } catch (err) {
      // Error handled silently
      setError(err.response?.data?.message || 'Failed to load alumni profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading alumni profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const profile = alumni?.profile || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">👨‍💼 Alumni Profile</h1>
          <p className="text-xl text-white/90">Learn from their experience and connect</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-8xl mb-4">👨‍💼</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {alumni.name}
              </h2>
              <p className="text-gray-600 mb-4">{alumni.email}</p>
              
              {/* Current Position */}
              {profile.currentPosition && (
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                  <p className="text-lg font-bold text-green-800">{profile.currentPosition}</p>
                  {profile.currentCompany && (
                    <p className="text-sm text-green-700 mt-1">@ {profile.currentCompany}</p>
                  )}
                </div>
              )}

              {/* Leaderboard Rank */}
              {leaderboardRank && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-300">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-xl font-bold text-gray-900">Rank #{leaderboardRank.rank}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p><span className="font-semibold">{leaderboardRank.points}</span> Points</p>
                    <p className="text-xs text-gray-600 mt-1">{leaderboardRank.level}</p>
                  </div>
                </div>
              )}

              {/* Request Mentorship Button */}
              {userInfo?.role === 'student' && (
                <Link
                  to={`/mentorship?mentor=${id}`}
                  className="mt-6 w-full inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  🤝 Request Mentorship
                </Link>
              )}
            </div>

            {/* Contact & Social Links */}
            {(profile.linkedinProfile || profile.githubProfile || profile.portfolioLink) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔗</span>
                  Connect
                </h3>
                <div className="space-y-3">
                  {profile.linkedinProfile && (
                    <a
                      href={profile.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-2xl">💼</span>
                      <div className="flex-1">
                        <p className="text-xs text-blue-600">LinkedIn</p>
                        <p className="text-sm font-semibold text-blue-700 truncate">View Profile</p>
                      </div>
                      <span>→</span>
                    </a>
                  )}
                  {profile.githubProfile && (
                    <a
                      href={profile.githubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl">💻</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">GitHub</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">View Repositories</p>
                      </div>
                      <span>→</span>
                    </a>
                  )}
                  {profile.portfolioLink && (
                    <a
                      href={profile.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <span className="text-2xl">🌐</span>
                      <div className="flex-1">
                        <p className="text-xs text-purple-600">Portfolio</p>
                        <p className="text-sm font-semibold text-purple-700 truncate">Visit Website</p>
                      </div>
                      <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Education & Background */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🎓</span>
                Education & Background
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.collegeName && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-700 font-semibold mb-1">College</p>
                    <p className="text-sm font-bold text-gray-900">{profile.collegeName}</p>
                  </div>
                )}
                {profile.branch && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-700 font-semibold mb-1">Branch</p>
                    <p className="text-sm font-bold text-gray-900">{profile.branch}</p>
                  </div>
                )}
                {profile.graduationYear && (
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-700 font-semibold mb-1">Graduation Year</p>
                    <p className="text-sm font-bold text-gray-900">{profile.graduationYear}</p>
                  </div>
                )}
                {profile.degree && (
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-xs text-orange-700 font-semibold mb-1">Degree</p>
                    <p className="text-sm font-bold text-gray-900">{profile.degree}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Experience */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>💼</span>
                Professional Experience
              </h3>
              <div className="space-y-4">
                {profile.currentCompany && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-l-4 border-green-500">
                    <p className="text-xs text-green-700 font-semibold mb-1">Current Company</p>
                    <p className="text-lg font-bold text-gray-900">{profile.currentCompany}</p>
                    {profile.currentPosition && (
                      <p className="text-sm text-green-700 mt-1">{profile.currentPosition}</p>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {profile.totalExperience && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Total Experience</p>
                      <p className="text-sm font-bold text-gray-900">{profile.totalExperience} years</p>
                    </div>
                  )}
                  {profile.industryDomain && (
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-xs text-purple-700 font-semibold mb-1">Industry</p>
                      <p className="text-sm font-bold text-gray-900">{profile.industryDomain}</p>
                    </div>
                  )}
                </div>

                {profile.previousCompanies && profile.previousCompanies.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-700 font-semibold mb-2">Previous Companies</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.previousCompanies.map((company, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-300"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Skills */}
            {profile.technicalSkills && profile.technicalSkills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💻</span>
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.technicalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {profile.softSkills && profile.softSkills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🤝</span>
                  Soft Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.softSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Career Interests */}
            {profile.careerInterests && profile.careerInterests.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🎯</span>
                  Areas of Expertise
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.careerInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Experience */}
            {profile.numberOfInterviewsFaced && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🎤</span>
                  Interview Experience
                </h3>
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-500">
                  <p className="text-3xl font-bold text-gray-900 mb-2">{profile.numberOfInterviewsFaced}</p>
                  <p className="text-gray-700 font-medium">Interviews Faced</p>
                  <p className="text-sm text-gray-600 mt-2">Can provide valuable insights from real interview experiences</p>
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📝</span>
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniPublicProfilePage;
