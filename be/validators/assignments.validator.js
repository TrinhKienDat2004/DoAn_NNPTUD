const { body, param } = require('express-validator');

const createAssignmentValidator = [
  body('sectionId').isMongoId().withMessage('sectionId phải là một MongoDB ID hợp lệ'),
  body('title').notEmpty().withMessage('Tiêu đề bài tập không được để trống').trim(),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Hạn nộp phải là định dạng ngày hợp lệ (ISO8601)')
];

const updateAssignmentValidator = [
  param('id').isMongoId().withMessage('ID bài tập không hợp lệ'),
  body('title').optional().notEmpty().withMessage('Tiêu đề không được để trống nếu cung cấp').trim(),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Hạn nộp phải là định dạng ngày hợp lệ')
];

const getAssignmentValidator = [
  param('id').isMongoId().withMessage('ID bài tập không hợp lệ')
];

module.exports = {
  createAssignmentValidator,
  updateAssignmentValidator,
  getAssignmentValidator
};
