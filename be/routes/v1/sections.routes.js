const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const sectionsController = require('../../controllers/v1/sections.controller');
const { validateRequest } = require('../../utils/validateRequest');
const { createSectionValidator, updateSectionValidator, listSectionValidator } = require('../../validators/sections.validator');

router.get('/', authMiddleware, listSectionValidator, validateRequest, sectionsController.list);
router.get('/:id', authMiddleware, sectionsController.getById);
router.post('/', authMiddleware, authorize({ roles: ['ADMIN', 'GIANGVIEN'] }), createSectionValidator, validateRequest, sectionsController.create);
router.put('/:id', authMiddleware, authorize({ roles: ['ADMIN', 'GIANGVIEN'] }), updateSectionValidator, validateRequest, sectionsController.updateById);
router.delete('/:id', authMiddleware, authorize({ roles: ['ADMIN'] }), sectionsController.deleteById);

module.exports = router;
