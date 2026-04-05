const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { submissionUpload, makeFileUrl } = require('../../middlewares/upload.middleware');
const { validateRequest } = require('../../utils/validateRequest');
const {
  submitAssignmentValidator,
  getSubmissionValidator,
  updateSubmissionValidator
} = require('../../validators/submissions.validator');
const submissionsController = require('../../controllers/v1/submissions.controller');

router.get('/', authMiddleware, submissionsController.list);

// Student submits assignment with deadline check
router.post(
  '/assignment/:assignmentId/submit',
  authMiddleware,
  authorize({ permissions: ['submissions:manage'] }),
  submissionUpload,
  (req, res, next) => {
    if (req.file) req.fileUrl = makeFileUrl('submissions', req.file.filename);
    next();
  },
  submitAssignmentValidator,
  validateRequest,
  submissionsController.submit
);

// Get submissions for an assignment (instructor view)
router.get('/assignment/:assignmentId', authMiddleware, submissionsController.getByAssignment);

// Get single submission
router.get('/:id', authMiddleware, getSubmissionValidator, validateRequest, submissionsController.getById);

// Admin create/update submissions
router.post(
  '/',
  authMiddleware,
  authorize({ permissions: ['submissions:manage'] }),
  submissionUpload,
  (req, res, next) => {
    if (req.file) req.fileUrl = makeFileUrl('submissions', req.file.filename);
    next();
  },
  submissionsController.create
);

router.put(
  '/:id',
  authMiddleware,
  authorize({ permissions: ['submissions:manage'] }),
  updateSubmissionValidator,
  validateRequest,
  submissionsController.updateById
);

router.delete(
  '/:id',
  authMiddleware,
  authorize({ permissions: ['submissions:manage'] }),
  getSubmissionValidator,
  validateRequest,
  submissionsController.deleteById
);

module.exports = router;

