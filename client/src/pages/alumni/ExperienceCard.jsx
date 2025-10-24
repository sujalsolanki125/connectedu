import React, { useState } from 'react';
import EditExperienceModal from './EditExperienceModal';

/**
 * ExperienceCard Component
 * Displays a single interview experience with edit/delete options
 */
const ExperienceCard = ({ experience, onDelete, onUpdate, showActions = false }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{experience.companyName}</h3>
              {experience.interviewRounds && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {experience.interviewRounds} Rounds
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">Posted on {formatDate(experience.postedAt)}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg">
              <span className="text-xl">👍</span>
              <span className="font-semibold text-gray-700">{experience.helpfulCount || 0}</span>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(experience._id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Question Types */}
        {experience.questionTypes && experience.questionTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {experience.questionTypes.map((type, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4 mb-4">
          <h4 className="font-semibold text-gray-900">Interview Questions:</h4>
          {experience.questions && experience.questions.slice(0, expanded ? undefined : 2).map((q, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="font-semibold text-blue-600">Q{index + 1}:</span>
                <p className="flex-1 text-gray-900">{q.questionText}</p>
                {q.roundType && (
                  <span className="px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-300">
                    {q.roundType}
                  </span>
                )}
              </div>
              {q.studentAnswer && (
                <div className="mt-2 pl-6">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">My Answer:</span> {q.studentAnswer}
                  </p>
                </div>
              )}
              {q.expectedAnswer && (
                <div className="mt-2 pl-6">
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Expected:</span> {q.expectedAnswer}
                  </p>
                </div>
              )}
            </div>
          ))}
          {experience.questions && experience.questions.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              {expanded ? 'Show Less' : `Show ${experience.questions.length - 2} More Questions`}
            </button>
          )}
        </div>

        {/* Company Expectations */}
        {experience.companyExpectations && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">Company Expectations:</h4>
            <p className="text-gray-700">{experience.companyExpectations}</p>
          </div>
        )}

        {/* Tips */}
        {experience.tips && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Tips:</h4>
            <p className="text-yellow-800">{experience.tips}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditExperienceModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          experience={experience}
          onSuccess={onUpdate}
        />
      )}
    </>
  );
};

export default ExperienceCard;
