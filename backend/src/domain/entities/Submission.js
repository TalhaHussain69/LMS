/**
 * Submission Entity (Domain Layer)
 * A student's answer to an Assignment. Grading fields stay null until an
 * instructor grades it (business rule enforced in the service layer).
 */
class Submission {
    constructor({ id, assignment_id, student_id, content, submitted_at, marks_obtained, feedback, graded_at }) {
        this.id = id;
        this.assignment_id = assignment_id;
        this.student_id = student_id;
        this.content = content;
        this.submitted_at = submitted_at;
        this.marks_obtained = marks_obtained ?? null;
        this.feedback = feedback ?? null;
        this.graded_at = graded_at ?? null;

        this.validate();
    }

    validate() {
        if (!this.assignment_id) throw new Error('assignment_id is required');
        if (!this.student_id) throw new Error('student_id is required');
        if (!this.content || this.content.trim().length === 0) {
            throw new Error('Submission content cannot be empty');
        }
    }

    get isGraded() {
        return this.marks_obtained !== null;
    }
}

module.exports = Submission;
