const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const gradesController = require('../../controllers/v1/grades.controller');

router.get('/', authMiddleware, gradesController.list);
router.post('/', authMiddleware, authorize({ permissions: ['grades:manage'] }), gradesController.create);
router.get('/:id', authMiddleware, gradesController.getById);
router.put('/:id', authMiddleware, authorize({ permissions: ['grades:manage'] }), gradesController.updateById);
router.delete('/:id', authMiddleware, authorize({ permissions: ['grades:manage'] }), gradesController.deleteById);

// Add route for student to view their grades
router.get('/user/me', authMiddleware, gradesController.list);

module.exports = router;

