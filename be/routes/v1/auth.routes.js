const express = require('express');
const router = express.Router();

const { register, login, changePassword } = require('../../controllers/v1/auth.controller');
const { registerValidator, loginValidator, changePasswordValidator } = require('../../validators/auth.validator');
const { validateRequest } = require('../../utils/validateRequest');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/change-password', authMiddleware, changePasswordValidator, validateRequest, changePassword);

module.exports = router;
