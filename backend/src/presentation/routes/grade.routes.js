const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grade.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/', gradeController.getAll);
router.get('/student/:studentId', gradeController.getByStudent);
router.post('/', requireRole('admin', 'teacher'), gradeController.create);
router.put('/:id', requireRole('admin', 'teacher'), gradeController.update);
router.delete('/:id', requireRole('admin', 'teacher'), gradeController.remove);

module.exports = router;
