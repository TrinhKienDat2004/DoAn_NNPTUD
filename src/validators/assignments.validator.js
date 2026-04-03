const { body, param } = require('express-validator');

const createAssignmentValidator = [
  body('sectionId').isMongoId().withMessage('sectionId invalid'),
  body('title').isString().trim().isLength({ min: 3, max: 200 }).withMessage('title invalid (3-200 chars)'),
  body('description').optional().isString().trim().withMessage('description invalid'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('dueDate invalid (ISO 8601 format)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('dueDate must be in the future');
      }
      return true;
    })
];

const updateAssignmentValidator = [
  param('id').isMongoId().withMessage('id invalid'),
  body('title').optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage('title invalid (3-200 chars)'),
  body('description').optional().isString().trim().withMessage('description invalid'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('dueDate invalid (ISO 8601 format)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('dueDate must be in the future');
      }
      return true;
    })
];

const getAssignmentValidator = [
  param('id').isMongoId().withMessage('id invalid')
];

module.exports = {
  createAssignmentValidator,
  updateAssignmentValidator,
  getAssignmentValidator
};
