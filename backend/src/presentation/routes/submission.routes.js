const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/assignment/:assignmentId', requireAuth, requireRole('admin', 'teacher'), submissionController.getByAssignment);
router.get('/mine', requireAuth, submissionController.getMine);
router.post('/', requireAuth, requireRole('student'), submissionController.submit);
router.put('/:id/grade', requireAuth, requireRole('admin', 'teacher'), submissionController.grade);

module.exports = router;
