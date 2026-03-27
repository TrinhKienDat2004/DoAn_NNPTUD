const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const teacherProfilesController = require('../../controllers/v1/teacherProfiles.controller');

router.use(authMiddleware);

// For rubric simplicity: only ADMIN manages teacher profiles in this starter.
router.get('/', authorize({ roles: ['ADMIN'] }), teacherProfilesController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), teacherProfilesController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), teacherProfilesController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), teacherProfilesController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), teacherProfilesController.deleteById);

module.exports = router;

