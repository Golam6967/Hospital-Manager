const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyAccessJWT = require('../middleware/verifyAccessJWT');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', verifyAccessJWT, authController.logout);
router.post('/logout-all', verifyAccessJWT, authController.logoutAll);
router.get('/me', verifyAccessJWT, authController.getMe);
router.put('/profile', verifyAccessJWT, authController.updateProfile);
router.post('/change-password', verifyAccessJWT, authController.changePassword);

module.exports = router;
