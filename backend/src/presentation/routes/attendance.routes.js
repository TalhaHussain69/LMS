const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.get('/', attendanceController.getAll);
router.get('/student/:studentId', attendanceController.getByStudent);
router.post('/', attendanceController.create);
router.put('/:id', attendanceController.update);
router.delete('/:id', attendanceController.remove);

module.exports = router;
