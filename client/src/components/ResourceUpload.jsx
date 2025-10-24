import React, { useState, useRef } from 'react';
import { uploadResource, deleteResource } from '../services/uploadService';

const ResourceUpload = ({ resources = [], onUploadSuccess, onDeleteSuccess }) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const categories = [
    'General',
    'Interview Preparation',
    'Resume Templates',
    'Technical Resources',
    'Career Guidance',
    'Project Ideas',
    'Study Materials',
    'Other',
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a PDF, ZIP, DOC, DOCX, PPT, or PPTX file');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await uploadResource(selectedFile, formData);
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.resource);
      }

      // Reset form
      setFormData({ title: '', description: '', category: 'General' });
      setSelectedFile(null);
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Resource uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await deleteResource(resourceId);
      
      // Call delete callback
      if (onDeleteSuccess) {
        onDeleteSuccess(resourceId);
      }

      alert('Resource deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toUpperCase();
    switch (type) {
      case 'PDF':
        return '📄';
      case 'ZIP':
        return '📦';
      case 'DOC':
      case 'DOCX':
        return '📝';
      case 'PPT':
      case 'PPTX':
        return '📊';
      default:
        return '📋';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      {!showUploadForm && (
        <button
          onClick={() => setShowUploadForm(true)}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New Resource
        </button>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-primary-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Upload Resource</h3>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setError('');
                setSelectedFile(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                placeholder="e.g., System Design Interview Guide"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                rows="3"
                placeholder="Brief description of the resource..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                required
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                PDF, ZIP, DOC, DOCX, PPT, PPTX • Max 50MB
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Resource
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Resources List */}
      {resources && resources.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">Uploaded Resources ({resources.length})</h3>
          
          {resources.map((resource) => (
            <div
              key={resource._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getFileIcon(resource.fileType)}</div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {resource.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {resource.fileType}
                        </span>
                        <span>📥 {resource.downloads || 0} downloads</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(resource._id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete resource"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {(!resources || resources.length === 0) && !showUploadForm && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-gray-600 mb-4">No resources uploaded yet</p>
          <p className="text-sm text-gray-500">
            Share valuable resources with students to help them succeed!
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceUpload;
