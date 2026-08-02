const announcementService = require('../../application/services/announcement.service');
const asyncHandler = require('../middlewares/asyncHandler');

class AnnouncementController {
    getAll = asyncHandler(async (req, res) => {
        const announcements = await announcementService.getAllAnnouncements();
        res.json({ success: true, data: announcements });
    });

    getByCourse = asyncHandler(async (req, res) => {
        const announcements = await announcementService.getCourseAnnouncements(req.params.courseId);
        res.json({ success: true, data: announcements });
    });

    create = asyncHandler(async (req, res) => {
        const announcement = await announcementService.createAnnouncement(req.body, req.user.id);
        res.status(201).json({ success: true, data: announcement });
    });

    remove = asyncHandler(async (req, res) => {
        await announcementService.deleteAnnouncement(req.params.id);
        res.json({ success: true, message: 'Announcement deleted successfully' });
    });
}

module.exports = new AnnouncementController();
