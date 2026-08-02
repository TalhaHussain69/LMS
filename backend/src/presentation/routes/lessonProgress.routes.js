const express = require('express');
const router = express.Router();
const progressController = require('../controllers/lessonProgress.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.post('/complete', requireAuth, progressController.markComplete);
router.get('/course/:courseId', requireAuth, progressController.getCourseProgress);
router.get('/course/:courseId/student/:studentId', requireAuth, progressController.getCourseProgress);

module.exports = router;
