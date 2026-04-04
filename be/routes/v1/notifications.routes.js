const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const notificationsController = require('../../controllers/v1/notifications.controller');

router.use(authMiddleware);

router.get('/', notificationsController.list);
router.post('/', notificationsController.create);
router.patch('/read-all', notificationsController.markAllAsRead); 
router.get('/:id', notificationsController.getById);
router.put('/:id', notificationsController.updateById);
router.patch('/:id/read', notificationsController.markAsRead);    
router.delete('/:id', notificationsController.deleteById);

module.exports = router;

