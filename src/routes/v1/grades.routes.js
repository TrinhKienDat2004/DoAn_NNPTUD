const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { validateRequest } = require('../../utils/validateRequest');
const { createGradeValidator, updateGradeValidator, getGradeValidator } = require('../../validators/grades.validator');
const gradesController = require('../../controllers/v1/grades.controller');

router.get('/', authMiddleware, gradesController.list);

// Grade a submission endpoint
router.patch(
  '/submission/:submissionId',
  authMiddleware,
  authorize({ permissions: ['grades:manage'] }),
  gradesController.gradeSubmission
);

router.post(
  '/',
  authMiddleware,
  authorize({ permissions: ['grades:manage'] }),
  createGradeValidator,
  validateRequest,
  gradesController.create
);

router.get('/:id', authMiddleware, getGradeValidator, validateRequest, gradesController.getById);

router.put(
  '/:id',
  authMiddleware,
  authorize({ permissions: ['grades:manage'] }),
  updateGradeValidator,
  validateRequest,
  gradesController.updateById
);

router.delete(
  '/:id',
  authMiddleware,
  authorize({ permissions: ['grades:manage'] }),
  getGradeValidator,
  validateRequest,
  gradesController.deleteById
);

module.exports = router;

