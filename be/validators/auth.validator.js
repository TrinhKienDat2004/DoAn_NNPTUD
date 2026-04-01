const { body } = require('express-validator');

const registerValidator = [
  body('username').isString().trim().isLength({ min: 3, max: 50 }).withMessage('username invalid'),
  body('email').isEmail().withMessage('email invalid'),
  body('password').isString().isLength({ min: 6, max: 100 }).withMessage('password invalid'),
  body('roleName').optional().isString().withMessage('roleName invalid')
];

const loginValidator = [
  body('email').isEmail().withMessage('email invalid'),
  body('password').isString().notEmpty().withMessage('password required')
];

const changePasswordValidator = [
  body('oldPassword').isString().notEmpty().withMessage('oldPassword required'),
  body('newPassword').isString().isLength({ min: 6, max: 100 }).withMessage('newPassword invalid, min 6 chars')
];

module.exports = { registerValidator, loginValidator, changePasswordValidator };

