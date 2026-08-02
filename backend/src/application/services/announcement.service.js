const announcementRepository = require('../../infrastructure/repositories/announcement.repository');

class AnnouncementService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAllAnnouncements() {
        return this.repository.findAll();
    }

    async getCourseAnnouncements(courseId) {
        return this.repository.findByCourseId(courseId);
    }

    async createAnnouncement(data, postedBy) {
        return this.repository.create({ ...data, posted_by: postedBy });
    }

    async deleteAnnouncement(id) {
        const deleted = await this.repository.delete(id);
        if (!deleted) throw new Error('Announcement not found');
        return deleted;
    }
}

module.exports = new AnnouncementService(announcementRepository);
