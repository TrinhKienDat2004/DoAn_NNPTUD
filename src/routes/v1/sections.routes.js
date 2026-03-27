const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const sectionsController = require('../../controllers/v1/sections.controller');

router.get('/', authMiddleware, sectionsController.list);
router.post('/', authMiddleware, authorize({ permissions: ['sections:manage'] }), sectionsController.create);
router.get('/:id', authMiddleware, sectionsController.getById);
router.put('/:id', authMiddleware, authorize({ permissions: ['sections:manage'] }), sectionsController.updateById);
router.delete('/:id', authMiddleware, authorize({ permissions: ['sections:manage'] }), sectionsController.deleteById);

module.exports = router;

