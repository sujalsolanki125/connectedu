const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  addAnswer,
  upvoteQuestion,
  upvoteAnswer,
  acceptAnswer,
  deleteQuestion,
} = require('../controllers/qaController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getQuestions)
  .post(protect, createQuestion);

router.route('/:id/answer').post(protect, addAnswer);

router.route('/:id/upvote').put(protect, upvoteQuestion);

router.route('/:id/answer/:answerId/upvote').put(protect, upvoteAnswer);

router.route('/:id/answer/:answerId/accept').put(protect, acceptAnswer);

router
  .route('/:id')
  .get(protect, getQuestionById)
  .delete(protect, deleteQuestion);

module.exports = router;
