const VALID_STATUSES = ['present', 'absent', 'leave'];

class Attendance {
    constructor({ id, student_id, course_id, date, status }) {
        this.id = id;
        this.student_id = student_id;
        this.course_id = course_id;
        this.date = date;
        this.status = status || 'present';

        this.validate();
    }

    validate() {
        if (!this.student_id) throw new Error('student_id is required');
        if (!this.course_id) throw new Error('course_id is required');
        if (!this.date) throw new Error('date is required');
        if (!VALID_STATUSES.includes(this.status)) {
            throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
    }
}

module.exports = Attendance;