const gradeService = require('../../application/services/grade.service');
const asyncHandler = require('../middlewares/asyncHandler');

class GradeController {
    getAll = asyncHandler(async (req, res) => {
        const grades = await gradeService.getAllGrades(req.user);
        res.json({ success: true, data: grades });
    });

    getByStudent = asyncHandler(async (req, res) => {
        const grades = await gradeService.getStudentGrades(req.params.studentId, req.user);
        res.json({ success: true, data: grades });
    });

    create = asyncHandler(async (req, res) => {
        const grade = await gradeService.addGrade(req.body, req.user);
        res.status(201).json({ success: true, data: grade });
    });

    update = asyncHandler(async (req, res) => {
        const grade = await gradeService.updateGrade(req.params.id, req.body);
        res.json({ success: true, data: grade });
    });

    remove = asyncHandler(async (req, res) => {
        await gradeService.deleteGrade(req.params.id);
        res.json({ success: true, message: 'Grade deleted successfully' });
    });
}

module.exports = new GradeController();
