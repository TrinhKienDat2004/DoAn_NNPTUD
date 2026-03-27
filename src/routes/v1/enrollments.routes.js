const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const enrollmentsController = require('../../controllers/v1/enrollments.controller');

router.use(authMiddleware);

router.get('/', enrollmentsController.list);
router.post('/', authorize({ permissions: ['enrollments:manage'] }), enrollmentsController.create);
router.get('/:id', enrollmentsController.getById);
router.put('/:id', authorize({ permissions: ['enrollments:manage'] }), enrollmentsController.updateById);
router.delete('/:id', authorize({ permissions: ['enrollments:manage'] }), enrollmentsController.deleteById);

module.exports = router;

