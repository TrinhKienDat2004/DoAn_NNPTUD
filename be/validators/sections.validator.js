const mongoose = require('mongoose');
const { body, param, query } = require('express-validator');

const createSectionValidator = [
  body('courseId')
    .notEmpty().withMessage('courseId là bắt buộc')
    .isMongoId().withMessage('courseId không hợp lệ'),
  body('teacherId')    
    .notEmpty().withMessage('teacherId là bắt buộc')
    .isMongoId().withMessage('teacherId không hợp lệ'),
  body('semester')
    .trim().notEmpty().withMessage('Học kỳ là bắt buộc')
    .isLength({ max: 50 }).withMessage('Học kỳ tối đa 50 ký tự'),
  body('startDate').optional().isISO8601().withMessage('startDate không hợp lệ'),
  body('endDate').optional().isISO8601().withMessage('endDate không hợp lệ'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('Sĩ số phải từ 1 đến 500')
];

const updateSectionValidator = [
  param('id').isMongoId().withMessage('ID không hợp lệ'),
  body('courseId').optional().isMongoId().withMessage('courseId không hợp lệ'),
  body('teacherId').optional().isMongoId().withMessage('teacherId không hợp lệ'),
  body('semester').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Học kỳ 1-50 ký tự'),
  body('startDate').optional().isISO8601().withMessage('startDate không hợp lệ'),
  body('endDate').optional().isISO8601().withMessage('endDate không hợp lệ'),
  body('capacity').optional().isInt({ min: 1, max: 500 }).withMessage('Sĩ số phải từ 1 đến 500')
];

const listSectionValidator = [
  query('courseId')
    .optional({ nullable: true, checkFalsy: false })
    .custom((val) => {
      if (!val || val === '') return true; // empty = skip
      if (!mongoose.isValidObjectId(val)) throw new Error('courseId không hợp lệ');
      return true;
    }),
  query('semester').optional({ nullable: true, checkFalsy: false }).trim().isLength({ max: 50 }).withMessage('semester tối đa 50 ký tự')
];

module.exports = { createSectionValidator, updateSectionValidator, listSectionValidator };
