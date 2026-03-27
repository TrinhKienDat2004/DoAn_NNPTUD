const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const coursesController = require('../../controllers/v1/courses.controller');

router.get('/', authMiddleware, coursesController.list);
router.post('/', authMiddleware, authorize({ permissions: ['courses:manage'] }), coursesController.create);
router.get('/:id', authMiddleware, coursesController.getById);
router.put('/:id', authMiddleware, authorize({ permissions: ['courses:manage'] }), coursesController.updateById);
router.delete('/:id', authMiddleware, authorize({ permissions: ['courses:manage'] }), coursesController.deleteById);

module.exports = router;

