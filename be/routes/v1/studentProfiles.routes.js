const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const studentProfilesController = require('../../controllers/v1/studentProfiles.controller');

router.use(authMiddleware);

// For rubric simplicity: only ADMIN manages student profiles in this starter.
router.get('/', authorize({ roles: ['ADMIN'] }), studentProfilesController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), studentProfilesController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), studentProfilesController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), studentProfilesController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), studentProfilesController.deleteById);

module.exports = router;

