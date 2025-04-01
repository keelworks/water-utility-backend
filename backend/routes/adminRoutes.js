// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminDashboardController = require("../controllers/adminDashboardController");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

// Admin dashboard routes - all require admin role
router.get(
  "/activities",
  authMiddleware("admin"),
  adminDashboardController.getAdminActivities
);
router.get(
  "/settings",
  authMiddleware("admin"),
  adminDashboardController.getAdminSettings
);
router.put(
  "/settings",
  authMiddleware("admin"),
  adminDashboardController.updateAdminSetting
);
router.get(
  "/notifications",
  authMiddleware("admin"),
  adminDashboardController.getAdminNotifications
);
router.put(
  "/notifications/:id/read",
  authMiddleware("admin"),
  adminDashboardController.markNotificationAsRead
);
router.get(
  "/stats",
  authMiddleware("admin"),
  adminDashboardController.getSystemStats
);

// Existing admin user role management route
router.put(
  "/update-role",
  authMiddleware("admin"),
  adminController.updateUserRole
);

module.exports = router;
