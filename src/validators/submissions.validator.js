const { body, param } = require('express-validator');

const submitAssignmentValidator = [
  param('assignmentId').isMongoId().withMessage('assignmentId invalid'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('score invalid (0-100)')
];

const getSubmissionValidator = [
  param('id').isMongoId().withMessage('id invalid')
];

const updateSubmissionValidator = [
  param('id').isMongoId().withMessage('id invalid'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('score invalid (0-100)')
];

module.exports = {
  submitAssignmentValidator,
  getSubmissionValidator,
  updateSubmissionValidator
};
