import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BookOpen, Calendar, Trophy, MessageSquare } from 'lucide-react';
import ExperienceList from './ExperienceList';
import MyWorkshops from './MyWorkshops';
import AchievementsDashboard from './AchievementsDashboard';
import FeedbackList from './FeedbackList';
import Footer from '../../components/Footer';

// Avatar component for displaying alumni profile pictures
const Avatar = ({ src, name, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '👨‍💼';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Alumni'}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center font-bold border-2 border-gray-200 shadow-md`}
    >
      {initials}
    </div>
  );
};

const AlumniDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('experiences');
  const [alumniProfile, setAlumniProfile] = useState(null);

  // Fetch alumni profile on mount
  useEffect(() => {
    const fetchAlumniProfile = async () => {
      try {
        const token = userInfo?.token;
        if (!token) return;

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get('http://localhost:5000/api/profile/me', config);
        setAlumniProfile(response.data);
      } catch (error) {
        // Error handled silently
      }
    };

    fetchAlumniProfile();
  }, [userInfo]);

  const tabs = [
    { id: 'experiences', label: 'Interview Experiences', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'workshops', label: 'My Workshops', icon: <Calendar className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-5 h-5" /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'experiences':
        return <ExperienceList />;
      case 'workshops':
        return <MyWorkshops />;
      case 'achievements':
        return <AchievementsDashboard />;
      case 'feedback':
        return <FeedbackList />;
      default:
        return <ExperienceList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Alumni Avatar */}
              <Avatar 
                src={alumniProfile?.avatar} 
                name={userInfo?.name} 
                size="lg" 
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Alumni Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {userInfo?.name?.split(' ')[0] || 'Alumni'}! Share your experiences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AlumniDashboard;
