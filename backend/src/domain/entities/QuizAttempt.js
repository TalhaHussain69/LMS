class QuizAttempt {
    constructor({ id, quiz_id, student_id, score, total_marks, submitted_at }) {
        this.id = id;
        this.quiz_id = quiz_id;
        this.student_id = student_id;
        this.score = score ?? 0;
        this.total_marks = total_marks ?? 0;
        this.submitted_at = submitted_at;

        this.validate();
    }

    validate() {
        if (!this.quiz_id) throw new Error('quiz_id is required');
        if (!this.student_id) throw new Error('student_id is required');
    }

    get percentage() {
        if (!this.total_marks) return 0;
        return Math.round((this.score / this.total_marks) * 100 * 100) / 100;
    }
}

module.exports = QuizAttempt;
