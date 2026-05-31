const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  verifyAccessToken,
  authorize,
} = require("../middleware/authMiddleware");

// All user management routes require authentication and admin role
router.use(verifyAccessToken);
router.use(authorize("admin"));

// User Management Routes
router.get("/", userController.getAllUsers);
router.get("/stats", userController.getUserStats);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/:id/toggle-status", userController.toggleUserStatus);
router.patch("/:id/reset-password", userController.resetUserPassword);
router.patch("/:id/assign-role", userController.assignRole);

module.exports = router;
