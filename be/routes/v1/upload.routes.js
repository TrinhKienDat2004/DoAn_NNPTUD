const express = require('express');
const router = express.Router();
const uploadController = require('../../controllers/v1/upload.controller');
const { avatarUpload, documentUpload } = require('../../middlewares/upload.middleware');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/avatar', avatarUpload, uploadController.uploadFile);
router.post('/document', documentUpload, uploadController.uploadFile);

module.exports = router;