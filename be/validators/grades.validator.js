const { body, param } = require('express-validator');

const createGradeValidator = [
  body('submissionId').isMongoId().withMessage('submissionId mang MongoDB ID không hợp lệ'),
  body('score').notEmpty().withMessage('Điểm không được để trống').isFloat({ min: 0, max: 100 }).withMessage('Điểm phải từ 0 đến 100'),
  body('feedback').optional().trim()
];

const updateGradeValidator = [
  param('id').isMongoId().withMessage('ID điểm không hợp lệ'),
  body('score').optional().isFloat({ min: 0, max: 100 }).withMessage('Điểm phải từ 0 đến 100'),
  body('feedback').optional().trim()
];

const getGradeValidator = [
  param('id').isMongoId().withMessage('ID điểm không hợp lệ')
];

module.exports = {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator
};
