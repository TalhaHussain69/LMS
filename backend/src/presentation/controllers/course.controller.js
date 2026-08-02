const courseService = require('../../application/services/course.service');
const asyncHandler = require('../middlewares/asyncHandler');

class CourseController {
    getAll = asyncHandler(async (req, res) => {
        const courses = await courseService.getAllCourses();
        res.json({ success: true, data: courses });
    });

    getById = asyncHandler(async (req, res) => {
        const course = await courseService.getCourseById(req.params.id);
        res.json({ success: true, data: course });
    });

    create = asyncHandler(async (req, res) => {
        const course = await courseService.createCourse(req.body);
        res.status(201).json({ success: true, data: course });
    });

    update = asyncHandler(async (req, res) => {
        const course = await courseService.updateCourse(req.params.id, req.body);
        res.json({ success: true, data: course });
    });

    remove = asyncHandler(async (req, res) => {
        await courseService.deleteCourse(req.params.id);
        res.json({ success: true, message: 'Course deleted successfully' });
    });
}

module.exports = new CourseController();