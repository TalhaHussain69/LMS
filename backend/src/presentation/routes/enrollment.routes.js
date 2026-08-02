const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/', enrollmentController.getAll);
router.get('/student/:studentId', enrollmentController.getByStudent);
router.post('/', requireRole('admin', 'teacher'), enrollmentController.create);
router.delete('/:id', requireRole('admin', 'teacher'), enrollmentController.remove);

module.exports = router;
