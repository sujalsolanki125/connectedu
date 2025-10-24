const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
  getStats,
  getAllAlumni,
  searchAlumni,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/stats').get(protect, authorize('admin'), getStats);
router.route('/profile').put(protect, updateUserProfile);

// Alumni routes (for students to search and view)
router.route('/alumni').get(protect, getAllAlumni);
router.route('/alumni/search').get(protect, searchAlumni);

router
  .route('/:id')
  .get(protect, getUserById)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
