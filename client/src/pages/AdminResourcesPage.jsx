import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  FileText, 
  CheckCircle, 
  X, 
  Eye, 
  Download,
  Star,
  Clock,
  User,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';

const AdminResourcesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'published', 'all'
  const [selectedResource, setSelectedResource] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get('${process.env.BACKEND_URL}/api/resources/admin/all', config);
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      // Error handled silently
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchResources();
    }
  }, [userInfo]);

  // Filter resources based on status
  const filteredResources = resources.filter((resource) => {
    if (filter === 'pending') return !resource.isVerified;
    if (filter === 'published') return resource.isVerified;
    return true; // 'all'
  });

  // Handle publish/verify resource
  const handlePublish = async (resourceId) => {
    if (!window.confirm('Are you sure you want to publish this resource? It will be visible to all students.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `${process.env.BACKEND_URL}/api/resources/admin/${resourceId}/verify`,
        { isVerified: true },
        config
      );

      alert('Resource published successfully!');
      fetchResources();
      setShowPreviewModal(false);
    } catch (error) {
      // Error handled silently
      alert(error.response?.data?.message || 'Failed to publish resource. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle unpublish resource
  const handleUnpublish = async (resourceId) => {
    if (!window.confirm('Are you sure you want to unpublish this resource? It will be hidden from students.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `${process.env.BACKEND_URL}/api/resources/admin/${resourceId}/verify`,
        { isVerified: false },
        config
      );

      alert('Resource unpublished successfully!');
      fetchResources();
      setShowPreviewModal(false);
    } catch (error) {
      // Error handled silently
      alert(error.response?.data?.message || 'Failed to unpublish resource. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete resource
  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const token = userInfo.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${process.env.BACKEND_URL}/api/resources/${resourceId}`, config);

      alert('Resource deleted successfully!');
      fetchResources();
      setShowPreviewModal(false);
    } catch (error) {
      // Error handled silently
      alert('Failed to delete resource. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle download with proper filename (same as student page)
  const handleDownload = async (resource) => {
    try {
      const token = userInfo.token;
      
      // Use the proxy download endpoint that handles filename properly
      const downloadUrl = `${process.env.BACKEND_URL}/api/resources/${resource._id}/download-file`;
      
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
      fetchResources();
    } catch (error) {
      // Error handled silently
      alert('Failed to download resource. Please try again.');
    }
  };

  // Open preview modal
  const handlePreview = (resource) => {
    setSelectedResource(resource);
    setShowPreviewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!userInfo || userInfo.role !== 'admin') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Access Denied</h2>
          <p className='text-gray-600'>This page is only accessible to admin users.</p>
        </div>
      </div>
    );
  }

  const pendingCount = resources.filter(r => !r.isVerified).length;
  const publishedCount = resources.filter(r => r.isVerified).length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Resource Management</h1>
          <p className='text-gray-600'>Review and publish resources submitted by alumni</p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-yellow-100 text-sm font-medium mb-1'>Pending Review</p>
                <h3 className='text-3xl font-bold'>{pendingCount}</h3>
              </div>
              <div className='bg-white/20 p-3 rounded-lg'>
                <Clock className='w-8 h-8' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-100 text-sm font-medium mb-1'>Published</p>
                <h3 className='text-3xl font-bold'>{publishedCount}</h3>
              </div>
              <div className='bg-white/20 p-3 rounded-lg'>
                <CheckCircle className='w-8 h-8' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-100 text-sm font-medium mb-1'>Total Resources</p>
                <h3 className='text-3xl font-bold'>{resources.length}</h3>
              </div>
              <div className='bg-white/20 p-3 rounded-lg'>
                <FileText className='w-8 h-8' />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className='bg-white rounded-xl shadow-lg mb-6 p-2 flex space-x-2'>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className='flex items-center justify-center'>
              <Clock className='w-5 h-5 mr-2' />
              Pending ({pendingCount})
            </div>
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'published'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className='flex items-center justify-center'>
              <CheckCircle className='w-5 h-5 mr-2' />
              Published ({publishedCount})
            </div>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className='flex items-center justify-center'>
              <FileText className='w-5 h-5 mr-2' />
              All ({resources.length})
            </div>
          </button>
        </div>

        {/* Resources Table */}
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-gray-900'>
              {filter === 'pending' && 'Pending Resources'}
              {filter === 'published' && 'Published Resources'}
              {filter === 'all' && 'All Resources'}
            </h2>
          </div>

          {loading ? (
            <div className='p-8 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className='p-8 text-center'>
              <FileText className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-600'>No resources found.</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Resource
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Category
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Uploaded By
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Stats
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
                  {filteredResources.map((resource) => (
                    <tr key={resource._id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <FileText className='w-5 h-5 text-blue-600 mr-3 flex-shrink-0' />
                          <div className='max-w-xs'>
                            <p className='text-sm font-medium text-gray-900 truncate'>
                              {resource.title}
                            </p>
                            <p className='text-xs text-gray-500 truncate mt-1'>
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
                        <div className='flex items-center'>
                          <User className='w-4 h-4 text-gray-400 mr-2' />
                          <div>
                            <p className='text-sm text-gray-900 font-medium'>
                              {resource.uploadedBy?.name || 'Unknown'}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {resource.uploadedBy?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {resource.isVerified ? (
                          <span className='px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                            <CheckCircle className='w-3 h-3 mr-1' />
                            Published
                          </span>
                        ) : (
                          <span className='px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                            <Clock className='w-3 h-3 mr-1' />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-xs text-gray-600'>
                          <div className='flex items-center mb-1'>
                            <Star className='w-3 h-3 text-yellow-400 fill-current mr-1' />
                            <span>{resource.averageRating > 0 ? resource.averageRating.toFixed(1) : 'N/A'}</span>
                            {resource.totalRatings > 0 && (
                              <span className='ml-1'>({resource.totalRatings})</span>
                            )}
                          </div>
                          <div className='flex items-center'>
                            <Download className='w-3 h-3 text-gray-400 mr-1' />
                            <span>{resource.downloads || 0} downloads</span>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-xs text-gray-500'>
                          <Calendar className='w-3 h-3 mr-1' />
                          {formatDate(resource.createdAt)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handlePreview(resource)}
                            className='text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg'
                            title='Preview & Review'
                          >
                            <Eye className='w-4 h-4' />
                          </button>
                          {!resource.isVerified ? (
                            <button
                              onClick={() => handlePublish(resource._id)}
                              className='text-green-600 hover:text-green-900 transition-colors p-2 hover:bg-green-50 rounded-lg'
                              title='Publish'
                            >
                              <CheckCircle className='w-4 h-4' />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnpublish(resource._id)}
                              className='text-orange-600 hover:text-orange-900 transition-colors p-2 hover:bg-orange-50 rounded-lg'
                              title='Unpublish'
                            >
                              <AlertCircle className='w-4 h-4' />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreviewModal && selectedResource && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center'>
                <h2 className='text-2xl font-bold'>Resource Preview & Review</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className='text-white hover:bg-white/20 p-2 rounded-lg transition-colors'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              <div className='p-6'>
                {/* Status Badge */}
                <div className='mb-6'>
                  {selectedResource.isVerified ? (
                    <span className='px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-green-100 text-green-800'>
                      <CheckCircle className='w-4 h-4 mr-2' />
                      Published - Visible to Students
                    </span>
                  ) : (
                    <span className='px-4 py-2 inline-flex items-center text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800'>
                      <Clock className='w-4 h-4 mr-2' />
                      Pending Review - Not Visible to Students
                    </span>
                  )}
                </div>

                {/* Resource Details */}
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Title</label>
                    <p className='text-lg font-medium text-gray-900'>{selectedResource.title}</p>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Description</label>
                    <p className='text-gray-700 whitespace-pre-wrap'>{selectedResource.description}</p>
                  </div>

                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>Category</label>
                      <span className='px-4 py-2 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800'>
                        {selectedResource.category}
                      </span>
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>File Size</label>
                      <p className='text-gray-700'>{selectedResource.fileSize || 'N/A'}</p>
                    </div>
                  </div>

                  {selectedResource.tags && selectedResource.tags.length > 0 && (
                    <div>
                      <label className='block text-sm font-semibold text-gray-700 mb-2'>Tags</label>
                      <div className='flex flex-wrap gap-2'>
                        {selectedResource.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700'
                          >
                            <Tag className='w-3 h-3 inline mr-1' />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Uploaded By</label>
                    <div className='flex items-center bg-gray-50 rounded-lg p-4'>
                      <User className='w-10 h-10 text-gray-400 mr-3' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {selectedResource.uploadedBy?.name || 'Unknown'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {selectedResource.uploadedBy?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    <div className='bg-yellow-50 rounded-lg p-4 text-center'>
                      <Star className='w-6 h-6 text-yellow-500 mx-auto mb-2 fill-current' />
                      <p className='text-2xl font-bold text-gray-900'>
                        {selectedResource.averageRating > 0 ? selectedResource.averageRating.toFixed(1) : 'N/A'}
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        {selectedResource.totalRatings || 0} ratings
                      </p>
                    </div>

                    <div className='bg-green-50 rounded-lg p-4 text-center'>
                      <Download className='w-6 h-6 text-green-500 mx-auto mb-2' />
                      <p className='text-2xl font-bold text-gray-900'>{selectedResource.downloads || 0}</p>
                      <p className='text-xs text-gray-600 mt-1'>downloads</p>
                    </div>

                    <div className='bg-blue-50 rounded-lg p-4 text-center'>
                      <Eye className='w-6 h-6 text-blue-500 mx-auto mb-2' />
                      <p className='text-2xl font-bold text-gray-900'>{selectedResource.views || 0}</p>
                      <p className='text-xs text-gray-600 mt-1'>views</p>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Uploaded On</label>
                    <p className='text-gray-700'>{formatDate(selectedResource.createdAt)}</p>
                  </div>

                  {/* File Preview Link */}
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <label className='block text-sm font-semibold text-blue-900 mb-2'>Resource File</label>
                    <div className='space-y-2'>
                      <button
                        onClick={() => handleDownload(selectedResource)}
                        className='text-blue-600 hover:text-blue-800 underline flex items-center cursor-pointer bg-transparent border-none'
                      >
                        <Download className='w-4 h-4 mr-2' />
                        Download: {selectedResource.fileName || `${selectedResource.title}.${selectedResource.fileExtension || 'pdf'}`}
                      </button>
                      {selectedResource.fileExtension && (
                        <p className='text-xs text-gray-600'>
                          File Type: {selectedResource.fileExtension.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex space-x-4 mt-8 pt-6 border-t border-gray-200'>
                  {!selectedResource.isVerified ? (
                    <>
                      <button
                        onClick={() => handlePublish(selectedResource._id)}
                        disabled={actionLoading}
                        className='flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center'
                      >
                        {actionLoading ? (
                          'Publishing...'
                        ) : (
                          <>
                            <CheckCircle className='w-5 h-5 mr-2' />
                            Publish Resource
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedResource._id)}
                        disabled={actionLoading}
                        className='px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUnpublish(selectedResource._id)}
                        disabled={actionLoading}
                        className='flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center'
                      >
                        {actionLoading ? (
                          'Unpublishing...'
                        ) : (
                          <>
                            <AlertCircle className='w-5 h-5 mr-2' />
                            Unpublish Resource
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedResource._id)}
                        disabled={actionLoading}
                        className='px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    disabled={actionLoading}
                    className='px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60'
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResourcesPage;
