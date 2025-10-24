import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('students');

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Alumni Profiles & Interview Experiences',
      description: 'Browse verified alumni profiles and read authentic interview experiences from top companies',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Exclusive Learning Resources',
      description: 'Access alumni-shared study materials, placement guides, and preparation strategies curated from top industry professionals.',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      title: 'Star Rating & Leaderboard System',
      description: 'Rate mentors, earn recognition, and climb the leaderboard through active participation',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Mentorship & Career Guidance',
      description: 'Find the perfect mentor and send direct requests for personalized guidance, mock interviews, and career advice.',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Verified Alumni Network',
      description: 'Connect with verified alumni from your institution working in top companies worldwide',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure Database & Easy Access',
      description: 'Your data is protected with enterprise-grade security and accessible anytime, anywhere',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Interview Experiences', icon: '�' },
    { value: '500+', label: 'Alumni Mentors', icon: '👥' },
    { value: '2000+', label: 'Active Students', icon: '🎓' },
    { value: '100+', label: 'Companies Covered', icon: '🏢' },
  ];

  const studentBenefits = [
    'Access real interview experiences from alumni working in top companies',
    'Book workshop and mentorship session with experienced alumni',
    'Get career guidance and company-specific preparation tips',
    'Build confidence and improve placement readiness',
  ];

  const alumniBenefits = [
    'Give back to your college community through mentorship',
    'Share your interview experiences to guide juniors',
    'Gain recognition through star ratings and leaderboard positions',
    'Build your professional brand as a mentor and influencer',
  ];

  const collegeBenefits = [
    'Strengthen alumni-student relationships and improve placement results',
    'Get verified alumni data organized in one platform',
    'Track student engagement and mentorship activities',
    'Enhance institutional reputation by fostering a mentorship culture',
  ];

  const testimonials = [
    {
      quote: "Through ConnectEDu, I connected with an alumnus from Google who guided me through my interviews — I got placed confidently!",
      author: "Rahul Kumar",
      role: "Final Year Student",
      company: "Placed at Amazon",
      avatar: "RK"
    },
    {
      quote: "Mentoring students through ConnectEDu has been incredibly rewarding. Seeing them succeed makes all the difference!",
      author: "Priya Sharma",
      role: "Software Engineer",
      company: "Microsoft",
      avatar: "PS"
    },
    {
      quote: "ConnectEDu has transformed our placement preparation process. The alumni engagement has never been better!",
      author: "Dr. Rajesh Gupta",
      role: "Placement Officer",
      company: "IIT Delhi",
      avatar: "RG"
    }
  ];

  const howItWorksSteps = [
    {
      step: '1',
      title: 'Register & Create Profile',
      description: 'Join the network, select your college, and set up your interests to get started.',
      icon: '📄',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: '2',
      title: 'Browse & Discover',
      description: 'Explore verified alumni profiles, read real interview experiences, and find the perfect mentor.',
      icon: '🔍',
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: '3',
      title: 'Book a Session',
      description: 'Schedule a 1-on-1 mock interview, resume review, or a mentorship call directly with an alumnus.',
      icon: '📅',
      color: 'from-green-500 to-teal-500'
    },
    {
      step: '4',
      title: 'Get Feedback & Rate',
      description: 'Receive valuable, constructive feedback from your mentor and give them a rating for their help.',
      icon: '⭐',
      color: 'from-orange-500 to-red-500'
    },
    {
      step: '5',
      title: 'Grow Together',
      description: 'Your contributions update the leaderboard, growing your credibility and helping the entire community.',
      icon: '📈',
      color: 'from-yellow-500 to-amber-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 text-white overflow-hidden pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              ConnectEDu
              <span className="block mt-4 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Connect. Learn. Succeed.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed px-4">
              ConnectEDu is a platform that connects students with alumni mentors who share real interview experiences, company insights, personal mentorship and career guidance to help students succeed in placements.
            </p>

            {!userInfo && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link
                  to="/register?role=student"
                  className="group relative px-8 py-4 bg-white text-primary-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-glow-lg transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  🎓 Join as Student
                </Link>
                
                <Link
                  to="/register?role=alumni"
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  👨‍🎓 Join as Alumni
                </Link>

                <Link
                  to="/mentorship"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  🔍 Explore Mentors
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

      {/* About ConnectEd Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              About ConnectEDu
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Bridging the gap between students and alumni through meaningful mentorship
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Goal */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Goal</h3>
              <p className="text-gray-700 leading-relaxed">
                To bridge the gap between students and alumni through meaningful mentorship and practical interview preparation.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To create a connected learning ecosystem where alumni guide students toward successful career paths.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To empower students by providing authentic interview insights, personalized mentorship, and real-world guidance through alumni engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ConnectEDu brings value to students, alumni, and institutions alike
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
              For Students
            </button>
            <button
              onClick={() => setActiveTab('alumni')}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
                activeTab === 'alumni'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              For Alumni
            </button>
            <button
              onClick={() => setActiveTab('colleges')}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 ${
                activeTab === 'colleges'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              For Colleges
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'students' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-12 h-12 mr-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  Benefits for Students
                </h3>
                <ul className="space-y-4">
                  {studentBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-7 h-7 mr-4 mt-0.5 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-lg text-gray-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'alumni' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-12 h-12 mr-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Benefits for Alumni
                </h3>
                <ul className="space-y-4">
                  {alumniBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-7 h-7 mr-4 mt-0.5 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-lg text-gray-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'colleges' && (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-12 h-12 mr-4 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  Benefits for Colleges
                </h3>
                <ul className="space-y-4">
                  {collegeBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-7 h-7 mr-4 mt-0.5 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-lg text-gray-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed in your placement journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-gray-100"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Animated gradient border */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                
                <div className="relative p-8">
                  {/* Icon container with gradient background */}
                  <div className={`relative w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                    {/* Pulse effect on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} animate-pulse opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  </div>
                  
                  {/* Title with gradient text */}
                  <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </p>

                  {/* Decorative element at bottom */}
                  <div className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-500`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in 5 simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transform -translate-y-1/2 opacity-20"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 transform hover:-translate-y-2">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {step.step}
                    </div>
                    <div className="text-5xl text-center mb-4">{step.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {!userInfo && (
        <section className="py-20 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Join ConnectEDu Today
            </h2>
            <p className="text-2xl text-purple-100 mb-10 font-medium">
              Where experience meets ambition
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register?role=student"
                className="px-10 py-5 bg-white text-primary-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-glow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center"
              >
                Register as Student
              </Link>
              <Link
                to="/register?role=alumni"
                className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-glow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center"
              >
                Register as Alumni
              </Link>
              <Link
                to="/mentorship"
                className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center"
              >
                Explore Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg">
                  <span className="text-2xl">🎓</span>
                </div>
                <span className="text-xl font-bold">ConnectEDu</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Bridging the gap between students and alumni through meaningful mentorship and career guidance.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/interviews" className="text-gray-400 hover:text-white transition-colors">Interview Experiences</Link></li>
                <li><Link to="/mentorship" className="text-gray-400 hover:text-white transition-colors">Find Mentors</Link></li>
                <li><Link to="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400 mb-4">
                Have questions? Get in touch with us.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </Link>
              
              {/* Social Media */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span>in</span>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                    <span>📷</span>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                    <span>🐦</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} ConnectEDu. All rights reserved. | Made by Sujalkumar Solanki
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
