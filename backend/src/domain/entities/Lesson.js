const VALID_CONTENT_TYPES = ['text', 'video', 'link', 'pdf'];

/**
 * Lesson Entity (Domain Layer)
 * A single unit of course content — a reading, a video link, an attached PDF, etc.
 */
class Lesson {
    constructor({ id, course_id, title, content_type, content, order_index, created_at }) {
        this.id = id;
        this.course_id = course_id;
        this.title = title;
        this.content_type = content_type || 'text';
        this.content = content;
        this.order_index = order_index ?? 0;
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.course_id) throw new Error('course_id is required for a lesson');
        if (!this.title || this.title.trim().length < 2) {
            throw new Error('Lesson title must be at least 2 characters long');
        }
        if (!VALID_CONTENT_TYPES.includes(this.content_type)) {
            throw new Error(`content_type must be one of: ${VALID_CONTENT_TYPES.join(', ')}`);
        }
        if (!this.content || this.content.trim().length === 0) {
            throw new Error('Lesson content cannot be empty');
        }
    }
}

module.exports = Lesson;
