class Quiz {
    constructor({ id, course_id, title, description, time_limit_minutes, created_by, created_at }) {
        this.id = id;
        this.course_id = course_id;
        this.title = title;
        this.description = description || '';
        this.time_limit_minutes = time_limit_minutes ?? 30;
        this.created_by = created_by;
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.course_id) throw new Error('course_id is required for a quiz');
        if (!this.title || this.title.trim().length < 2) {
            throw new Error('Quiz title must be at least 2 characters long');
        }
        if (!this.created_by) throw new Error('created_by (instructor) is required');
        if (this.time_limit_minutes <= 0) throw new Error('time_limit_minutes must be greater than 0');
    }
}

module.exports = Quiz;
