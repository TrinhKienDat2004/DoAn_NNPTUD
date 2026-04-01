const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const coursesController = require('../../controllers/v1/courses.controller');
const { validateRequest } = require('../../utils/validateRequest');
const { createCourseValidator, updateCourseValidator } = require('../../validators/courses.validator');

router.get('/', authMiddleware, coursesController.list);
router.get('/:id', authMiddleware, coursesController.getById);
router.post('/', authMiddleware, authorize({ roles: ['ADMIN', 'GIANGVIEN'] }), createCourseValidator, validateRequest, coursesController.create);
router.put('/:id', authMiddleware, authorize({ roles: ['ADMIN', 'GIANGVIEN'] }), updateCourseValidator, validateRequest, coursesController.updateById);
router.delete('/:id', authMiddleware, authorize({ roles: ['ADMIN'] }), coursesController.deleteById);

module.exports = router;
