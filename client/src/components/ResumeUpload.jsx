import React, { useState, useRef } from 'react';
import { uploadResume, deleteResume } from '../services/uploadService';

const ResumeUpload = ({ currentResume, onUploadSuccess, onDeleteSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Resume size must be less than 10MB');
      return;
    }

    setError('');
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');

    try {
      const response = await uploadResume(file);
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(response.resume, response.user);
      }

      alert('Resume uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await deleteResume();
      
      // Call delete callback
      if (onDeleteSuccess) {
        onDeleteSuccess(response.user);
      }

      alert('Resume deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete resume');
    } finally {
      setDeleting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    }
    return '📋';
  };

  return (
    <div className="space-y-4">
      {/* Current Resume Display */}
      {currentResume?.url ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="text-5xl">{getFileIcon(currentResume.originalName)}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">Current Resume</h4>
                <p className="text-sm text-gray-600 mb-2">{currentResume.originalName}</p>
                <p className="text-xs text-gray-500">
                  Uploaded: {currentResume.uploadedAt ? new Date(currentResume.uploadedAt).toLocaleDateString() : 'Unknown'}
                </p>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <a
                    href={currentResume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Resume
                  </a>
                  
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 text-center">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-gray-600 mb-4">No resume uploaded yet</p>
        </div>
      )}

      {/* Upload New Resume */}
      <div className="flex flex-col items-center space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl hover:from-primary-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
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
              {currentResume?.url ? 'Replace Resume' : 'Upload Resume'}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          PDF, DOC, or DOCX • Max 10MB
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Tips for your resume:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Keep it updated with your latest experience</li>
              <li>Use a professional format (PDF recommended)</li>
              <li>Include relevant skills and projects</li>
              <li>Proofread for errors before uploading</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
