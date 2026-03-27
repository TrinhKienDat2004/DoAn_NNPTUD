const express = require('express');
const router = express.Router();

const { register, login } = require('../../controllers/v1/auth.controller');
const { registerValidator, loginValidator } = require('../../validators/auth.validator');
const { validateRequest } = require('../../utils/validateRequest');

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);

module.exports = router;

