import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Upload, 
  X, 
  FileText, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock,
  Download,
  Star,
  TrendingUp
} from 'lucide-react';
import Footer from '../components/Footer';

const PlacementResourcesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadAbortRef = useRef(null);
  const [stats, setStats] = useState({
    totalUploads: 0,
    averageRating: 0,
    totalDownloads: 0,
  });

  const categories = [
    'Resume Template',
    'Interview Questions',
    'Aptitude Practice',
    'Technical Preparation',
    'Coding Practice',
    'Study Material',
    'Preparation Roadmap',
    'Mock Tests',
    'Soft Skills',
    'Other'
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    customCategory: '',
    tags: '',
    file: null,
  });

  const fetchMyResources = useCallback(async () => {
    try {
      setLoading(true);
      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get('http://localhost:5000/api/resources', config);
      
      // For alumni, filter to show only their uploads
      // For students, show all verified resources
      const resourcesData = userInfo.role === 'alumni'
        ? response.data.filter((resource) => resource.uploadedBy._id === userInfo._id)
        : response.data.filter((resource) => resource.isVerified);
      
      setResources(resourcesData);

      const totalUploads = resourcesData.length;
      const totalDownloads = resourcesData.reduce((sum, r) => sum + (r.downloads || 0), 0);
      const avgRating = resourcesData.length > 0
        ? resourcesData.reduce((sum, r) => sum + (r.averageRating || 0), 0) / resourcesData.length
        : 0;

      setStats({
        totalUploads,
        averageRating: avgRating.toFixed(1),
        totalDownloads,
      });

      setLoading(false);
    } catch (error) {
      // Error handled silently
      setLoading(false);
    }
  }, [userInfo?.token, userInfo?._id, userInfo?.role]);

  useEffect(() => {
    if (userInfo) {
      fetchMyResources();
    }
  }, [userInfo, fetchMyResources]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Allowed file types: PDF, DOC, DOCX, XLS, XLSX
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!validTypes.includes(file.type)) {
        alert('File type not allowed! Please upload PDF, DOC, DOCX, XLS, or XLSX files only.');
        return;
      }

      // File size limit: 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB!');
        return;
      }

      setFormData({ ...formData, file });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate file
    if (!formData.file) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const token = userInfo.token;
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category === 'Other' ? formData.customCategory : formData.category);
      
      // Handle tags - only add if not empty
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      uploadData.append('tags', JSON.stringify(tagsArray));

      // Prepare axios config with progress + abort
      setIsUploading(true);
      setUploadProgress(0);
      const controller = new AbortController();
      uploadAbortRef.current = controller;
      const config = {
        headers: {
          // Don't set Content-Type - let axios set it automatically with boundary
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
        onUploadProgress: (event) => {
          try {
            // event.total may be 0 in some browsers; fallback to file size
            const total = event.total || (formData.file && formData.file.size) || 1;
            const percent = Math.min(100, Math.round((event.loaded * 100) / total));
            setUploadProgress(percent);
          } catch (_) {}
        },
      };

      const response = await axios.post('http://localhost:5000/api/resources', uploadData, config);

      // Show success message
      setUploadMessage(response.data.message || 'Thank you! Your resource has been submitted for review.');
      setUploadSuccess(true);
      setIsUploading(false);
      setUploadProgress(100);
      
      // Hide success message after 5 seconds and close modal
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadMessage('');
        setShowUploadModal(false);
        resetForm();
        fetchMyResources();
      }, 5000);

    } catch (error) {
      // Error handled silently
      alert(error.response?.data?.message || 'Failed to upload resource. Please try again.');
    } finally {
      setIsUploading(false);
      uploadAbortRef.current = null;
    }
  };

  const cancelUpload = () => {
    try {
      if (uploadAbortRef.current) {
        uploadAbortRef.current.abort();
        uploadAbortRef.current = null;
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      customCategory: '',
      tags: resource.tags.join(', '),
      file: null,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = userInfo.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const category = formData.category === 'Other' 
        ? formData.customCategory 
        : formData.category;

      const resourceData = {
        title: formData.title,
        description: formData.description,
        category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      await axios.put(
        `http://localhost:5000/api/resources/${selectedResource._id}`,
        resourceData,
        config
      );

      alert('Resource updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchMyResources();
    } catch (error) {
      // Error handled silently
      alert('Failed to update resource. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const token = userInfo.token;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`http://localhost:5000/api/resources/${id}`, config);

        alert('Resource deleted successfully!');
        fetchMyResources();
      } catch (error) {
        // Error handled silently
        alert('Failed to delete resource. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      customCategory: '',
      tags: '',
      file: null,
    });
    setSelectedResource(null);
    setUploadSuccess(false);
    setUploadMessage('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!userInfo) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Please Login</h2>
          <p className='text-gray-600'>
            You need to be logged in to view resources.
          </p>
        </div>
      </div>
    );
  }

  const isAlumni = userInfo.role === 'alumni';
  const isStudent = userInfo.role === 'student';

  // Handle download with auto-increment
  const handleDownload = async (resource) => {
    try {
      const token = userInfo.token;
      
      // Use the proxy download endpoint that handles filename properly
      const downloadUrl = `http://localhost:5000/api/resources/${resource._id}/download-file`;
      
      // Add authorization header via fetch and blob download
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header or use fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Determine filename with multiple fallback strategies
      let fileName = 'download.pdf'; // Ultimate fallback
      
      if (contentDisposition) {
        // Try multiple regex patterns to extract filename
        const patterns = [
          /filename\*?=["']?([^"';]+)["']?/i,
          /filename="([^"]+)"/i,
          /filename=([^;]+)/i
        ];
        
        for (const pattern of patterns) {
          const match = contentDisposition.match(pattern);
          if (match && match[1]) {
            fileName = match[1].trim();
            break;
          }
        }
      }
      
      // If header extraction failed, use resource data
      if (fileName === 'download.pdf' && resource.fileName) {
        fileName = resource.fileName;
      } else if (fileName === 'download.pdf' && resource.title) {
        fileName = `${resource.title}.${resource.fileExtension || 'pdf'}`;
      }

      // Create blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      // Refresh data to show updated download count
      fetchMyResources();
    } catch (error) {
      // Error handled silently
      alert('Failed to download resource. Please try again.');
    }
  };

  // Handle rating submission
  const handleRating = async (resourceId, rating) => {
    try {
      const token = userInfo.token;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `http://localhost:5000/api/resources/${resourceId}/rate`,
        { rating },
        config
      );

      alert(`Thank you for rating this resource ${rating} stars!`);
      fetchMyResources();
    } catch (error) {
      // Error handled silently
      alert('Failed to submit rating. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            {isStudent ? 'Placement Resources' : 'My Placement Resources'}
          </h1>
          <p className='text-gray-600'>
            {isStudent 
              ? 'Download resources and rate them to help fellow students' 
              : 'Upload and manage your placement preparation resources'}
          </p>
        </div>

        {isAlumni && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-100 text-sm font-medium mb-1'>Total Uploads</p>
                  <h3 className='text-3xl font-bold'>{stats.totalUploads}</h3>
                </div>
                <div className='bg-white/20 p-3 rounded-lg'>
                  <Upload className='w-8 h-8' />
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-yellow-100 text-sm font-medium mb-1'>Average Rating</p>
                  <div className='flex items-center'>
                    <h3 className='text-3xl font-bold mr-2'>{stats.averageRating}</h3>
                    <Star className='w-6 h-6 fill-current' />
                  </div>
                </div>
                <div className='bg-white/20 p-3 rounded-lg'>
                  <TrendingUp className='w-8 h-8' />
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-100 text-sm font-medium mb-1'>Total Downloads</p>
                  <h3 className='text-3xl font-bold'>{stats.totalDownloads}</h3>
                </div>
                <div className='bg-white/20 p-3 rounded-lg'>
                  <Download className='w-8 h-8' />
                </div>
              </div>
            </div>
          </div>
        )}

        {isStudent && (
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white'>
            <div className='flex items-center'>
              <div className='bg-white/20 p-3 rounded-lg mr-4'>
                <FileText className='w-8 h-8' />
              </div>
              <div>
                <h3 className='text-xl font-bold mb-1'>Welcome to Placement Resources!</h3>
                <p className='text-blue-100'>
                  Browse resources shared by alumni. Download files and rate them to help the community.
                </p>
              </div>
            </div>
          </div>
        )}

        {isAlumni && (
          <div className='mb-6'>
            <button
              onClick={() => setShowUploadModal(true)}
              className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center'
            >
              <Upload className='w-5 h-5 mr-2' />
              Upload New Resource
            </button>
          </div>
        )}

        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-gray-900'>
              {isStudent ? 'Available Resources' : 'My Resources'}
            </h2>
          </div>

          {loading ? (
            <div className='p-8 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className='p-8 text-center'>
              <FileText className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-600'>No resources uploaded yet.</p>
              <p className='text-sm text-gray-500 mt-2'>Click &quot;Upload New Resource&quot; to get started!</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Title
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Uploaded By
                    </th>
                    {isAlumni && (
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    )}
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Rating
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Downloads
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Uploaded
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {resources.map((resource) => (
                    <tr key={resource._id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <FileText className='w-5 h-5 text-blue-600 mr-3' />
                          <div>
                            <p className='text-sm font-medium text-gray-900'>{resource.title}</p>
                            <p className='text-xs text-gray-500 mt-1 max-w-xs truncate'>
                              {resource.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                          {resource.category}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 font-medium'>
                          {resource.uploadedBy?.name || 'Unknown'}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {resource.uploadedBy?.email || ''}
                        </div>
                      </td>
                      {isAlumni && (
                        <td className='px-6 py-4 whitespace-nowrap'>
                          {resource.isVerified ? (
                            <span className='px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                              <CheckCircle className='w-3 h-3 mr-1' />
                              Published
                            </span>
                          ) : (
                            <span className='px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                              <Clock className='w-3 h-3 mr-1' />
                              Pending Review
                            </span>
                          )}
                        </td>
                      )}
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Star className='w-4 h-4 text-yellow-400 fill-current mr-1' />
                          <span className='text-sm text-gray-900'>
                            {resource.averageRating > 0 ? resource.averageRating.toFixed(1) : 'N/A'}
                          </span>
                          {resource.totalRatings > 0 && (
                            <span className='text-xs text-gray-500 ml-1'>
                              ({resource.totalRatings})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {resource.downloads || 0}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(resource.createdAt)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        {isStudent ? (
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleDownload(resource)}
                              className='text-blue-600 hover:text-blue-900 transition-colors px-3 py-2 hover:bg-blue-50 rounded-lg flex items-center text-xs font-semibold'
                              title='Download'
                            >
                              <Download className='w-4 h-4 mr-1' />
                              Download
                            </button>
                            <div className='flex space-x-1'>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRating(resource._id, star)}
                                  className='text-yellow-400 hover:text-yellow-600 transition-colors'
                                  title={`Rate ${star} stars`}
                                >
                                  <Star className='w-4 h-4 fill-current' />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleEdit(resource)}
                              className='text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg'
                              title='Edit'
                            >
                              <Edit2 className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => handleDelete(resource._id)}
                              className='text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg'
                              title='Delete'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showUploadModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center'>
                <h2 className='text-2xl font-bold'>Upload New Resource</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className='text-white hover:bg-white/20 p-2 rounded-lg transition-colors'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              {uploadSuccess ? (
                <div className='p-8 text-center'>
                  <div className='mb-6'>
                    <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100'>
                      <CheckCircle className='h-10 w-10 text-green-600' />
                    </div>
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-4'>Thank You!</h3>
                  <p className='text-gray-600 mb-6'>
                    {uploadMessage}
                  </p>
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <p className='text-sm text-blue-800'>
                      <strong>What happens next?</strong><br />
                      • An administrator will review your resource<br />
                      • You&apos;ll receive a notification once it&apos;s approved<br />
                      • The resource will then be visible to all students<br />
                      • This usually takes 24-48 hours
                    </p>
                  </div>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className='p-6'>
                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Upload File *
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer'>
                    <input
                      type='file'
                      onChange={handleFileChange}
                      accept='.pdf,.doc,.docx,.xls,.xlsx'
                      required
                      className='hidden'
                      id='file-upload'
                    />
                    <label htmlFor='file-upload' className='cursor-pointer'>
                      <Upload className='w-12 h-12 text-gray-400 mx-auto mb-3' />
                      <p className='text-sm text-gray-600'>
                        {formData.file ? (
                          <span className='text-blue-600 font-semibold'>{formData.file.name}</span>
                        ) : (
                          <>
                            Click to upload or drag and drop
                            <br />
                            <span className='text-xs text-gray-500'>PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</span>
                          </>
                        )}
                      </p>
                    </label>
                  </div>
                  {isUploading && (
                    <div className='mt-4'>
                      <div className='flex items-center justify-between text-sm text-gray-600 mb-1'>
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden'>
                        <div
                          className='h-3 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-200'
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Resource Title *
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    placeholder='e.g., Complete Resume Template Bundle'
                  />
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Category *
                  </label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  >
                    <option value=''>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category === 'Other' && (
                  <div className='mb-6'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Custom Category *
                    </label>
                    <input
                      type='text'
                      name='customCategory'
                      value={formData.customCategory}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      placeholder='Enter custom category'
                    />
                  </div>
                )}

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Description *
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows='4'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                    placeholder='Provide a detailed description of the resource...'
                  />
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Tags
                  </label>
                  <input
                    type='text'
                    name='tags'
                    value={formData.tags}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    placeholder='Enter tags separated by commas (e.g., ATS, Professional, 2024)'
                  />
                  <p className='text-xs text-gray-500 mt-1'>Separate tags with commas</p>
                </div>

                <div className='mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-sm text-blue-800'>
                    <strong>Note:</strong> Your resource will be reviewed by admin before it&apos;s published. 
                    This usually takes 24-48 hours.
                  </p>
                </div>

                <div className='flex space-x-4'>
                  <button
                    type='button'
                    onClick={() => {
                      if (isUploading) {
                        cancelUpload();
                      } else {
                        setShowUploadModal(false);
                        resetForm();
                      }
                    }}
                    className='flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60'
                  >
                    {isUploading ? 'Cancel Upload' : 'Cancel'}
                  </button>
                  <button
                    type='submit'
                    disabled={isUploading}
                    className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Resource'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        )}

        {showEditModal && selectedResource && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center'>
                <h2 className='text-2xl font-bold'>Edit Resource</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className='text-white hover:bg-white/20 p-2 rounded-lg transition-colors'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              <form onSubmit={handleUpdate} className='p-6'>
                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Resource Title *
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    placeholder='e.g., Complete Resume Template Bundle'
                  />
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Category *
                  </label>
                  <select
                    name='category'
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  >
                    <option value=''>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.category === 'Other' && (
                  <div className='mb-6'>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>
                      Custom Category *
                    </label>
                    <input
                      type='text'
                      name='customCategory'
                      value={formData.customCategory}
                      onChange={handleChange}
                      required
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      placeholder='Enter custom category'
                    />
                  </div>
                )}

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Description *
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows='4'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                    placeholder='Provide a detailed description of the resource...'
                  />
                </div>

                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>
                    Tags
                  </label>
                  <input
                    type='text'
                    name='tags'
                    value={formData.tags}
                    onChange={handleChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    placeholder='Enter tags separated by commas (e.g., ATS, Professional, 2024)'
                  />
                  <p className='text-xs text-gray-500 mt-1'>Separate tags with commas</p>
                </div>

                <div className='flex space-x-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className='flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl'
                  >
                    Update Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PlacementResourcesPage;
