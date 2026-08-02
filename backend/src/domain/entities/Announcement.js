/**
 * Announcement Entity (Domain Layer)
 * course_id is nullable — a null course_id means a site-wide announcement
 * (e.g. posted by an Admin), otherwise it's scoped to one course.
 */
class Announcement {
    constructor({ id, course_id, title, message, posted_by, created_at }) {
        this.id = id;
        this.course_id = course_id ?? null;
        this.title = title;
        this.message = message;
        this.posted_by = posted_by;
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.title || this.title.trim().length < 2) {
            throw new Error('Announcement title must be at least 2 characters long');
        }
        if (!this.message || this.message.trim().length === 0) {
            throw new Error('Announcement message cannot be empty');
        }
        if (!this.posted_by) throw new Error('posted_by is required');
    }

    get isGlobal() {
        return this.course_id === null;
    }
}

module.exports = Announcement;
