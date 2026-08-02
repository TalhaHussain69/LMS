/**
 * Student Entity (Domain Layer)
 * Pure business object — knows nothing about the database or HTTP.
 */
class Student {
    constructor({ id, name, email, phone, created_at }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.name || this.name.trim().length < 2) {
            throw new Error('Student name must be at least 2 characters long');
        }
        if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            throw new Error('A valid email is required');
        }
    }
}

module.exports = Student;