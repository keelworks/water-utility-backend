const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AdminActivity = sequelize.define(
  "AdminActivity",
  {
    activity_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.ENUM(
        "create",
        "update",
        "delete",
        "login",
        "role_change",
        "settings_change"
      ),
      allowNull: false,
    },
    resource_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "admin_activities",
    timestamps: false,
  }
);

module.exports = AdminActivity;
