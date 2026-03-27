const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const permissionsController = require('../../controllers/v1/permissions.controller');

router.use(authMiddleware);

router.get('/', authorize({ roles: ['ADMIN'] }), permissionsController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), permissionsController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), permissionsController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), permissionsController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), permissionsController.deleteById);

module.exports = router;

