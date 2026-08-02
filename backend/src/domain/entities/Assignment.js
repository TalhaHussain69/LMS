/**
 * Assignment Entity (Domain Layer)
 * Posted by an instructor against a course; students submit work against it.
 */
class Assignment {
    constructor({ id, course_id, title, description, due_date, max_marks, created_by, created_at }) {
        this.id = id;
        this.course_id = course_id;
        this.title = title;
        this.description = description || '';
        this.due_date = due_date;
        this.max_marks = max_marks ?? 100;
        this.created_by = created_by;
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.course_id) throw new Error('course_id is required for an assignment');
        if (!this.title || this.title.trim().length < 2) {
            throw new Error('Assignment title must be at least 2 characters long');
        }
        if (!this.due_date) throw new Error('due_date is required');
        if (!this.created_by) throw new Error('created_by (instructor) is required');
        if (this.max_marks <= 0) throw new Error('max_marks must be greater than 0');
    }

    isPastDue() {
        return new Date() > new Date(this.due_date);
    }
}

module.exports = Assignment;
