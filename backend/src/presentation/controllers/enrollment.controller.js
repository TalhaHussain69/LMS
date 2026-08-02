const enrollmentService = require('../../application/services/enrollment.service');
const asyncHandler = require('../middlewares/asyncHandler');

class EnrollmentController {
    getAll = asyncHandler(async (req, res) => {
        const enrollments = await enrollmentService.getAllEnrollments(req.user);
        res.json({ success: true, data: enrollments });
    });

    getByStudent = asyncHandler(async (req, res) => {
        const enrollments = await enrollmentService.getStudentEnrollments(req.params.studentId, req.user);
        res.json({ success: true, data: enrollments });
    });

    create = asyncHandler(async (req, res) => {
        const { student_id, course_id } = req.body;
        const enrollment = await enrollmentService.enrollStudent(student_id, course_id, req.user);
        res.status(201).json({ success: true, data: enrollment });
    });

    remove = asyncHandler(async (req, res) => {
        await enrollmentService.unenrollStudent(req.params.id, req.user);
        res.json({ success: true, message: 'Student unenrolled successfully' });
    });
}

module.exports = new EnrollmentController();
