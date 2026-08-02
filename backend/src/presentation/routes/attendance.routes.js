const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/', attendanceController.getAll);
router.get('/student/:studentId', attendanceController.getByStudent);
router.post('/', requireRole('admin', 'teacher'), attendanceController.create);
router.put('/:id', requireRole('admin', 'teacher'), attendanceController.update);
router.delete('/:id', requireRole('admin', 'teacher'), attendanceController.remove);

module.exports = router;
