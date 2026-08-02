class Course {
    constructor({ id, name, code, credit_hours, instructor_id, created_at }) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.credit_hours = credit_hours || 3;
        this.instructor_id = instructor_id ?? null;
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.name || this.name.trim().length < 2) {
            throw new Error('Course name must be at least 2 characters long');
        }
        if (!this.code || this.code.trim().length < 2) {
            throw new Error('Course code is required');
        }
        if (this.credit_hours <= 0) {
            throw new Error('Credit hours must be greater than 0');
        }
    }
}

module.exports = Course;
