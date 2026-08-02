const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, requireRole('admin'), assignmentController.getAll);
router.get('/course/:courseId', requireAuth, assignmentController.getByCourse);
router.post('/', requireAuth, requireRole('admin', 'teacher'), assignmentController.create);
router.put('/:id', requireAuth, requireRole('admin', 'teacher'), assignmentController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'teacher'), assignmentController.remove);

module.exports = router;
