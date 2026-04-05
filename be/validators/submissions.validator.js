const { body, param } = require('express-validator');

const submitAssignmentValidator = [
  param('assignmentId').isMongoId().withMessage('assignmentId không hợp lệ'),
  body('studentId').optional().isMongoId().withMessage('studentId không hợp lệ') // Gộp cho cả ADMIN đăng ký thay
];

const getSubmissionValidator = [
  param('id').isMongoId().withMessage('ID bài nộp không hợp lệ')
];

const updateSubmissionValidator = [
  param('id').isMongoId().withMessage('ID bài nộp không hợp lệ'),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('Điểm phải từ 0 đến 100'),
  body('feedback').optional().trim()
];

module.exports = {
  submitAssignmentValidator,
  getSubmissionValidator,
  updateSubmissionValidator
};
