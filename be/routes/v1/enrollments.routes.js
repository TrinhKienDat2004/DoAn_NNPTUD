const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const enrollmentsController = require('../../controllers/v1/enrollments.controller');
const { validateRequest } = require('../../utils/validateRequest');
const { createEnrollmentValidator, updateEnrollmentValidator } = require('../../validators/enrollments.validator');

router.use(authMiddleware);

// SV: tự đăng ký học phần của mình; ADMIN/GIANGVIEN: đăng ký thay
router.post('/', createEnrollmentValidator, validateRequest, enrollmentsController.create);
router.get('/', enrollmentsController.list);
router.get('/:id', enrollmentsController.getById);

// CHỉ ADMIN/GIANGVIEN mới được cập nhật/hủy enrollment
router.put('/:id', authorize({ roles: ['ADMIN', 'GIANGVIEN'] }), updateEnrollmentValidator, validateRequest, enrollmentsController.updateById);
router.delete('/:id', enrollmentsController.deleteById);

module.exports = router;
