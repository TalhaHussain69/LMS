const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

router.get('/', requireAuth, announcementController.getAll);
router.get('/course/:courseId', requireAuth, announcementController.getByCourse);
router.post('/', requireAuth, requireRole('admin', 'teacher'), announcementController.create);
router.delete('/:id', requireAuth, requireRole('admin', 'teacher'), announcementController.remove);

module.exports = router;
