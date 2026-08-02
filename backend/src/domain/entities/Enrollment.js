class Enrollment {
    constructor({ id, student_id, course_id, enrolled_at }) {
        this.id = id;
        this.student_id = student_id;
        this.course_id = course_id;
        this.enrolled_at = enrolled_at;

        this.validate();
    }

    validate() {
        if (!this.student_id) throw new Error('student_id is required for enrollment');
        if (!this.course_id) throw new Error('course_id is required for enrollment');
    }
}

module.exports = Enrollment;