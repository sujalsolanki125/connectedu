import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const AlumniDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [myStats, setMyStats] = useState({
    rank: 0,
    level: 'Bronze',
    points: 0,
    streak: { current: 0, longest: 0 },
    contributions: {
      interviewExperiences: 0,
      companyInsights: 0,
      mockInterviews: 0,
      mentorshipSessions: 0,
      resourcesShared: 0,
      questionsAnswered: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLeaderboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyLeaderboardStats = async () => {
    try {
      const response = await fetch('${process.env.BACKEND_URL}/api/leaderboard/me', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      const data = await response.json();
      // Properly structure the data to avoid rendering objects
      const processedData = {
        rank: data.rank || 0,
        level: data.level || 'Bronze',
        points: data.points || 0,
        streak: {
          current: typeof data.streak === 'object' ? (data.streak?.current || 0) : (data.streak || 0),
          longest: typeof data.streak === 'object' ? (data.streak?.longest || 0) : (data.streak || 0),
        },
        contributions: {
          interviewExperiences: data.contributions?.interviewExperiences || 0,
          companyInsights: data.contributions?.companyInsights || 0,
          mockInterviews: data.contributions?.mockInterviews || 0,
          mentorshipSessions: data.contributions?.mentorshipSessions || 0,
          resourcesShared: data.contributions?.resourcesShared || 0,
          questionsAnswered: data.contributions?.questionsAnswered || 0,
        },
      };
      setMyStats(processedData);
    } catch (error) {
      // Error handled silently
      // Keep default state on error
    } finally {
      setLoading(false);
    }
  };

  const contributionTypes = [
    {
      title: 'Interview Experiences',
      icon: '🎯',
      count: myStats?.contributions?.interviewExperiences || 0,
      link: '/interview-experiences',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Company Insights',
      icon: '💼',
      count: myStats?.contributions?.companyInsights || 0,
      link: '/company-insights',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Mock Interviews',
      icon: '🎤',
      count: myStats?.contributions?.mockInterviews || 0,
      link: '/mock-interviews',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Mentorship Sessions',
      icon: '🧠',
      count: myStats?.contributions?.mentorshipSessions || 0,
      link: '/mentorship',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Resources Shared',
      icon: '📊',
      count: myStats?.contributions?.resourcesShared || 0,
      link: '/resources',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Questions Answered',
      icon: '💬',
      count: myStats?.contributions?.questionsAnswered || 0,
      link: '/qa',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  const quickActions = [
    {
      title: 'Share Interview Experience',
      description: 'Help students with your interview insights',
      icon: '✍️',
      link: '/interviews/create',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Add Company Insight',
      description: 'Share company culture and hiring details',
      icon: '🏢',
      link: '/company-insights/create',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Offer Mentorship',
      description: 'Guide students in their career journey',
      icon: '🤝',
      link: '/mentorship/create',
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Schedule Mock Interview',
      description: 'Conduct practice interviews for students',
      icon: '🎥',
      link: '/mock-interviews/create',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Upload Resource',
      description: 'Share helpful preparation materials',
      icon: '📤',
      link: '/resources/upload',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Answer Questions',
      description: 'Help students with their queries',
      icon: '❓',
      link: '/qa',
      color: 'from-pink-500 to-rose-500',
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

  const badges = [
    { name: 'Early Adopter', icon: '🌟', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Mentor Master', icon: '🎓', color: 'bg-blue-100 text-blue-700' },
    { name: 'Top Contributor', icon: '👑', color: 'bg-purple-100 text-purple-700' },
    { name: 'Helpful Alumni', icon: '💖', color: 'bg-pink-100 text-pink-700' },
  ];

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
            Welcome back, <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">{userInfo?.name}</span>! 🎉
          </h1>
          <p className="mt-2 text-lg text-gray-600">Alumni Contributor Dashboard - Thank you for giving back!</p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Rank Card */}
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Global Rank</p>
                <p className="text-4xl font-extrabold">#{myStats.rank || '-'}</p>
                <Link to="/leaderboard" className="text-yellow-100 text-xs mt-2 inline-flex items-center hover:text-white transition-colors">
                  View Leaderboard
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="text-5xl opacity-20">🏆</div>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Your Level</p>
                <p className={`text-4xl font-extrabold ${getLevelColor(myStats.level)}`}>{myStats.level || 'Bronze'}</p>
                <p className="text-purple-100 text-xs mt-2">Keep contributing!</p>
              </div>
              <div className="text-5xl opacity-20">⭐</div>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Impact Points</p>
                <p className="text-4xl font-extrabold">{myStats.points || 0}</p>
                <p className="text-green-100 text-xs mt-2">Making a difference!</p>
              </div>
              <div className="text-5xl opacity-20">💎</div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Active Streak</p>
                <p className="text-4xl font-extrabold">{myStats.streak?.current || 0} days</p>
                <p className="text-orange-100 text-xs mt-2">Longest: {myStats.streak?.longest || 0} days</p>
              </div>
              <div className="text-5xl opacity-20">🔥</div>
            </div>
          </div>
        </div>

        {/* Contributions Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Your Contributions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {contributionTypes.map((contrib, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transform hover:-translate-y-2 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${contrib.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {contrib.icon}
                  </div>
                  <div className={`px-4 py-2 ${contrib.bgColor} ${contrib.textColor} rounded-full font-bold text-xl`}>
                    {contrib.count}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{contrib.title}</h3>
                <Link
                  to={contrib.link}
                  className="text-primary-600 font-semibold text-sm inline-flex items-center hover:translate-x-2 transition-transform duration-300"
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🚀</span>
            Share Your Knowledge
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transform hover:-translate-y-2 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Badges & Recognition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Badges */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">🏅</span>
              Your Badges
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`${badge.color} rounded-xl p-4 text-center transform hover:scale-105 transition-transform duration-300`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="font-bold text-sm">{badge.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">💡</span>
              Impact Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">👥</div>
                  <div>
                    <p className="font-bold text-gray-900">Students Helped</p>
                    <p className="text-sm text-gray-600">Direct mentorship impact</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-blue-600">
                  {(myStats?.contributions?.mentorshipSessions || 0) + (myStats?.contributions?.mockInterviews || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">📚</div>
                  <div>
                    <p className="font-bold text-gray-900">Content Created</p>
                    <p className="text-sm text-gray-600">Experiences & insights shared</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-green-600">
                  {(myStats?.contributions?.interviewExperiences || 0) + (myStats?.contributions?.companyInsights || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">💬</div>
                  <div>
                    <p className="font-bold text-gray-900">Community Engagement</p>
                    <p className="text-sm text-gray-600">Questions answered</p>
                  </div>
                </div>
                <span className="text-2xl font-extrabold text-purple-600">
                  {myStats?.contributions?.questionsAnswered || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 rounded-2xl shadow-2xl p-8 text-white text-center animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4">🌟 Thank You for Making a Difference!</h2>
            <p className="text-lg text-purple-100 mb-6">
              Your contributions are helping students achieve their career dreams. Every insight you share creates a lasting impact!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/interview-experiences/create"
                className="px-8 py-3 bg-white text-primary-600 rounded-full font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Share Experience
              </Link>
              <Link
                to="/mentorship/create"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-primary-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                Offer Mentorship
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
