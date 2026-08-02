const studentService = require('../../application/services/student.service');
const asyncHandler = require('../middlewares/asyncHandler');

class StudentController {
    getAll = asyncHandler(async (req, res) => {
        const students = await studentService.getAllStudents();
        res.json({ success: true, data: students });
    });

    getById = asyncHandler(async (req, res) => {
        const student = await studentService.getStudentById(req.params.id);
        res.json({ success: true, data: student });
    });

    create = asyncHandler(async (req, res) => {
        const student = await studentService.createStudent(req.body);
        res.status(201).json({ success: true, data: student });
    });

    update = asyncHandler(async (req, res) => {
        const student = await studentService.updateStudent(req.params.id, req.body);
        res.json({ success: true, data: student });
    });

    remove = asyncHandler(async (req, res) => {
        await studentService.deleteStudent(req.params.id);
        res.json({ success: true, message: 'Student deleted successfully' });
    });
}

module.exports = new StudentController();