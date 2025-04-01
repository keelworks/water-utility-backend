const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AdminSettings = sequelize.define(
  "AdminSettings",
  {
    setting_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data_type: {
      type: DataTypes.ENUM("string", "number", "boolean", "json"),
      defaultValue: "string",
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_settings",
    timestamps: false,
  }
);

module.exports = AdminSettings;
