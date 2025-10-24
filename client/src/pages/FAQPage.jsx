import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'General',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          question: 'What is ConnectEDu?',
          answer: 'ConnectEDu is a digital platform that connects current college students with their verified alumni for mentorship, interview preparation, and career guidance. It helps students access authentic interview experiences and real-time industry insights directly from professionals who once studied in the same college.'
        },
        {
          question: 'Who can use ConnectEDu?',
          answer: 'ConnectEDu is designed for two main user groups:\n\n• College Students: Those pursuing degrees and preparing for placements.\n• Alumni: Graduates who are working in industries and want to share their experiences or mentor juniors.\n\nEach user has specific access levels and features.'
        },
        {
          question: 'What makes ConnectEDu different from LinkedIn?',
          answer: 'Unlike LinkedIn, ConnectEDu is college-centric and mentorship-focused. It directly bridges the gap between students and their verified alumni, providing structured mentorship, mock interviews, and verified interview questions.'
        },
        {
          question: 'Is ConnectEDu available on mobile devices?',
          answer: 'Yes, the platform is mobile-responsive and accessible via any browser. A dedicated mobile app is also planned for future versions.'
        }
      ]
    },
    {
      category: 'For Students',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          question: 'How do students find and connect with alumni?',
          answer: 'Students can search alumni by college name, company name, or alumni name. Once they find a suitable mentor, they can send a mentorship request. The alumni will receive a notification to accept or reject the request.'
        },
        {
          question: 'What happens when an alumni accepts a mentorship request?',
          answer: 'When an alumni accepts a request, the student gets a notification, and the alumni\'s chosen contact method (like WhatsApp, Telegram, or Email) becomes visible. The student can then communicate for mentorship, guidance, or mock interviews.'
        },
        {
          question: 'Can students access all features of alumni profiles?',
          answer: 'Students can view basic alumni details, interview experiences, and ratings. However, contact information and mentorship interaction options are unlocked only after the alumni accepts a mentorship request.'
        },
        {
          question: 'What is the benefit for students?',
          answer: 'Students gain firsthand interview insights, personalized mentorship, and direct guidance from professionals in their dream companies — boosting their placement readiness and confidence.'
        }
      ]
    },
    {
      category: 'For Alumni',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          question: 'How are alumni verified on ConnectEDu?',
          answer: 'Alumni profiles go through a verification process that includes checking their college details, email verification, and current employment information to ensure only authentic mentors are available on the platform.'
        },
        {
          question: 'What kind of information is available in alumni profiles?',
          answer: 'Each alumni profile includes:\n• College and course details\n• Current company and job role\n• Interview experiences (company-wise questions and answers)\n• Mentorship availability\n• Ratings and reviews from students'
        },
        {
          question: 'What is the benefit for alumni?',
          answer: 'Alumni earn recognition through ratings and leaderboard ranks. They can gain networking opportunities, mentoring experience, and, if they choose, monetary rewards through paid sessions — while giving back to their institution.'
        }
      ]
    },
    {
      category: 'Mentorship & Sessions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500',
      questions: [
        {
          question: 'Is there a fee for mentorship sessions?',
          answer: 'It depends on the alumni. ConnectEDu allows both free and paid mentorship sessions. Alumni can set their own charges for personal mentoring, mock interviews, or workshops.'
        },
        {
          question: 'How does the mock interview feature work?',
          answer: 'Alumni can schedule mock interviews (free or paid). Students book a slot, attend the session, and receive feedback and improvement tips. This helps students practice real-life interview scenarios.'
        },
        {
          question: 'Can students and alumni communicate directly on the platform?',
          answer: 'Yes — once mentorship is accepted, students can chat or contact alumni through the shared contact mode. Future updates will include an in-app chat and scheduling feature.'
        }
      ]
    },
    {
      category: 'Leaderboard & Ratings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-500',
      questions: [
        {
          question: 'How does the star rating and leaderboard system work?',
          answer: 'Students rate alumni after mentorship sessions. Points are given for activities like conducting sessions, uploading interview experiences, or hosting workshops. The leaderboard updates dynamically to rank alumni based on points, activity, and average ratings — creating healthy competition.'
        },
        {
          question: 'How is ranking calculated for alumni on the leaderboard?',
          answer: 'Ranks are determined using a dynamic algorithm based on:\n• Points from mentorships, interviews, and workshops\n• Average student rating\n• Weekly activity/streak\n\nThe system auto-updates ranks and levels (Bronze → Silver → Gold → Platinum → Diamond).'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'from-red-500 to-pink-500',
      questions: [
        {
          question: 'How does ConnectEDu ensure data security?',
          answer: 'All user data (profiles, messages, sessions, and ratings) is stored securely in MongoDB with authentication layers. The platform uses encrypted communication to protect personal information and contact details.'
        }
      ]
    },
    {
      category: 'For Colleges',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-500',
      questions: [
        {
          question: 'How can colleges benefit from ConnectEDu?',
          answer: 'Training and Placement Cells (TPC) can track alumni engagement, identify active mentors, and strengthen campus-corporate relationships. This helps colleges improve placement outcomes and alumni relations.'
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6 backdrop-blur-lg">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-8">
            Find answers to common questions about ConnectEDu
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {searchQuery === '' && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {faqs.map((category, index) => (
                <a
                  key={index}
                  href={`#category-${index}`}
                  className={`group p-6 bg-gradient-to-br ${category.color} rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
                >
                  <div className="flex flex-col items-center text-center text-white">
                    <div className="w-12 h-12 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-lg">{category.category}</h3>
                    <p className="text-sm opacity-90 mt-1">{category.questions.length} questions</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Accordions */}
        <div className="space-y-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex} id={`category-${categoryIndex}`} className="scroll-mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg`}>
                    {category.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{category.category}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
                    return (
                      <div
                        key={questionIndex}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                      >
                        <button
                          onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                              <span className="text-white font-bold text-sm">Q</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {faq.question}
                            </h3>
                          </div>
                          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          } overflow-hidden`}
                        >
                          <div className="px-6 pb-6 pl-20">
                            <div className={`p-6 bg-gradient-to-br ${category.color} bg-opacity-5 rounded-xl border-l-4 border-gradient-to-b ${category.color}`}>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try searching with different keywords</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FAQPage;
