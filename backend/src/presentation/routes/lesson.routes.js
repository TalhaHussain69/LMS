const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/course/:courseId', requireAuth, lessonController.getByCourse);
router.post('/', requireAuth, requireRole('admin', 'teacher'), lessonController.create);
router.put('/:id', requireAuth, requireRole('admin', 'teacher'), lessonController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'teacher'), lessonController.remove);

module.exports = router;
