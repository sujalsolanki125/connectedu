import React, { useState } from 'react';
import axios from 'axios';

/**
 * AddExperienceModal Component
 * Modal for alumni to add new interview experience
 */
const AddExperienceModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    interviewRounds: '',
    questionTypes: [],
    questions: [{ questionText: '', studentAnswer: '', expectedAnswer: '', roundType: '' }],
    companyExpectations: '',
    tips: '',
  });

  const questionTypeOptions = ['Technical', 'HR', 'Aptitude', 'Group Discussion', 'Case Study', 'Other'];
  const roundTypeOptions = ['Technical', 'HR', 'Aptitude', 'Group Discussion', 'Case Study', 'Other'];

  const handleQuestionTypeToggle = (type) => {
    setFormData((prev) => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter((t) => t !== type)
        : [...prev.questionTypes, type],
    }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { questionText: '', studentAnswer: '', expectedAnswer: '', roundType: '' }],
    }));
  };

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index][field] = value;
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    

    // Validation
    if (!formData.companyName.trim()) {
      
      setError('Company name is required');
      return;
    }

    if (formData.questions.length === 0 || !formData.questions[0].questionText.trim()) {
      
      setError('At least one question is required');
      return;
    }

    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      
      const response = await axios.post(
        'http://localhost:5000/api/alumni-features/interview-experience',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      

      if (response.data.success) {
        alert('Interview experience added successfully!');
        if (onSuccess) onSuccess(response.data.data);
        onClose();
        // Reset form
        setFormData({
          companyName: '',
          interviewRounds: '',
          questionTypes: [],
          questions: [{ questionText: '', studentAnswer: '', expectedAnswer: '', roundType: '' }],
          companyExpectations: '',
          tips: '',
        });
      }
    } catch (err) {
      
      
      
      setError(err.response?.data?.message || 'Failed to add interview experience');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">📝 Add Interview Experience</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 mt-2">Share your interview experience to help students prepare better</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g., Google, Microsoft, Amazon"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Interview Rounds */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Number of Interview Rounds</label>
            <input
              type="number"
              value={formData.interviewRounds}
              onChange={(e) => setFormData({ ...formData, interviewRounds: e.target.value })}
              placeholder="e.g., 4"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Question Types */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Question Types (Select Multiple)</label>
            <div className="flex flex-wrap gap-2">
              {questionTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleQuestionTypeToggle(type)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.questionTypes.includes(type)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Interview Questions <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">Question {index + 1}</h4>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                      placeholder="Question asked during interview *"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <textarea
                      value={question.studentAnswer}
                      onChange={(e) => handleQuestionChange(index, 'studentAnswer', e.target.value)}
                      placeholder="Your answer (optional)"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <textarea
                      value={question.expectedAnswer}
                      onChange={(e) => handleQuestionChange(index, 'expectedAnswer', e.target.value)}
                      placeholder="Company's expected answer (optional)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <select
                      value={question.roundType}
                      onChange={(e) => handleQuestionChange(index, 'roundType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Round Type</option>
                      {roundTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Another Question
              </button>
            </div>
          </div>

          {/* Company Expectations */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Company Expectations</label>
            <textarea
              value={formData.companyExpectations}
              onChange={(e) => setFormData({ ...formData, companyExpectations: e.target.value })}
              placeholder="What the company looked for in candidates..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tips */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tips for Students</label>
            <textarea
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Share your advice and tips..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Experience'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExperienceModal;
