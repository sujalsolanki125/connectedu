import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const QAPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    question: '',
    category: 'Interview Preparation',
    tags: '',
  });

  // Mock data - Replace with actual API call
  const mockQuestions = [
    {
      _id: '1',
      title: 'How to prepare for Google system design interview?',
      question: 'I have a Google L4 interview coming up in 3 weeks. What are the best resources and strategies to prepare for the system design round? I have 2 years of experience and have never done system design interviews before.',
      category: 'Interview Preparation',
      tags: ['system-design', 'google', 'interview'],
      askedBy: { _id: 'u1', name: 'Rohan Patel', avatar: '👨‍💻', role: 'Student' },
      upvotes: ['u2', 'u3', 'u4', 'u5', 'u6'],
      downvotes: [],
      answers: [
        {
          _id: 'a1',
          answer: 'Start with Grokking the System Design Interview course on Educative. Also, watch System Design Primer videos on YouTube. Practice designing popular systems like WhatsApp, Instagram, URL shortener. Focus on trade-offs and scalability. Good luck!',
          answeredBy: { name: 'Priya Sharma', avatar: '👩‍💻', role: 'Alumni', company: 'Google' },
          upvotes: ['u1', 'u2', 'u3'],
          isAccepted: true,
          createdAt: '2024-10-18',
        },
        {
          _id: 'a2',
          answer: 'I recommend reading Designing Data-Intensive Applications by Martin Kleppmann. Also practice on Leetcode system design section. Focus on CAP theorem, load balancing, database sharding, and caching strategies.',
          answeredBy: { name: 'Arjun Kumar', avatar: '👨‍🎓', role: 'Alumni', company: 'Microsoft' },
          upvotes: ['u1', 'u2'],
          isAccepted: false,
          createdAt: '2024-10-18',
        },
      ],
      views: 234,
      isResolved: true,
      createdAt: '2024-10-17',
    },
    {
      _id: '2',
      title: 'Best resume format for software engineer freshers?',
      question: 'I am graduating in 2025 and looking to apply for SDE roles. What is the best resume format? Should I include projects or internships first? How many pages should it be?',
      category: 'Resume',
      tags: ['resume', 'freshers', 'format'],
      askedBy: { _id: 'u2', name: 'Sneha Joshi', avatar: '👩‍🎓', role: 'Student' },
      upvotes: ['u3', 'u5', 'u7'],
      downvotes: [],
      answers: [
        {
          _id: 'a3',
          answer: 'Keep it to 1 page. Use a clean format with sections: Education, Skills, Projects, Internships/Experience, Certifications. Projects should come before internships if you have strong projects. Use action verbs and quantify achievements.',
          answeredBy: { name: 'Vikram Singh', avatar: '👨‍💼', role: 'Alumni', company: 'Amazon' },
          upvotes: ['u2', 'u3'],
          isAccepted: true,
          createdAt: '2024-10-19',
        },
      ],
      views: 156,
      isResolved: true,
      createdAt: '2024-10-18',
    },
    {
      _id: '3',
      title: 'How to negotiate salary for first job?',
      question: 'I received an offer from a startup with 10 LPA package. I think I deserve more based on my skills. How do I negotiate without sounding greedy? Is it okay to negotiate for first job?',
      category: 'Career Guidance',
      tags: ['salary', 'negotiation', 'offer'],
      askedBy: { _id: 'u3', name: 'Karthik Reddy', avatar: '👨‍💻', role: 'Student' },
      upvotes: ['u1', 'u2', 'u4', 'u6'],
      downvotes: [],
      answers: [
        {
          _id: 'a4',
          answer: 'Absolutely negotiate! Research market rates first. Frame it positively: "I am excited about this role. Based on my skills in X, Y, Z and market research, I was expecting a range of 12-14 LPA. Is there flexibility?" Always be polite and show enthusiasm.',
          answeredBy: { name: 'Aisha Khan', avatar: '👩‍💻', role: 'Alumni', company: 'Flipkart' },
          upvotes: ['u3', 'u4'],
          isAccepted: false,
          createdAt: '2024-10-19',
        },
      ],
      views: 189,
      isResolved: false,
      createdAt: '2024-10-19',
    },
    {
      _id: '4',
      title: 'Understanding React Hooks - useEffect dependency array',
      question: 'I am confused about useEffect dependency array. When should I include variables in the dependency array? What happens if I leave it empty? Getting infinite loop warnings.',
      category: 'Technical',
      tags: ['react', 'hooks', 'javascript'],
      askedBy: { _id: 'u4', name: 'Meera Nair', avatar: '👩‍🔬', role: 'Student' },
      upvotes: ['u1', 'u5'],
      downvotes: [],
      answers: [
        {
          _id: 'a5',
          answer: 'Include all variables from component scope that are used inside useEffect. Empty array [] means run only once on mount. No array means run on every render. Infinite loops happen when you update state that is in dependency array without proper conditions.',
          answeredBy: { name: 'Rahul Verma', avatar: '👨‍🎓', role: 'Alumni', company: 'Google' },
          upvotes: ['u4', 'u5'],
          isAccepted: true,
          createdAt: '2024-10-19',
        },
      ],
      views: 98,
      isResolved: true,
      createdAt: '2024-10-19',
    },
    {
      _id: '5',
      title: 'Amazon Leadership Principles - how to prepare?',
      question: 'I have Amazon interview next week. How do I prepare for behavioral questions based on Leadership Principles? Need examples of STAR format answers.',
      category: 'Company Specific',
      tags: ['amazon', 'behavioral', 'leadership-principles'],
      askedBy: { _id: 'u5', name: 'Divya Singh', avatar: '👩‍💼', role: 'Student' },
      upvotes: ['u2', 'u3', 'u6', 'u7'],
      downvotes: [],
      answers: [
        {
          _id: 'a6',
          answer: 'Study all 16 Leadership Principles. Prepare 2-3 STAR stories for each. Focus on Customer Obsession, Ownership, Bias for Action, Deliver Results. Be specific with metrics. Example: "I reduced API response time by 40% by implementing caching, impacting 10K daily users."',
          answeredBy: { name: 'Priya Sharma', avatar: '👩‍💻', role: 'Alumni', company: 'Amazon' },
          upvotes: ['u5', 'u6'],
          isAccepted: true,
          createdAt: '2024-10-20',
        },
      ],
      views: 145,
      isResolved: true,
      createdAt: '2024-10-20',
    },
    {
      _id: '6',
      title: 'Time complexity of nested loops - need clarification',
      question: 'If I have a nested loop where outer loop runs n times and inner loop runs m times, is the complexity O(n*m) or O(n^2)? What if m is dependent on n?',
      category: 'Aptitude',
      tags: ['dsa', 'time-complexity', 'algorithms'],
      askedBy: { _id: 'u6', name: 'Amit Gupta', avatar: '👨‍🔧', role: 'Student' },
      upvotes: ['u1', 'u4'],
      downvotes: [],
      answers: [],
      views: 67,
      isResolved: false,
      createdAt: '2024-10-20',
    },
    {
      _id: '7',
      title: 'How to improve communication skills for interviews?',
      question: 'I get nervous during interviews and fumble while explaining my projects. How can I improve my communication and presentation skills? Any tips or courses?',
      category: 'Soft Skills',
      tags: ['communication', 'interview-tips', 'soft-skills'],
      askedBy: { _id: 'u7', name: 'Pooja Sharma', avatar: '👩‍🎓', role: 'Student' },
      upvotes: ['u2', 'u3'],
      downvotes: [],
      answers: [
        {
          _id: 'a7',
          answer: 'Practice mock interviews with friends. Record yourself explaining projects. Join Toastmasters club. Use the STAR method for structuring answers. Prepare elevator pitch for each project. Practice makes perfect!',
          answeredBy: { name: 'Vikram Singh', avatar: '👨‍💼', role: 'Alumni', company: 'Microsoft' },
          upvotes: ['u7'],
          isAccepted: false,
          createdAt: '2024-10-20',
        },
      ],
      views: 89,
      isResolved: false,
      createdAt: '2024-10-20',
    },
    {
      _id: '8',
      title: 'Difference between PUT and PATCH in REST APIs?',
      question: 'Can someone explain the difference between PUT and PATCH HTTP methods? When should I use which one? Are there any best practices?',
      category: 'Technical',
      tags: ['rest-api', 'http', 'backend'],
      askedBy: { _id: 'u8', name: 'Sanjay Kumar', avatar: '👨‍💻', role: 'Student' },
      upvotes: ['u1', 'u3', 'u5'],
      downvotes: [],
      answers: [
        {
          _id: 'a8',
          answer: 'PUT replaces entire resource, PATCH updates partial resource. Use PUT when sending complete object, PATCH for updating specific fields. Example: PUT /user/1 with full user object vs PATCH /user/1 with {email: "new@email.com"}',
          answeredBy: { name: 'Arjun Kumar', avatar: '👨‍🎓', role: 'Alumni', company: 'Google' },
          upvotes: ['u8', 'u1'],
          isAccepted: true,
          createdAt: '2024-10-20',
        },
      ],
      views: 112,
      isResolved: true,
      createdAt: '2024-10-20',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📚', color: 'gray' },
    { value: 'Interview Preparation', label: 'Interview Prep', icon: '📝', color: 'blue' },
    { value: 'Resume', label: 'Resume', icon: '📄', color: 'green' },
    { value: 'Career Guidance', label: 'Career Guidance', icon: '🎯', color: 'purple' },
    { value: 'Technical', label: 'Technical', icon: '💻', color: 'red' },
    { value: 'Company Specific', label: 'Company Specific', icon: '🏢', color: 'orange' },
    { value: 'Aptitude', label: 'Aptitude', icon: '🧮', color: 'yellow' },
    { value: 'Soft Skills', label: 'Soft Skills', icon: '💬', color: 'pink' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestions(mockQuestions);
      setFilteredQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus, sortBy, searchTerm, questions]);

  const filterQuestions = () => {
    let filtered = [...questions];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus === 'resolved') {
      filtered = filtered.filter((q) => q.isResolved);
    } else if (selectedStatus === 'unanswered') {
      filtered = filtered.filter((q) => q.answers.length === 0);
    } else if (selectedStatus === 'unresolved') {
      filtered = filtered.filter((q) => !q.isResolved);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes.length - a.upvotes.length;
        case 'views':
          return b.views - a.views;
        case 'answers':
          return b.answers.length - a.answers.length;
        case 'recent':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredQuestions(filtered);
  };

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.color : 'gray';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.icon : '📚';
  };

  const handleUpvote = (questionId) => {
    const updated = questions.map((q) => {
      if (q._id === questionId) {
        const hasUpvoted = q.upvotes.includes(userInfo?._id || 'current-user');
        return {
          ...q,
          upvotes: hasUpvoted
            ? q.upvotes.filter((id) => id !== (userInfo?._id || 'current-user'))
            : [...q.upvotes, userInfo?._id || 'current-user'],
        };
      }
      return q;
    });
    setQuestions(updated);
  };

  const handleAskQuestion = () => {
    if (!newQuestion.title || !newQuestion.question) {
      alert('Please fill in title and question');
      return;
    }

    const question = {
      _id: Date.now().toString(),
      title: newQuestion.title,
      question: newQuestion.question,
      category: newQuestion.category,
      tags: newQuestion.tags.split(',').map((t) => t.trim()).filter((t) => t),
      askedBy: {
        _id: userInfo?._id || 'current-user',
        name: userInfo?.name || 'You',
        avatar: userInfo?.avatar || '👤',
        role: userInfo?.role || 'Student',
      },
      upvotes: [],
      downvotes: [],
      answers: [],
      views: 0,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };

    setQuestions([question, ...questions]);
    setNewQuestion({ title: '', question: '', category: 'Interview Preparation', tags: '' });
    setShowAskModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold mb-2 animate-fade-in flex items-center">
                <span className="text-5xl mr-3">💬</span>
                Q&A Community
              </h1>
              <p className="text-purple-100 text-lg animate-fade-in">
                Ask questions, share knowledge, and grow together
              </p>
            </div>
            <button
              onClick={() => setShowAskModal(true)}
              className="mt-4 md:mt-0 px-6 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ask Question
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Search Questions</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-blue-600">{questions.length}</p>
                <p className="text-xs text-gray-600">Questions</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-green-600">
                  {questions.filter((q) => q.isResolved).length}
                </p>
                <p className="text-xs text-gray-600">Resolved</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-orange-600">
                  {questions.filter((q) => q.answers.length === 0).length}
                </p>
                <p className="text-xs text-gray-600">Unanswered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center ${
                  selectedCategory === cat.value
                    ? `bg-${cat.color}-500 text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  selectedCategory === cat.value
                    ? {
                        background:
                          cat.color === 'blue'
                            ? 'linear-gradient(to right, #3b82f6, #6366f1)'
                            : cat.color === 'green'
                            ? 'linear-gradient(to right, #10b981, #059669)'
                            : cat.color === 'purple'
                            ? 'linear-gradient(to right, #8b5cf6, #7c3aed)'
                            : cat.color === 'red'
                            ? 'linear-gradient(to right, #ef4444, #dc2626)'
                            : cat.color === 'orange'
                            ? 'linear-gradient(to right, #f97316, #ea580c)'
                            : cat.color === 'yellow'
                            ? 'linear-gradient(to right, #eab308, #ca8a04)'
                            : cat.color === 'pink'
                            ? 'linear-gradient(to right, #ec4899, #db2777)'
                            : 'linear-gradient(to right, #6b7280, #4b5563)',
                      }
                    : {}
                }
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status and Sort Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Questions', icon: '📚' },
                  { value: 'unanswered', label: 'Unanswered', icon: '❓' },
                  { value: 'unresolved', label: 'Unresolved', icon: '⏳' },
                  { value: 'resolved', label: 'Resolved', icon: '✅' },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center ${
                      selectedStatus === status.value
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{status.icon}</span>
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'recent', label: 'Most Recent', icon: '🕐' },
                  { value: 'popular', label: 'Most Popular', icon: '🔥' },
                  { value: 'views', label: 'Most Viewed', icon: '👁️' },
                  { value: 'answers', label: 'Most Answers', icon: '💬' },
                ].map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => setSortBy(sort.value)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center ${
                      sortBy === sort.value
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1">{sort.icon}</span>
                    {sort.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing <span className="font-bold text-indigo-600">{filteredQuestions.length}</span> of{' '}
              <span className="font-bold">{questions.length}</span> questions
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or be the first to ask!</p>
            <button
              onClick={() => setShowAskModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              Ask the First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, index) => (
              <div
                key={question._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex">
                  {/* Vote Section */}
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 flex flex-col items-center justify-start min-w-[100px] border-r border-gray-200">
                    <button
                      onClick={() => handleUpvote(question._id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 mb-2 ${
                        question.upvotes.includes(userInfo?._id || 'current-user')
                          ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <span className="text-2xl font-extrabold text-gray-900 mb-4">{question.upvotes.length}</span>

                    <div className="flex flex-col gap-3 text-center">
                      <div className="bg-white border border-blue-300 rounded-lg p-2">
                        <div className="text-blue-600 text-xl mb-1">💬</div>
                        <p className="text-lg font-bold text-blue-600">{question.answers.length}</p>
                        <p className="text-xs text-gray-500">answers</p>
                      </div>
                      <div className="bg-white border border-green-300 rounded-lg p-2">
                        <div className="text-green-600 text-xl mb-1">👁️</div>
                        <p className="text-lg font-bold text-green-600">{question.views}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link to={`/qa/${question._id}`} className="block group">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 mb-2">
                            {question.title}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold text-white`}
                            style={{
                              background:
                                getCategoryColor(question.category) === 'blue'
                                  ? 'linear-gradient(to right, #3b82f6, #6366f1)'
                                  : getCategoryColor(question.category) === 'green'
                                  ? 'linear-gradient(to right, #10b981, #059669)'
                                  : getCategoryColor(question.category) === 'purple'
                                  ? 'linear-gradient(to right, #8b5cf6, #7c3aed)'
                                  : getCategoryColor(question.category) === 'red'
                                  ? 'linear-gradient(to right, #ef4444, #dc2626)'
                                  : getCategoryColor(question.category) === 'orange'
                                  ? 'linear-gradient(to right, #f97316, #ea580c)'
                                  : getCategoryColor(question.category) === 'yellow'
                                  ? 'linear-gradient(to right, #eab308, #ca8a04)'
                                  : getCategoryColor(question.category) === 'pink'
                                  ? 'linear-gradient(to right, #ec4899, #db2777)'
                                  : 'linear-gradient(to right, #6b7280, #4b5563)',
                            }}
                          >
                            {getCategoryIcon(question.category)} {question.category}
                          </span>
                          {question.isResolved && (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Resolved
                            </span>
                          )}
                          {question.answers.length === 0 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg text-xs font-bold">
                              ❓ Needs Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-2">{question.question}</p>

                    {/* Tags */}
                    {question.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Accepted Answer Preview */}
                    {question.answers.length > 0 && question.isResolved && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-xs font-bold text-green-800 mb-1">✓ Accepted Answer</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {question.answers.find((a) => a.isAccepted)?.answer}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              by {question.answers.find((a) => a.isAccepted)?.answeredBy.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <div className="text-2xl mr-2">{question.askedBy.avatar}</div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Asked by{' '}
                            <span className="font-bold text-gray-900">{question.askedBy.name}</span>
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {question.askedBy.role}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(question.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/qa/${question._id}`}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center"
                      >
                        View Discussion
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold mb-1">Ask a Question</h2>
                  <p className="text-purple-100">Get help from the community</p>
                </div>
                <button
                  onClick={() => setShowAskModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Question Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., How to prepare for Google interviews?"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Detailed Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide as much detail as possible to help others understand your question..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., system-design, google, interview"
                    value={newQuestion.tags}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add up to 5 tags to help others find your question
                  </p>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="text-sm font-bold text-blue-900 mb-2">💡 Tips for asking good questions:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific and clear in your title</li>
                    <li>• Provide context and background information</li>
                    <li>• Explain what you have tried so far</li>
                    <li>• Use proper formatting and grammar</li>
                    <li>• Add relevant tags to reach the right audience</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAskQuestion}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
                  >
                    Post Question
                  </button>
                  <button
                    onClick={() => setShowAskModal(false)}
                    className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAPage;
