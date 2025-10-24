import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!userInfo) return '/';
    switch (userInfo.role) {
      case 'student':
        return '/student-dashboard';
      case 'alumni':
        return '/alumni-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-2xl">🎓</span>
            </div>
            <span className="text-white text-xl font-bold hidden sm:block">
              Alumni Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {userInfo ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
                >
                  Dashboard
                </Link>
                {/* Hide Interviews link for alumni - it's in their dashboard */}
                {userInfo.role !== 'alumni' && (
                  <Link
                    to="/interview-experiences"
                    className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
                  >
                    Interviews
                  </Link>
                )}
                <Link
                  to="/company-insights"
                  className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
                >
                  Companies
                </Link>
                <Link
                  to="/mentorship"
                  className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
                >
                  Mentorship
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
                >
                  🏆 Leaderboard
                </Link>
                
                <div className="flex items-center space-x-3 pl-4 border-l border-white border-opacity-30">
                  <div className="text-white">
                    <div className="text-sm font-medium">{userInfo.name}</div>
                    <div className="text-xs text-purple-200 capitalize">{userInfo.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-white text-primary-600 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-700 border-t border-white border-opacity-20">
          <div className="px-4 py-3 space-y-2">
            {userInfo ? (
              <>
                <div className="px-4 py-2 text-white border-b border-white border-opacity-20 mb-2">
                  <div className="font-medium">{userInfo.name}</div>
                  <div className="text-sm text-purple-200 capitalize">{userInfo.role}</div>
                </div>
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {/* Hide Interviews link for alumni - it's in their dashboard */}
                {userInfo.role !== 'alumni' && (
                  <Link
                    to="/interview-experiences"
                    className="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Interviews
                  </Link>
                )}
                <Link
                  to="/company-insights"
                  className="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Companies
                </Link>
                <Link
                  to="/mentorship"
                  className="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Mentorship
                </Link>
                <Link
                  to="/leaderboard"
                  className="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  🏆 Leaderboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-white text-primary-600 rounded-lg font-bold text-center hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
