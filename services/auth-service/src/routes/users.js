const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyAccessJWT = require('../middleware/verifyAccessJWT');
const authorize = require('../middleware/authorize');

const adminOnly = [verifyAccessJWT, authorize('ADMIN')];

router.get('/stats', ...adminOnly, userController.getUserStats);
router.get('/', ...adminOnly, userController.listUsers);
router.get('/:id', ...adminOnly, userController.getUserById);
router.post('/', ...adminOnly, userController.createUser);
router.put('/:id', ...adminOnly, userController.updateUser);
router.delete('/:id', ...adminOnly, userController.deleteUser);
router.patch('/:id/toggle-status', ...adminOnly, userController.toggleStatus);
router.patch('/:id/reset-password', ...adminOnly, userController.resetPassword);
router.patch('/:id/assign-role', ...adminOnly, userController.assignRole);

module.exports = router;
