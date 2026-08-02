const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');

router.get('/', gradeController.getAll);
router.get('/student/:studentId', gradeController.getByStudent);
router.post('/', gradeController.create);
router.put('/:id', gradeController.update);
router.delete('/:id', gradeController.remove);

module.exports = router;