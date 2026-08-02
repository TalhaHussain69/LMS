const submissionRepository = require('../../infrastructure/repositories/submission.repository');
const assignmentRepository = require('../../infrastructure/repositories/assignment.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const { assertCanManageCourse } = require('./access.util');

class SubmissionService {
    constructor(repository, assignmentRepo, enrollmentRepo) {
        this.repository = repository;
        this.assignmentRepository = assignmentRepo;
        this.enrollmentRepository = enrollmentRepo;
    }

    async getAssignmentSubmissions(assignmentId, user) {
        const assignment = await this.assignmentRepository.findById(assignmentId);
        if (!assignment) throw new Error('Assignment not found');
        if (user.role === 'teacher') await assertCanManageCourse(assignment.course_id, user);
        return this.repository.findByAssignmentId(assignmentId);
    }

    async getStudentSubmissions(studentId) {
        return this.repository.findByStudentId(studentId);
    }

    async submit(studentId, assignmentId, content) {
        const assignment = await this.assignmentRepository.findById(assignmentId);
        if (!assignment) throw new Error('Assignment not found');

        const isEnrolled = await this.enrollmentRepository.exists(studentId, assignment.course_id);
        if (!isEnrolled) throw new Error('You must be enrolled in this course to submit');

        const existing = await this.repository.findByAssignmentAndStudent(assignmentId, studentId);
        if (existing) throw new Error('You have already submitted this assignment');

        return this.repository.create({ assignment_id: assignmentId, student_id: studentId, content });
    }

    async gradeSubmission(id, marksObtained, feedback, user) {
        const submission = await this.repository.findById(id);
        if (!submission) throw new Error('Submission not found');

        const assignment = await this.assignmentRepository.findById(submission.assignment_id);
        if (user.role === 'teacher') await assertCanManageCourse(assignment.course_id, user);
        if (marksObtained < 0 || marksObtained > assignment.max_marks) {
            throw new Error(`Marks must be between 0 and ${assignment.max_marks}`);
        }

        return this.repository.grade(id, marksObtained, feedback);
    }
}

module.exports = new SubmissionService(submissionRepository, assignmentRepository, enrollmentRepository);
