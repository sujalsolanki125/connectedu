import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const features = [
    {
      icon: '📘',
      title: 'Interview Experiences',
      description: 'Read and share real interview questions, answers, and feedback from alumni placed in various companies',
      link: '/interview-experiences',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '💼',
      title: 'Company Insights',
      description: 'Get detailed information about company expectations, recruitment patterns, and role-specific requirements',
      link: '/company-insights',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '🎤',
      title: 'Mock Interview Sessions',
      description: 'Schedule live and recorded mock interviews with experienced alumni and mentors for skill improvement',
      link: '/mock-interviews',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: '🧠',
      title: 'Mentorship Guidance',
      description: 'Get personalized career guidance, preparation strategies, and tips from industry professionals',
      link: '/mentorship',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: '⭐',
      title: 'Q&A Community',
      description: 'Ask questions, get answers from alumni, rate helpful content, and engage with the community',
      link: '/qa',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: '📊',
      title: 'Placement Resources',
      description: 'Access resume templates, aptitude practice, soft skill videos, and preparation roadmaps',
      link: '/resources',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: '🏆',
      title: 'Leaderboard & Recognition',
      description: 'Track contributions, earn badges, compete on rankings, and celebrate community achievements',
      link: '/leaderboard',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Interview  Experiences', icon: '📝' },
    { value: '500+', label: 'Alumni Mentors', icon: '👥' },
    { value: '2000+', label: 'Active Students', icon: '🎓' },
    { value: '100+', label: 'Companies Covered', icon: '🏢' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Alumni Connect
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Your Career Growth Partner
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed">
              A comprehensive platform for career growth and placement preparation
            </p>

            {!userInfo && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link
                  to="/register"
                  className="group relative px-8 py-4 bg-white text-primary-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-glow-lg transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Get Started
                </Link>
                
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300 animate-fade-in"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to ace your placements and build a successful career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative p-8">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 text-4xl bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Explore
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!userInfo && (
        <section className="py-20 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-10">
              Join thousands of students and alumni connecting for career success
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-5 bg-white text-primary-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-glow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
            >
              Create Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
