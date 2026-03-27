const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { submissionUpload, makeFileUrl } = require('../../middlewares/upload.middleware');
const submissionsController = require('../../controllers/v1/submissions.controller');

router.get('/', authMiddleware, submissionsController.list);
router.get('/:id', authMiddleware, submissionsController.getById);

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

router.put('/:id', authMiddleware, authorize({ permissions: ['submissions:manage'] }), submissionsController.updateById);
router.delete('/:id', authMiddleware, authorize({ permissions: ['submissions:manage'] }), submissionsController.deleteById);

module.exports = router;

