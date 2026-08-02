const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, requireRole('admin'), quizController.getAll);
router.get('/course/:courseId', requireAuth, quizController.getByCourse);
router.get('/:id/attempt', requireAuth, quizController.getForAttempt);
router.get('/:id/full', requireAuth, requireRole('admin', 'teacher'), quizController.getWithAnswers);
router.post('/', requireAuth, requireRole('admin', 'teacher'), quizController.create);
router.post('/:id/questions', requireAuth, requireRole('admin', 'teacher'), quizController.addQuestion);
router.delete('/:id', requireAuth, requireRole('admin', 'teacher'), quizController.remove);

module.exports = router;
