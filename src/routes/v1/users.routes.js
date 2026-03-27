const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { avatarUpload, makeFileUrl } = require('../../middlewares/upload.middleware');

const usersController = require('../../controllers/v1/users.controller');

router.use(authMiddleware);

// Avatar upload (user self or ADMIN)
router.post(
  '/:id/avatar',
  avatarUpload,
  (req, res, next) => {
    if (req.file) req.fileUrl = makeFileUrl('avatars', req.file.filename);
    next();
  },
  usersController.uploadAvatar
);

router.get('/', authorize({ permissions: ['users:manage'] }), usersController.list);
router.post('/', authorize({ permissions: ['users:manage'] }), usersController.create);
router.get('/:id', authorize({ permissions: ['users:manage'] }), usersController.getById);
router.put('/:id', authorize({ permissions: ['users:manage'] }), usersController.updateById);
router.delete('/:id', authorize({ permissions: ['users:manage'] }), usersController.deleteById);

module.exports = router;

