const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  verifyAccessToken,
  verifyRefreshToken,
} = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshAccessToken);

// Protected Routes (Requires Access Token)
router.get("/me", verifyAccessToken, authController.getCurrentUser);
router.put("/profile", verifyAccessToken, authController.updateProfile);
router.post(
  "/change-password",
  verifyAccessToken,
  authController.changePassword,
);
router.post("/logout", verifyAccessToken, authController.logout);
router.post("/logout-all", verifyAccessToken, authController.logoutAllDevices);

module.exports = router;
