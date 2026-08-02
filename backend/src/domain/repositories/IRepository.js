/**
 * Abstract base repository (Dependency Inversion Principle).
 * Application services depend on THIS contract, never on MySQL directly.
 */
class IRepository {
    async findAll() { throw new Error('findAll() not implemented'); }
    async findById(id) { throw new Error('findById() not implemented'); }
    async create(data) { throw new Error('create() not implemented'); }
    async update(id, data) { throw new Error('update() not implemented'); }
    async delete(id) { throw new Error('delete() not implemented'); }
}

module.exports = IRepository;