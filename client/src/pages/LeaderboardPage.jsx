import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Footer from '../components/Footer';

const LeaderboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [leaderboard, setLeaderboard] = useState([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [timePeriod, setTimePeriod] = useState('all-time');
  const [levelFilter, setLevelFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [lbRes, meRes, topRes] = await Promise.all([
          axios.get('http://localhost:5000/api/leaderboard?limit=100', config),
          axios.get('http://localhost:5000/api/leaderboard/me', config),
          axios.get('http://localhost:5000/api/leaderboard/top-contributors?limit=4', config),
        ]);
        // Server already enforces alumni-only. Avoid over-filtering on the client
        // which could hide valid results if role casing differs.
        const lbRaw = Array.isArray(lbRes.data) ? lbRes.data : [];
        setLeaderboard(lbRaw);
        setFilteredLeaderboard(lbRaw);
        const me = meRes.data || null;
        setMyStats(userInfo?.role === 'alumni' ? me : null);
        // Same reasoning as above – trust server to return alumni-only
        const topRaw = Array.isArray(topRes.data) ? topRes.data : [];
        setTopContributors(topRaw);
      } catch (err) {
        // Error handled silently
        setError(err?.response?.data?.message || 'Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter by level
  useEffect(() => {
    let filtered = [...leaderboard];
    if (levelFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.level === levelFilter);
    }
    filtered = filtered.map((entry, index) => ({ ...entry, filteredRank: index + 1 }));
    setFilteredLeaderboard(filtered);
  }, [levelFilter, leaderboard]);

  // Helpers
  const getLevelGradient = (level) => {
    const gradients = {
      Diamond: 'from-sky-400 via-blue-400 to-cyan-500',        // 🔷 Sky Blue (500+ pts)
      Platinum: 'from-cyan-300 via-blue-300 to-indigo-400',    // 💎 Light Blue (300-499 pts)
      Gold: 'from-yellow-400 via-yellow-500 to-amber-500',     // 🥇 Yellow (200-299 pts)
      Silver: 'from-gray-400 via-gray-500 to-slate-500',       // 🥈 Gray (100-199 pts)
      Bronze: 'from-amber-700 via-orange-800 to-amber-900',    // 🥉 Brown (0-99 pts)
    };
    return gradients[level] || 'from-gray-400 to-gray-600';
  };

  const getLevelIcon = (level) => {
    const icons = { 
      Diamond: '�',    // Sky Blue Diamond (500+)
      Platinum: '💎',   // Light Blue Platinum (300-499)
      Gold: '🥇',       // Yellow Gold (200-299)
      Silver: '🥈',     // Gray Silver (100-199)
      Bronze: '🥉'      // Brown Bronze (0-99)
    };
    return icons[level] || '⭐';
  };

  const getLevelInfo = (level) => {
    const info = {
      Diamond: { range: '500+', color: 'text-sky-600' },
      Platinum: { range: '300-499', color: 'text-blue-600' },
      Gold: { range: '200-299', color: 'text-yellow-600' },
      Silver: { range: '100-199', color: 'text-gray-600' },
      Bronze: { range: '0-99', color: 'text-amber-800' },
    };
    return info[level] || { range: '0', color: 'text-gray-600' };
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankChangeIcon = (change) => {
    if (change > 0) return <span className="text-green-500">↑{change}</span>;
    if (change < 0) return <span className="text-red-500">↓{Math.abs(change)}</span>;
    return <span className="text-gray-400">─</span>;
  };

  const getTotalContributions = (contributions) => {
    return Object.values(contributions || {}).reduce((a, b) => a + Number(b || 0), 0);
  };

  // Render star rating display
  const renderStarRating = (rating) => {
    const avgRating = rating?.average || 0;
    const totalRatings = rating?.total || 0;
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => {
            if (star <= fullStars) {
              return <span key={star} className="text-yellow-500 text-lg">⭐</span>;
            } else if (star === fullStars + 1 && hasHalfStar) {
              return <span key={star} className="text-yellow-500 text-lg">⭐</span>;
            } else {
              return <span key={star} className="text-gray-300 text-lg">☆</span>;
            }
          })}
        </div>
        <p className="text-sm font-bold text-gray-800 mt-1">
          {avgRating > 0 ? avgRating.toFixed(1) : '0.0'} / 5
        </p>
        <p className="text-xs text-gray-500">({totalRatings} ratings)</p>
      </div>
    );
  };

  const totalMyContributions = useMemo(() => getTotalContributions(myStats?.contributions), [myStats]);

  // Simple avatar renderer: if avatar is a URL/base64 image, show image; else fallback to initials or emoji
  const Avatar = ({ avatar, name, size = 'md' }) => {
    const dims = size === 'lg' ? 'h-16 w-16' : 'h-10 w-10';
    const isImageUrl = typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:image'));
    if (isImageUrl) {
      return (
        <img
          src={avatar}
          alt={name || 'User avatar'}
          className={`${dims} rounded-full object-cover border`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '';
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    const initials = (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('');
    const text = avatar && avatar.length <= 4 ? avatar : initials || '👤';
    return (
      <div className={`${dims} rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg`}>
        {text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-3 animate-fade-in flex items-center justify-center">
              <span className="text-6xl mr-3">🏆</span>
              Leaderboard & Recognition
            </h1>
            <p className="text-yellow-100 text-xl animate-fade-in">
              Celebrating our top contributors and community champions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Points System Info Card */}
        {/* How Points Are Earned - HIDDEN (Backend Algorithm) */}
        {/* <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            How Points Are Earned
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-green-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm font-bold text-gray-700">Accepting Request</p>
              <p className="text-2xl font-extrabold text-green-600">+10</p>
              <p className="text-xs text-gray-500">per request</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-bold text-gray-700">Completed Session</p>
              <p className="text-2xl font-extrabold text-blue-600">+20</p>
              <p className="text-xs text-gray-500">per session</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-purple-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🎤</div>
              <p className="text-sm font-bold text-gray-700">Interview Experience</p>
              <p className="text-2xl font-extrabold text-purple-600">+15</p>
              <p className="text-xs text-gray-500">per upload</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-orange-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm font-bold text-gray-700">Prep Resources</p>
              <p className="text-2xl font-extrabold text-orange-600">+10</p>
              <p className="text-xs text-gray-500">per resource</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-pink-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🎭</div>
              <p className="text-sm font-bold text-gray-700">Workshop Conducted</p>
              <p className="text-2xl font-extrabold text-pink-600">+25</p>
              <p className="text-xs text-gray-500">per workshop</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm font-bold text-gray-700">5-Star Rating</p>
              <p className="text-2xl font-extrabold text-yellow-600">+10</p>
              <p className="text-xs text-gray-500">per rating</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-teal-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-sm font-bold text-gray-700">Weekly Streak</p>
              <p className="text-2xl font-extrabold text-teal-600">+5</p>
              <p className="text-xs text-gray-500">per week</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-indigo-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🏢</div>
              <p className="text-sm font-bold text-gray-700">Company Insights</p>
              <p className="text-2xl font-extrabold text-indigo-600">+15</p>
              <p className="text-xs text-gray-500">per insight</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-cyan-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">❓</div>
              <p className="text-sm font-bold text-gray-700">Questions Answered</p>
              <p className="text-2xl font-extrabold text-cyan-600">+5</p>
              <p className="text-xs text-gray-500">per answer</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-red-300 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">❌</div>
              <p className="text-sm font-bold text-gray-700">Ignored Request</p>
              <p className="text-2xl font-extrabold text-red-600">-5</p>
              <p className="text-xs text-gray-500">3+ days no reply</p>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-lg p-4 border-2 border-gray-300">
            <p className="text-sm text-gray-600 mb-2">
              <strong className="text-gray-800">Formula:</strong> Total Points = (Accepted × 10) + (Completed × 20) + (Interviews × 15) + (Resources × 10) + (Workshops × 25) + (5-Stars × 10) + (Streak weeks × 5) + (Insights × 15) + (Questions × 5) - (Missed × 5)
            </p>
          </div>
        </div> */}

        {/* My Stats (wireframe) */}
        {myStats && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border">
                <p className="text-sm text-gray-600 mb-1">Your rank</p>
                <p className="text-2xl font-extrabold">#{myStats.rank || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border">
                <p className="text-sm text-gray-600 mb-1">Level</p>
                <p className="text-2xl font-extrabold flex items-center">
                  <span className="mr-2">{getLevelIcon(myStats.level)}</span>
                  {myStats.level}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border">
                <p className="text-sm text-gray-600 mb-1">Overall points</p>
                <p className="text-2xl font-extrabold text-green-600">{(myStats.points || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-300">
                <p className="text-sm text-yellow-700 mb-1 font-semibold">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-extrabold text-yellow-600">
                    {myStats.rating?.average ? myStats.rating.average.toFixed(1) : '0.0'}
                  </p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`text-xl ${
                          star <= Math.round(myStats.rating?.average || 0) 
                            ? 'text-yellow-500' 
                            : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Based on {myStats.rating?.total || 0} ratings
                </p>
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm font-bold text-gray-700 mb-3">Your Contributions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-700 font-medium mb-1">🤝 Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{myStats.contributions?.acceptedMentorships || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-700 font-medium mb-1">✅ Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{myStats.contributions?.mentorshipSessions || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-orange-700 font-medium mb-1">📚 Resources</p>
                  <p className="text-2xl font-bold text-orange-600">{myStats.contributions?.resourcesShared || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-pink-700 font-medium mb-1">🎭 Workshops</p>
                  <p className="text-2xl font-bold text-pink-600">{myStats.contributions?.mockInterviews || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-yellow-700 font-medium mb-1">⭐ 5-Stars</p>
                  <p className="text-2xl font-bold text-yellow-600">{myStats.contributions?.fiveStarRatings || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-indigo-700 font-medium mb-1">🏢 Insights</p>
                  <p className="text-2xl font-bold text-indigo-600">{myStats.contributions?.companyInsights || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-700 font-medium mb-1">❌ Missed</p>
                  <p className="text-2xl font-bold text-red-600">{myStats.contributions?.missedRequests || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-teal-700 font-medium mb-1">🔥 Streak</p>
                  <p className="text-2xl font-bold text-teal-600">{Math.floor((myStats.streak?.current || 0) / 7)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-sm text-gray-600">Total Contributions: <span className="font-bold text-gray-800">{totalMyContributions}</span></p>
                <p className="text-sm text-gray-600">Total Points: <span className="font-bold text-green-600">{(myStats.points || 0).toLocaleString()}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Time Period</label>
              <div className="flex flex-wrap gap-2">
                {['daily', 'weekly', 'monthly', 'all-time'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                      timePeriod === period
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Level</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLevelFilter('all')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                    levelFilter === 'all'
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Levels
                </button>
                {['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center ${
                      levelFilter === level
                        ? `bg-gradient-to-r ${getLevelGradient(level)} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{getLevelIcon(level)}</span>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Formula Card - HIDDEN (Backend Algorithm) */}
        {/* <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🧮</span>
            How Rankings Are Calculated
          </h2>
          <div className="bg-white rounded-lg p-5 border-2 border-indigo-300">
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-lg font-bold text-indigo-700 mb-3">Weighted Ranking Formula</h3>
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 font-mono text-sm">
                  <p className="text-gray-800 font-bold">Rank Score = </p>
                  <p className="text-indigo-600 ml-4">(Points × 0.7) +</p>
                  <p className="text-purple-600 ml-4">(Avg Rating × 20 × 0.3)</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-purple-700 mb-3">Weight Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-8 mr-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{width: '70%'}}>
                        70% Activity Points
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-8 mr-3">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{width: '30%'}}>
                        30% Student Ratings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong className="text-indigo-700">📌 Example:</strong> If you have <strong>300 points</strong> and an average rating of <strong>4.5/5</strong>:
              </p>
              <p className="text-sm text-gray-600 mt-2 font-mono">
                Rank Score = (300 × 0.7) + (4.5 × 20 × 0.3) = 210 + 27 = <strong className="text-green-600">237</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                💡 This means both your activity <strong>and</strong> student satisfaction matter! Maintain high ratings to boost your rank.
              </p>
            </div>
          </div>
        </div> */}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-extrabold flex items-center">
              <span className="mr-2">📊</span>
              Global Rankings
              <span className="ml-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {filteredLeaderboard.length} users
              </span>
            </h2>
            <p className="text-sm text-purple-100 mt-2">Sorted by Rank Score (Activity + Ratings)</p>
          </div>

          {error && <div className="px-6 py-3 bg-red-50 text-red-700 border-b">{error}</div>}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading leaderboard...</p>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-700 font-semibold">No leaderboard data yet</p>
              <p className="text-sm text-gray-500 mt-1">Contributions will appear here once users start participating.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contributions</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Streak</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeaderboard.map((entry) => {
                    const isCurrentUser = entry.user?._id === userInfo?._id && userInfo?.role === 'alumni';
                    const displayRank = levelFilter !== 'all' ? entry.filteredRank : entry.rank;
                    const medal = getRankMedal(entry.rank);
                    return (
                      <tr
                        key={entry._id}
                        className={`${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500'
                            : entry.rank <= 3
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50'
                            : 'hover:bg-gray-50'
                        } transition-colors duration-200`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {medal ? (
                              <span className="text-4xl">{medal}</span>
                            ) : (
                              <span className="text-2xl font-extrabold text-gray-700">#{displayRank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-3"><Avatar avatar={entry.user?.profile?.avatar} name={entry.user?.name} /></div>
                            <div>
                              <div className="flex items-center">
                                <p className="text-sm font-bold text-gray-900">{entry.user?.name || 'Unknown User'}</p>
                                {isCurrentUser && (
                                  <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">YOU</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{entry.user?.email || '—'}</p>
                              {entry.badges?.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {entry.badges.slice(0, 3).map((badge, idx) => (
                                    <span key={idx} className="text-lg">{badge}</span>
                                  ))}
                                  {entry.badges.length > 3 && (
                                    <span className="text-xs text-gray-500 self-center">+{entry.badges.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getLevelGradient(entry.level)} shadow-md`}>
                            <span className="mr-1">{getLevelIcon(entry.level)}</span>
                            {entry.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStarRating(entry.rating)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-lg font-extrabold text-gray-900">{(entry.points || 0).toLocaleString()}</p>
                            {entry.rankScore > 0 && (
                              <p className="text-xs text-gray-500">Score: {entry.rankScore.toFixed(1)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2">
                              <p className="text-2xl font-bold text-blue-600">{getTotalContributions(entry.contributions)}</p>
                              <p className="text-xs text-blue-500">total</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-1">🔥</span>
                            <div>
                              <p className="text-lg font-bold text-orange-600">{entry.streak?.current || 0}</p>
                              <p className="text-xs text-gray-500">Best: {entry.streak?.longest || 0}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-lg font-bold">{getRankChangeIcon(entry.rankChange || 0)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Contributors */}
        {topContributors.length > 0 && (
          <div className="animate-fade-in">
            <div className="bg-white border rounded-t-2xl p-6">
              <h2 className="text-2xl font-extrabold">Top contributors</h2>
            </div>
            <div className="bg-white rounded-b-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {topContributors.map((contributor, index) => (
                  <div key={contributor._id} className="border rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">{getRankMedal(index + 1) || '⭐'}</div>
                    <div className="mb-2 flex items-center justify-center"><Avatar avatar={contributor.user?.profile?.avatar} name={contributor.user?.name} size="lg" /></div>
                    <h3 className="font-bold mb-1">{contributor.user?.name}</h3>
                    <div className="text-sm mb-2 inline-flex items-center px-3 py-1 rounded-full border">
                      <span className="mr-1">{getLevelIcon(contributor.level)}</span>
                      {contributor.level}
                    </div>
                    <div className="text-gray-700 text-sm">{contributor.points?.toLocaleString()} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Levels & Ranks Info Card - Alumni Only */}
        {userInfo?.role === 'alumni' && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-200 rounded-2xl shadow-xl p-6 mt-8 animate-fade-in">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏅</span>
            Level System & Ranks
          </h2>
          <p className="text-sm text-gray-600 mb-4">Levels are automatically updated based on your total points. Climb the ranks to earn exclusive badges!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 border-2 border-amber-300 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-5xl mb-2">🥉</div>
                <h3 className="text-lg font-extrabold text-amber-800 mb-2">Bronze</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getLevelGradient('Bronze')} shadow-md mb-2`}>
                  0 - 99 pts
                </div>
                <p className="text-xs text-gray-600 mt-2">Beginner level - Start your journey!</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-gray-400 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-5xl mb-2">🥈</div>
                <h3 className="text-lg font-extrabold text-gray-700 mb-2">Silver</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getLevelGradient('Silver')} shadow-md mb-2`}>
                  100 - 199 pts
                </div>
                <p className="text-xs text-gray-600 mt-2">Active contributor - Keep going!</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-yellow-400 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-5xl mb-2">🥇</div>
                <h3 className="text-lg font-extrabold text-yellow-600 mb-2">Gold</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getLevelGradient('Gold')} shadow-md mb-2`}>
                  200 - 299 pts
                </div>
                <p className="text-xs text-gray-600 mt-2">Dedicated mentor - Impressive!</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-blue-400 hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-center">
                <div className="text-5xl mb-2">💎</div>
                <h3 className="text-lg font-extrabold text-blue-600 mb-2">Platinum</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getLevelGradient('Platinum')} shadow-md mb-2`}>
                  300 - 499 pts
                </div>
                <p className="text-xs text-gray-600 mt-2">Expert mentor - Outstanding!</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-sky-400 hover:shadow-xl transition-all transform hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                ELITE
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">🔷</div>
                <h3 className="text-lg font-extrabold text-sky-600 mb-2">Diamond</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getLevelGradient('Diamond')} shadow-md mb-2`}>
                  500+ pts
                </div>
                <p className="text-xs text-gray-600 mt-2">Elite mentor - Legendary!</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border border-blue-300">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-800">💡 Pro Tip:</strong> Your level updates automatically every time your points change. Complete mentorships, share resources, and maintain your streak to level up faster!
            </p>
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
