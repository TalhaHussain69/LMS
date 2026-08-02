const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/', studentController.getAll);
router.get('/me', studentController.getMe);
router.get('/:id', studentController.getById);
router.post('/', requireRole('admin'), studentController.create);
router.put('/:id', requireRole('admin'), studentController.update);
router.delete('/:id', requireRole('admin'), studentController.remove);

module.exports = router;
