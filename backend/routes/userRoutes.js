const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const activityLogger = require("../middlewares/activityLogger");

// User routes
router.get("/", authMiddleware("admin"), userController.getUsers);
router.get("/:id", authMiddleware(), userController.getUser);
router.post(
  "/",
  authMiddleware("admin"),
  activityLogger("create", "user", null, (req) => ({ email: req.body.email })),
  userController.createUser
);
router.put(
  "/:id",
  authMiddleware(),
  activityLogger("update", "user", (req) => req.params.id),
  userController.updateUser
);
router.delete(
  "/:id",
  authMiddleware("admin"),
  activityLogger("delete", "user", (req) => req.params.id),
  userController.deleteUser
);

module.exports = router;
