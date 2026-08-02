const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');

router.get('/', enrollmentController.getAll);
router.get('/student/:studentId', enrollmentController.getByStudent);
router.post('/', enrollmentController.create);
router.delete('/:id', enrollmentController.remove);

module.exports = router;