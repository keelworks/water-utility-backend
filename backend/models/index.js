const User = require("./User");
const Role = require("./Role");
const AdminActivity = require("./AdminActivity");
const AdminSettings = require("./AdminSettings");
const AdminNotification = require("./AdminNotification");

// Define associations
User.belongsToMany(Role, {
  through: "user_roles",
  foreignKey: "user_id",
  otherKey: "role_id",
  timestamps: false,
});
Role.belongsToMany(User, {
  through: "user_roles",
  foreignKey: "role_id",
  otherKey: "user_id",
  timestamps: false,
});

// Admin activity associations
AdminActivity.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Admin notification associations
AdminNotification.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Admin settings associations
AdminSettings.belongsTo(User, {
  foreignKey: "updated_by",
  as: "updatedByUser",
});

module.exports = {
  User,
  Role,
  AdminActivity,
  AdminSettings,
  AdminNotification,
};
