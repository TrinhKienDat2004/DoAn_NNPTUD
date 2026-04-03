const { body, param } = require('express-validator');

const createGradeValidator = [
  body('submissionId').isMongoId().withMessage('submissionId invalid'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('score invalid (0-100)'),
  body('componentType').optional().isString().isIn(['assignment', 'quiz', 'exam', 'participation']).withMessage('componentType invalid'),
  body('finalScore').optional().isInt({ min: 0, max: 100 }).withMessage('finalScore invalid (0-100)')
];

const updateGradeValidator = [
  param('id').isMongoId().withMessage('id invalid'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('score invalid (0-100)'),
  body('componentType').optional().isString().isIn(['assignment', 'quiz', 'exam', 'participation']).withMessage('componentType invalid'),
  body('finalScore').optional().isInt({ min: 0, max: 100 }).withMessage('finalScore invalid (0-100)')
];

const getGradeValidator = [
  param('id').isMongoId().withMessage('id invalid')
];

module.exports = {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator
};
