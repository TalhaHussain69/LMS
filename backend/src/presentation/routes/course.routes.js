const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', requireRole('admin', 'teacher'), courseController.create);
router.put('/:id', requireRole('admin', 'teacher'), courseController.update);
router.delete('/:id', requireRole('admin', 'teacher'), courseController.remove);

module.exports = router;
