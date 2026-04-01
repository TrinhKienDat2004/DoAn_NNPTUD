const { body, param } = require('express-validator');

const createCourseValidator = [
  body('code')
    .trim().notEmpty().withMessage('Mã môn học là bắt buộc')
    .isLength({ max: 20 }).withMessage('Mã môn học tối đa 20 ký tự'),
  body('title')
    .trim().notEmpty().withMessage('Tên môn học là bắt buộc')
    .isLength({ max: 200 }).withMessage('Tên môn học tối đa 200 ký tự'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Mô tả tối đa 2000 ký tự'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Loại môn học tối đa 100 ký tự')
];

const updateCourseValidator = [
  param('id').isMongoId().withMessage('ID không hợp lệ'),
  body('code').optional().trim().isLength({ min: 1, max: 20 }).withMessage('Mã môn học 1-20 ký tự'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Tên môn học 1-200 ký tự'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Mô tả tối đa 2000 ký tự'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Loại môn học tối đa 100 ký tự')
];

module.exports = { createCourseValidator, updateCourseValidator };
