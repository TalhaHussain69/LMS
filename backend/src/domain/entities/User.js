const VALID_ROLES = ['admin', 'teacher', 'student'];

class User {
    constructor({ id, name, email, password_hash, role, created_at }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password_hash = password_hash;
        this.role = role || 'student';
        this.created_at = created_at;

        this.validate();
    }

    validate() {
        if (!this.name || this.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            throw new Error('A valid email is required');
        }
        if (!VALID_ROLES.includes(this.role)) {
            throw new Error(`Role must be one of: ${VALID_ROLES.join(', ')}`);
        }
    }

    toSafeObject() {
        return { id: this.id, name: this.name, email: this.email, role: this.role, created_at: this.created_at };
    }
}

module.exports = User;