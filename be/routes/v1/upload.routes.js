console.log('UPLOAD ROUTES LOADED');
const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { avatarUpload, documentUpload, submissionUpload } = require('../../middlewares/upload.middleware');
const { uploadFile } = require('../../controllers/v1/upload.controller');

// Yêu cầu đăng nhập mới được upload file
router.use(authMiddleware);

// API upload Avatar (dùng key 'avatar' trong form-data)
router.post('/avatar', avatarUpload, uploadFile);

// API upload Tài liệu khoá học (dùng key 'file')
router.post('/document', documentUpload, uploadFile);

// API upload Bài nộp của sinh viên (dùng key 'file')
router.post('/submission', submissionUpload, uploadFile);

module.exports = router;