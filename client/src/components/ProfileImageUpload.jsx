import React, { useState, useRef } from 'react';
import { uploadProfileImage } from '../services/uploadService';

const ProfileImageUpload = ({ currentImage, onUploadSuccess }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');

    try {
      const response = await uploadProfileImage(file);
      
      // Call success callback with new image URL
      if (onUploadSuccess) {
        onUploadSuccess(response.imageUrl, response.user);
      }

      // Update preview
      setPreview(response.imageUrl);
      
      // Show success message
      alert('Profile image updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      // Reset preview to current image
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Image Preview */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl text-primary-600">👤</span>
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span className="text-xs text-white mt-2">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-white mt-1">Change</span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={triggerFileInput}
        disabled={uploading}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm text-center bg-red-50 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or GIF • Max 5MB
      </p>
    </div>
  );
};

export default ProfileImageUpload;
