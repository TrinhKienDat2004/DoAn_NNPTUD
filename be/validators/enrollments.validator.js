const { body, param } = require('express-validator');

const createEnrollmentValidator = [
  body('sectionId')
    .notEmpty().withMessage('sectionId là bắt buộc')
    .isMongoId().withMessage('sectionId không hợp lệ'),
  body('status')
    .optional()
    .isIn(['ENROLLED', 'CANCELLED']).withMessage('status phải là ENROLLED hoặc CANCELLED')
];

const updateEnrollmentValidator = [
  param('id').isMongoId().withMessage('ID không hợp lệ'),
  body('status')
    .optional()
    .isIn(['ENROLLED', 'CANCELLED']).withMessage('status phải là ENROLLED hoặc CANCELLED')
];

module.exports = { createEnrollmentValidator, updateEnrollmentValidator };
