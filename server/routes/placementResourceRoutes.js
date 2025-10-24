const express = require('express');
const router = express.Router();
const {
  getPlacementResources,
  getPlacementResourceById,
  createPlacementResource,
  updatePlacementResource,
  ratePlacementResource,
  incrementDownload,
  downloadFile,
  deletePlacementResource,
  getAllResourcesForAdmin,
  verifyResource,
} = require('../controllers/placementResourceController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadResource } = require('../config/cloudinary');

// Debug middleware to log upload attempts
const logUpload = (req, res, next) => {
  console.log('=== Upload Route Hit ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Has file:', !!req.file);
  console.log('Body keys:', Object.keys(req.body));
  next();
};

// Wrap multer to return proper error messages instead of generic 500s
const uploadResourceWithErrors = (req, res, next) => {
  const handler = uploadResource.single('file');
  handler(req, res, (err) => {
    if (err) {
      // Multer or Cloudinary storage error
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    next();
  });
};

// Admin routes MUST come BEFORE /:id routes to avoid path conflicts
router.route('/admin/all').get(protect, admin, getAllResourcesForAdmin);
router.route('/admin/:id/verify').put(protect, admin, verifyResource);

router
  .route('/')
  .get(protect, getPlacementResources)
  .post(protect, uploadResourceWithErrors, logUpload, createPlacementResource);

router.route('/:id/rate').post(protect, ratePlacementResource);

router.route('/:id/download').put(protect, incrementDownload);

// NEW: Proxy download route for proper filename handling
router.route('/:id/download-file').get(protect, downloadFile);

router
  .route('/:id')
  .get(protect, getPlacementResourceById)
  .put(protect, updatePlacementResource)
  .delete(protect, deletePlacementResource);

module.exports = router;
