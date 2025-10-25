import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [myStats, setMyStats] = useState({
    rank: 0,
    level: 'Bronze',
    points: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaderboardStats();
  }, []);

  const fetchMyLeaderboardStats = async () => {
    try {
      const response = await fetch('${process.env.BACKEND_URL}/api/leaderboard/me', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await response.json();
      setMyStats(data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Interview Experiences',
      description: 'Browse real interview Q&A',
      icon: '📘',
      link: '/interview-experiences',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Company Insights',
      description: 'Explore company details',
      icon: '💼',
      link: '/company-insights',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Mock Interviews',
      description: 'Practice with alumni',
      icon: '🎤',
      link: '/mock-interviews',
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Find Mentors',
      description: 'Get career guidance',
      icon: '🧠',
      link: '/mentorship',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Ask Questions',
      description: 'Community Q&A forum',
      icon: '⭐',
      link: '/qa',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Resources',
      description: 'Study materials & templates',
      icon: '📊',
      link: '/resources',
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Leaderboard',
      description: 'Check your ranking',
      icon: '🏆',
      link: '/leaderboard',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const getLevelColor = (level) => {
    const colors = {
      Bronze: 'text-orange-600',
      Silver: 'text-gray-500',
      Gold: 'text-yellow-500',
      Platinum: 'text-blue-400',
      Diamond: 'text-cyan-400',
    };
    return colors[level] || 'text-gray-600';
  };

  const getLevelProgress = (points) => {
    if (points < 100) return (points / 100) * 100;
    if (points < 250) return ((points - 100) / 150) * 100;
    if (points < 500) return ((points - 250) / 250) * 100;
    if (points < 1000) return ((points - 500) / 500) * 100;
    return 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome back, <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">{userInfo?.name}</span>! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600">Here's your placement preparation journey</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Rank Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Your Rank</p>
                <p className="text-4xl font-extrabold">#{myStats.rank || '-'}</p>
                <p className="text-blue-100 text-xs mt-2">Global Ranking</p>
              </div>
              <div className="text-5xl opacity-20">🏅</div>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Your Level</p>
                <p className={`text-4xl font-extrabold ${getLevelColor(myStats.level)}`}>{myStats.level || 'Bronze'}</p>
                <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getLevelProgress(myStats.points)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-5xl opacity-20">⭐</div>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Points</p>
                <p className="text-4xl font-extrabold">{myStats.points || 0}</p>
                <p className="text-green-100 text-xs mt-2">Keep contributing!</p>
              </div>
              <div className="text-5xl opacity-20">💎</div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Current Streak</p>
                <p className="text-4xl font-extrabold">{myStats.streak || 0} days</p>
                <p className="text-orange-100 text-xs mt-2">Login daily to maintain!</p>
              </div>
              <div className="text-5xl opacity-20">🔥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🚀</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transform hover:-translate-y-2 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  Explore
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Your Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📈</span>
              Your Progress
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm font-bold text-primary-600">75%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary-600 to-secondary-500 h-3 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Interview Prep</span>
                  <span className="text-sm font-bold text-blue-600">60%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Mock Interviews</span>
                  <span className="text-sm font-bold text-green-600">40%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Mentorship Sessions</span>
                  <span className="text-sm font-bold text-orange-600">25%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">💡</span>
              Recommended for You
            </h3>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300 cursor-pointer">
                <div className="text-2xl mr-3">📝</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Complete Your Profile</h4>
                  <p className="text-sm text-gray-600">Add your skills and preferences to get better recommendations</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300 cursor-pointer">
                <div className="text-2xl mr-3">🎯</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Book a Mock Interview</h4>
                  <p className="text-sm text-gray-600">Practice with experienced alumni to improve your skills</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300 cursor-pointer">
                <div className="text-2xl mr-3">📚</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Download Resources</h4>
                  <p className="text-sm text-gray-600">Access preparation materials and resume templates</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-300 cursor-pointer">
                <div className="text-2xl mr-3">🤝</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Find a Mentor</h4>
                  <p className="text-sm text-gray-600">Connect with alumni for personalized career guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 rounded-2xl shadow-2xl p-8 text-white text-center animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4">🎯 Keep Up the Great Work!</h2>
            <p className="text-lg text-purple-100 mb-6">
              You're making excellent progress on your placement journey. Stay consistent and you'll achieve your goals!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/interview-experiences"
                className="px-8 py-3 bg-white text-primary-600 rounded-full font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Browse Interviews
              </Link>
              <Link
                to="/leaderboard"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-primary-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
