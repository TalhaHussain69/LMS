class Grade {
    constructor({ id, student_id, course_id, marks, grade, created_at }) {
        this.id = id;
        this.student_id = student_id;
        this.course_id = course_id;
        this.marks = marks;
        this.grade = grade || Grade.calculateLetterGrade(marks);
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.student_id) throw new Error('student_id is required');
        if (!this.course_id) throw new Error('course_id is required');
        if (this.marks === undefined || this.marks < 0 || this.marks > 100) {
            throw new Error('marks must be a number between 0 and 100');
        }
    }

    static calculateLetterGrade(marks) {
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B';
        if (marks >= 60) return 'C';
        if (marks >= 50) return 'D';
        return 'F';
    }
}

module.exports = Grade;