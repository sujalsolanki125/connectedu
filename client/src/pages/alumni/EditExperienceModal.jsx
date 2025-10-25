import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditExperienceModal = ({ isOpen, onClose, experience, onExperienceUpdated }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    interviewDate: '',
    difficulty: 'Medium',
    result: 'Selected',
    rounds: 1,
    questions: [{ question: '', answer: '', round: '', types: [] }]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const questionTypes = [
    'Technical',
    'Behavioral',
    'System Design',
    'Coding',
    'Problem Solving',
    'Case Study',
    'HR',
    'Other'
  ];

  useEffect(() => {
    if (experience) {
      setFormData({
        companyName: experience.companyName || '',
        role: experience.role || '',
        interviewDate: experience.interviewDate ? new Date(experience.interviewDate).toISOString().split('T')[0] : '',
        difficulty: experience.difficulty || 'Medium',
        result: experience.result || 'Selected',
        rounds: experience.rounds || 1,
        questions: experience.questions && experience.questions.length > 0
          ? experience.questions
          : [{ question: '', answer: '', round: '', types: [] }]
      });
    }
  }, [experience]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rounds' ? Number(value) : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleTypeToggle = (index, type) => {
    const updatedQuestions = [...formData.questions];
    const types = updatedQuestions[index].types || [];
    
    if (types.includes(type)) {
      updatedQuestions[index].types = types.filter(t => t !== type);
    } else {
      updatedQuestions[index].types = [...types, type];
    }
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', answer: '', round: '', types: [] }]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return;
    }
    if (!formData.role.trim()) {
      setError('Role is required');
      return;
    }
    if (!formData.interviewDate) {
      setError('Interview date is required');
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1}: Question text is required`);
        return;
      }
      if (!q.answer.trim()) {
        setError(`Question ${i + 1}: Answer is required`);
        return;
      }
      if (!q.types || q.types.length === 0) {
        setError(`Question ${i + 1}: At least one question type must be selected`);
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.BACKEND_URL}/api/alumni-features/interview-experience/${experience._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      onExperienceUpdated(response.data.experience);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update experience. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Interview Experience</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Company Name and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Interview Date, Difficulty, Result, Rounds */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rounds
              </label>
              <input
                type="number"
                name="rounds"
                value={formData.rounds}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Interview Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                + Add Question
              </button>
            </div>

            {formData.questions.map((q, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Question {index + 1}</h4>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={q.question}
                      onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer/Approach <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={q.answer}
                      onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Round (Optional)
                    </label>
                    <input
                      type="text"
                      value={q.round}
                      onChange={(e) => handleQuestionChange(index, 'round', e.target.value)}
                      placeholder="e.g., Technical Round 1, HR Round"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Types <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {questionTypes.map(type => (
                        <label
                          key={type}
                          className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                            q.types && q.types.includes(type)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={q.types && q.types.includes(type)}
                            onChange={() => handleTypeToggle(index, type)}
                            className="hidden"
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExperienceModal;
