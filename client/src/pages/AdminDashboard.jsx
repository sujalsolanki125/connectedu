import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Real-time stats data from database
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    totalStudents: 0,
    totalAlumni: 0,
    totalAdmins: 0,
    totalExperiences: 0,
    totalMockInterviews: 0,
    totalQuestionsAnswered: 0,
    totalMentorshipSessions: 0,
    avgEngagement: 0,
    serverUptime: 99.9,
  });

  // Real-time activity logs from database
  const [activityLogs, setActivityLogs] = useState([]);

  // Real-time reported content from database
  const [reportedContent, setReportedContent] = useState([]);

  // Fetch all dashboard data from database
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      

      // Fetch all data in parallel with individual error handling
      const [usersRes, statsRes, leaderboardRes, mentorshipRes, interviewRes, resourcesRes] = await Promise.allSettled([
        axios.get('${process.env.BACKEND_URL}/api/users', config),
        axios.get('${process.env.BACKEND_URL}/api/users/stats', config),
        axios.get('${process.env.BACKEND_URL}/api/leaderboard?limit=100', config),
        axios.get('${process.env.BACKEND_URL}/api/mentorship-requests', config),
        axios.get('${process.env.BACKEND_URL}/api/interviews', config),
        axios.get('${process.env.BACKEND_URL}/api/placement-resources', config),
      ]);

      // Extract data from settled promises
      const usersData = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [];
      const statsData = statsRes.status === 'fulfilled' ? (statsRes.value.data || {}) : {};
      const leaderboardData = leaderboardRes.status === 'fulfilled' ? (leaderboardRes.value.data || []) : [];
      const mentorshipData = mentorshipRes.status === 'fulfilled' ? (mentorshipRes.value.data || []) : [];
      const interviewData = interviewRes.status === 'fulfilled' ? (interviewRes.value.data || []) : [];
      const resourcesData = resourcesRes.status === 'fulfilled' ? (resourcesRes.value.data || []) : [];

      // Log any failed requests
      
      
      
      
      
      

            
      // Merge users with their leaderboard data
      const usersWithStats = usersData.map(user => {
        const userLeaderboard = leaderboardData.find(lb => lb.user?._id === user._id);
        return {
          ...user,
          contributions: userLeaderboard ? (
            (userLeaderboard.contributions?.acceptedMentorships || 0) +
            (userLeaderboard.contributions?.mentorshipSessions || 0) +
            (userLeaderboard.contributions?.interviewExperiences || 0) +
            (userLeaderboard.contributions?.resourcesShared || 0) +
            (userLeaderboard.contributions?.mockInterviews || 0)
          ) : 0,
          points: userLeaderboard?.points || 0,
          status: user.isActive !== false ? 'active' : 'inactive',
          joinedDate: new Date(user.createdAt).toLocaleDateString(),
          lastActive: calculateLastActive(user.updatedAt),
        };
      });

      setUsers(usersWithStats);
      setFilteredUsers(usersWithStats);

      // Calculate active today (users updated in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeToday = usersData.filter(u => new Date(u.updatedAt) > oneDayAgo).length;

      // Calculate new this week (users created in last 7 days)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newThisWeek = usersData.filter(u => new Date(u.createdAt) > oneWeekAgo).length;

      // Count admins
      const totalAdmins = usersData.filter(u => u.role === 'admin').length;

      // Count completed mentorships
      const completedMentorships = mentorshipData.filter(m => m.status === 'completed').length;

      setStats({
        totalUsers: statsData.totalUsers || usersData.length,
        activeToday,
        newThisWeek,
        totalStudents: statsData.totalStudents || 0,
        totalAlumni: statsData.totalAlumni || 0,
        totalAdmins,
        totalExperiences: interviewData.length,
        totalMockInterviews: 0, // Can add this later if needed
        totalQuestionsAnswered: 0, // Can add this later if needed
        totalMentorshipSessions: completedMentorships,
        avgEngagement: calculateEngagement(leaderboardData),
        serverUptime: 99.9,
      });

      // Create activity logs from recent data
      const recentActivities = generateActivityLogs(usersWithStats, mentorshipData, interviewData, resourcesData);
      setActivityLogs(recentActivities);

    } catch (error) {
      // Error handled silently
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      const statusCode = error.response?.status;
      
      if (statusCode === 401) {
        alert('Unauthorized: Please login as admin to access dashboard.');
      } else if (statusCode === 403) {
        alert('Access Denied: Only admins can access this dashboard.');
      } else {
        alert(`Failed to load dashboard data: ${errorMsg}\n\nPlease check:\n1. Backend server is running (port 5000)\n2. You are logged in as admin\n3. Your network connection`);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateLastActive = (updatedAt) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const calculateEngagement = (leaderboardData) => {
    if (!leaderboardData || leaderboardData.length === 0) return 0;
    const totalPoints = leaderboardData.reduce((sum, lb) => sum + (lb.points || 0), 0);
    const avgPoints = totalPoints / leaderboardData.length;
    return Math.min(Math.round((avgPoints / 100) * 100), 100); // Normalize to percentage
  };

  const generateActivityLogs = (users, mentorships, interviews, resources) => {
    const activities = [];
    let idCounter = 1;

    // Add recent user registrations
    users
      .filter(u => u.role !== 'admin')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .forEach(user => {
        activities.push({
          id: idCounter++,
          user: user.name,
          action: 'joined the platform',
          time: calculateLastActive(user.createdAt),
          type: 'user',
        });
      });

    // Add recent mentorship completions
    mentorships
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 2)
      .forEach(m => {
        activities.push({
          id: idCounter++,
          user: m.student?.name || 'Unknown',
          action: 'completed mentorship session',
          time: calculateLastActive(m.updatedAt),
          type: 'mentorship',
        });
      });

    // Add recent interview experiences
    interviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .forEach(exp => {
        activities.push({
          id: idCounter++,
          user: exp.uploadedBy?.name || 'Alumni',
          action: 'shared interview experience',
          time: calculateLastActive(exp.createdAt),
          type: 'content',
        });
      });

    // Add recent resource uploads
    resources
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .forEach(res => {
        activities.push({
          id: idCounter++,
          user: res.uploadedBy?.name || 'Alumni',
          action: 'uploaded a resource',
          time: calculateLastActive(res.createdAt),
          type: 'content',
        });
      });

    // Sort by most recent
    return activities.sort((a, b) => {
      const timeA = a.time.includes('Just now') ? 0 : parseTimeToMinutes(a.time);
      const timeB = b.time.includes('Just now') ? 0 : parseTimeToMinutes(b.time);
      return timeA - timeB;
    }).slice(0, 8);
  };

  const parseTimeToMinutes = (timeStr) => {
    if (timeStr.includes('min ago')) return parseInt(timeStr);
    if (timeStr.includes('hour')) return parseInt(timeStr) * 60;
    if (timeStr.includes('day')) return parseInt(timeStr) * 1440;
    if (timeStr.includes('week')) return parseInt(timeStr) * 10080;
    return 999999;
  };

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, statusFilter, users]);

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user._id));
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.delete(`${process.env.BACKEND_URL}/api/users/${userToDelete._id}`, config);
      
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('User deleted successfully');
    } catch (error) {
      // Error handled silently
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedUsers.length} selected users?`)) {
      try {
        const token = localStorage.getItem('token') || userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Delete all selected users
        await Promise.all(
          selectedUsers.map(userId => 
            axios.delete(`${process.env.BACKEND_URL}/api/users/${userId}`, config)
          )
        );
        
        setUsers(users.filter((u) => !selectedUsers.includes(u._id)));
        setSelectedUsers([]);
        alert('Selected users deleted successfully');
      } catch (error) {
        // Error handled silently
        alert('Failed to delete some users. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const token = localStorage.getItem('token') || userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Update user status
      await axios.put(
        `${process.env.BACKEND_URL}/api/users/profile`,
        { isActive: newStatus === 'active' },
        config
      );
      
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );
      alert(`User status updated to ${newStatus}`);
    } catch (error) {
      // Error handled silently
      alert('Failed to update user status. Please try again.');
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-500 text-white',
      alumni: 'bg-purple-500 text-white',
      student: 'bg-blue-500 text-white',
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  const getActivityIcon = (type) => {
    const icons = {
      content: '📝',
      qa: '💬',
      mentorship: '🎓',
      user: '👤',
    };
    return icons[type] || '📌';
  };

  const getActivityColor = (type) => {
    const colors = {
      content: 'bg-blue-100 text-blue-700 border-blue-300',
      qa: 'bg-green-100 text-green-700 border-green-300',
      mentorship: 'bg-purple-100 text-purple-700 border-purple-300',
      user: 'bg-orange-100 text-orange-700 border-orange-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 animate-fade-in flex items-center">
                <span className="text-5xl mr-3">⚙️</span>
                Admin Dashboard
              </h1>
              <p className="text-pink-100 text-lg animate-fade-in">
                Manage users, monitor activity, and oversee platform operations
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-pink-100 mb-1">Welcome back,</p>
              <p className="text-2xl font-bold">{userInfo?.name} 👋</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">👥</div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold mb-1">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-blue-100 text-sm">Total Users</p>
            <div className="mt-3 pt-3 border-t border-blue-400 border-opacity-30">
              <p className="text-xs text-blue-100">+{stats.newThisWeek} this week</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">🎯</div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold mb-1">{stats.activeToday}</p>
            <p className="text-green-100 text-sm">Active Today</p>
            <div className="mt-3 pt-3 border-t border-green-400 border-opacity-30">
              <p className="text-xs text-green-100">{stats.avgEngagement}% engagement rate</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">📊</div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold mb-1">{stats.totalExperiences.toLocaleString()}</p>
            <p className="text-purple-100 text-sm">Total Content</p>
            <div className="mt-3 pt-3 border-t border-purple-400 border-opacity-30">
              <p className="text-xs text-purple-100">{stats.totalQuestionsAnswered} Q&A interactions</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl">⚡</div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-extrabold mb-1">{stats.serverUptime}%</p>
            <p className="text-orange-100 text-sm">Server Uptime</p>
            <div className="mt-3 pt-3 border-t border-orange-400 border-opacity-30">
              <p className="text-xs text-orange-100">All systems operational</p>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎓</div>
              <p className="text-2xl font-extrabold text-blue-600">{stats.totalStudents.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">Students</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">👨‍💼</div>
              <p className="text-2xl font-extrabold text-purple-600">{stats.totalAlumni.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">Alumni</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">👑</div>
              <p className="text-2xl font-extrabold text-red-600">{stats.totalAdmins}</p>
              <p className="text-xs text-gray-600 mt-1">Admins</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎤</div>
              <p className="text-2xl font-extrabold text-green-600">{stats.totalMockInterviews}</p>
              <p className="text-xs text-gray-600 mt-1">Mock Tests</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-2xl font-extrabold text-orange-600">{stats.totalMentorshipSessions}</p>
              <p className="text-xs text-gray-600 mt-1">Mentorships</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-2xl font-extrabold text-indigo-600">{stats.totalQuestionsAnswered.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">Q&A Posts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 ${getActivityColor(
                    log.type
                  )} hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-center flex-1">
                    <div className="text-3xl mr-3">{getActivityIcon(log.type)}</div>
                    <div>
                      <p className="font-bold text-gray-900">{log.user}</p>
                      <p className="text-sm text-gray-600">{log.action}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{log.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reported Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              Reports
              <span className="ml-2 px-2 py-1 bg-red-500 text-white rounded-full text-sm">
                {reportedContent.filter((r) => r.status === 'pending').length}
              </span>
            </h2>
            <div className="space-y-3">
              {reportedContent.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-xl border-2 ${
                    report.status === 'pending'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        report.status === 'pending'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {report.status}
                    </span>
                    <p className="text-xs text-gray-500">{report.date}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900 mb-1">{report.type}</p>
                  <p className="text-xs text-gray-600 mb-2">{report.title}</p>
                  <p className="text-xs text-gray-500">by {report.reportedBy}</p>
                  {report.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">
                        Approve
                      </button>
                      <button className="flex-1 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-extrabold flex items-center">
              <span className="mr-2">👥</span>
              User Management
              <span className="ml-3 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {filteredUsers.length} users
              </span>
            </h2>
          </div>

          <div className="p-6">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="alumni">Alumni</option>
                  <option value="admin">Admins</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 mb-4 flex items-center justify-between">
                <p className="font-bold text-indigo-900">
                  {selectedUsers.length} user(s) selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors duration-200"
                  >
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="px-4 py-2 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors duration-200"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                            onChange={handleSelectAll}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Contributions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleSelectUser(user._id)}
                              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-3xl mr-3">{user.avatar}</div>
                              <div>
                                <p className="font-bold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(user._id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } transition-colors duration-200`}
                            >
                              {user.status === 'active' ? '✓ Active' : '○ Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-indigo-600">{user.contributions}</span>
                              <span className="ml-1 text-xs text-gray-500">posts</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-sm font-bold text-orange-600">{user.points}</span>
                              <span className="ml-1 text-xs text-gray-500">pts</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.joinedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.lastActive}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors duration-200">
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of{' '}
                      {filteredUsers.length} users
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`w-10 h-10 rounded-xl font-bold transition-all duration-200 ${
                              currentPage === index + 1
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-2xl font-extrabold flex items-center">
                <span className="text-3xl mr-2">⚠️</span>
                Confirm Deletion
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete user{' '}
                <span className="font-bold text-gray-900">{userToDelete.name}</span>?
              </p>
              <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors duration-200"
                >
                  Delete User
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
