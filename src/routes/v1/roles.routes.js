const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');

const rolesController = require('../../controllers/v1/roles.controller');

router.use(authMiddleware);

router.get('/', authorize({ roles: ['ADMIN'] }), rolesController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), rolesController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), rolesController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), rolesController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), rolesController.deleteById);

module.exports = router;

