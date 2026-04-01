const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { documentUpload, makeFileUrl } = require('../../middlewares/upload.middleware');
const documentsController = require('../../controllers/v1/documents.controller');

router.get('/', authMiddleware, documentsController.list);
router.get('/:id', authMiddleware, documentsController.getById);

router.post(
  '/',
  authMiddleware,
  authorize({ permissions: ['documents:upload'] }),
  documentUpload,
  (req, res, next) => {
    if (req.file) req.fileUrl = makeFileUrl('documents', req.file.filename);
    next();
  },
  documentsController.create
);

router.put('/:id', authMiddleware, authorize({ permissions: ['documents:upload'] }), documentsController.updateById);
router.delete('/:id', authMiddleware, authorize({ permissions: ['documents:upload'] }), documentsController.deleteById);

module.exports = router;

