const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.use(requireAuth, requireRole('admin'));

router.get('/', userController.getAll);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.put('/:id/password', userController.resetPassword);
router.delete('/:id', userController.remove);

module.exports = router;
