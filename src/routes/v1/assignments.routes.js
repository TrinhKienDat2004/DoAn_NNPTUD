const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { validateRequest } = require('../../utils/validateRequest');
const {
  createAssignmentValidator,
  updateAssignmentValidator,
  getAssignmentValidator
} = require('../../validators/assignments.validator');
const assignmentsController = require('../../controllers/v1/assignments.controller');

router.get('/', authMiddleware, assignmentsController.list);

router.post(
  '/',
  authMiddleware,
  authorize({ permissions: ['assignments:manage'] }),
  createAssignmentValidator,
  validateRequest,
  assignmentsController.create
);

// Get assignments by section (must come before /:id)
router.get('/section/:sectionId', authMiddleware, assignmentsController.getBySection);

router.get('/:id', authMiddleware, getAssignmentValidator, validateRequest, assignmentsController.getById);

router.put(
  '/:id',
  authMiddleware,
  authorize({ permissions: ['assignments:manage'] }),
  updateAssignmentValidator,
  validateRequest,
  assignmentsController.updateById
);

router.delete(
  '/:id',
  authMiddleware,
  authorize({ permissions: ['assignments:manage'] }),
  getAssignmentValidator,
  validateRequest,
  assignmentsController.deleteById
);

module.exports = router;

