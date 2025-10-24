import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Building, Briefcase } from 'lucide-react';

const ExperienceDetailModal = ({ isOpen, onClose, experience }) => {
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  if (!isOpen || !experience) return null;

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getDifficultyBadgeColor = (difficulty) => {
    const colors = {
      Easy: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getResultBadgeColor = (result) => {
    const colors = {
      Selected: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Pending: 'bg-blue-100 text-blue-800'
    };
    return colors[result] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const groupQuestionsByRound = () => {
    const grouped = {};
    experience.questions.forEach((q, index) => {
      const round = q.round || 'General';
      if (!grouped[round]) {
        grouped[round] = [];
      }
      grouped[round].push({ ...q, index });
    });
    return grouped;
  };

  const groupedQuestions = groupQuestionsByRound();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Building className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">{experience.companyName}</h2>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <Briefcase className="w-5 h-5" />
                <span className="text-lg">{experience.role}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyBadgeColor(experience.difficulty)}`}>
                  {experience.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultBadgeColor(experience.result)}`}>
                  {experience.result}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {experience.rounds} {experience.rounds === 1 ? 'Round' : 'Rounds'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold ml-4"
            >
              ×
            </button>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">Interview Date:</span> {formatDate(experience.interviewDate)}
            </div>
            <div>
              <span className="font-medium">Total Questions:</span> {experience.questions.length}
            </div>
            <div>
              <span className="font-medium">Helpful Votes:</span> {experience.helpfulCount}
            </div>
          </div>
        </div>

        {/* Questions by Round */}
        <div className="p-6">
          {Object.entries(groupedQuestions).map(([round, questions]) => (
            <div key={round} className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                {round}
              </h3>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.index}
                    className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Question Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleQuestion(q.index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div className="flex items-start space-x-2 mb-2">
                            <span className="font-semibold text-gray-800 mt-1">Q{q.index + 1}:</span>
                            <p className="text-gray-800 font-medium">{q.question}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-6">
                            {q.types.map((type, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          {expandedQuestions.includes(q.index) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Answer (Expandable) */}
                    {expandedQuestions.includes(q.index) && (
                      <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                        <div className="pt-4">
                          <p className="font-semibold text-gray-700 mb-2">Answer / Approach:</p>
                          <div className="text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200">
                            {q.answer}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Tips for Using This Information:</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Use these questions to prepare for similar roles</li>
              <li>Practice your answers and approaches</li>
              <li>Understand the interview pattern and difficulty level</li>
              <li>Note the question types to focus your preparation</li>
              <li>Consider the number of rounds to plan your preparation strategy</li>
            </ul>
          </div>

          {/* Alumni Credit */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Shared by Alumni ID: {experience.alumniId}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetailModal;
