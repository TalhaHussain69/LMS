const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/quizAttempt.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/quiz/:quizId', requireAuth, requireRole('admin', 'teacher'), attemptController.getByQuiz);
router.get('/mine', requireAuth, attemptController.getMine);
router.post('/', requireAuth, requireRole('student'), attemptController.submit);

module.exports = router;
