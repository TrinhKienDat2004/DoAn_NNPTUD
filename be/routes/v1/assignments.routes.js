const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const assignmentsController = require('../../controllers/v1/assignments.controller');

router.get('/', authMiddleware, assignmentsController.list);
router.post('/', authMiddleware, authorize({ permissions: ['assignments:manage'] }), assignmentsController.create);
router.get('/:id', authMiddleware, assignmentsController.getById);
router.put('/:id', authMiddleware, authorize({ permissions: ['assignments:manage'] }), assignmentsController.updateById);
router.delete('/:id', authMiddleware, authorize({ permissions: ['assignments:manage'] }), assignmentsController.deleteById);

module.exports = router;

