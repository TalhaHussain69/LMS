/**
 * LessonProgress Entity (Domain Layer)
 * Tracks whether a specific student has completed a specific lesson.
 * Course-level "progress %" is derived from these records in the service layer.
 */
class LessonProgress {
    constructor({ id, student_id, lesson_id, completed, completed_at }) {
        this.id = id;
        this.student_id = student_id;
        this.lesson_id = lesson_id;
        this.completed = Boolean(completed);
        this.completed_at = completed_at;

        this.validate();
    }

    validate() {
        if (!this.student_id) throw new Error('student_id is required');
        if (!this.lesson_id) throw new Error('lesson_id is required');
    }
}

module.exports = LessonProgress;
