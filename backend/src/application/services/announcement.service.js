const announcementRepository = require('../../infrastructure/repositories/announcement.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const { forbidden, resolveOwnStudentId } = require('./access.util');

class AnnouncementService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAllAnnouncements(user) {
        const all = await this.repository.findAll();
        if (user.role === 'admin') return all;

        if (user.role === 'teacher') {
            return all.filter(a => a.course_id === null || a.instructor_id === user.id);
        }

        // student — global announcements + only their enrolled courses' announcements
        const ownId = await resolveOwnStudentId(user);
        if (!ownId) return all.filter(a => a.course_id === null);
        const myEnrollments = await enrollmentRepository.findByStudentId(ownId);
        const myCourseIds = new Set(myEnrollments.map(e => e.course_id));
        return all.filter(a => a.course_id === null || myCourseIds.has(a.course_id));
    }

    async getCourseAnnouncements(courseId) {
        return this.repository.findByCourseId(courseId);
    }

    async createAnnouncement(data, user) {
        if (!data.course_id && user.role !== 'admin') {
            throw forbidden('Only admins can post site-wide announcements');
        }
        return this.repository.create({ ...data, posted_by: user.id });
    }

    async deleteAnnouncement(id) {
        const deleted = await this.repository.delete(id);
        if (!deleted) throw new Error('Announcement not found');
        return deleted;
    }
}

module.exports = new AnnouncementService(announcementRepository);
