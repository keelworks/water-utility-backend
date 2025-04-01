// services/adminService.js
const { Op } = require("sequelize");
const { AdminSettings, AdminNotification, User } = require("../models");

async function getSetting(key, defaultValue = null) {
  try {
    const setting = await AdminSettings.findOne({
      where: { setting_key: key },
    });

    if (!setting) {
      return defaultValue;
    }

    // Convert the value based on data_type
    switch (setting.data_type) {
      case "number":
        return parseFloat(setting.setting_value);
      case "boolean":
        return setting.setting_value === "true";
      case "json":
        return JSON.parse(setting.setting_value);
      default:
        return setting.setting_value;
    }
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
}

async function createNotification(
  title,
  message,
  severity = "info",
  userId = null,
  link = null
) {
  try {
    return await AdminNotification.create({
      title,
      message,
      severity,
      user_id: userId,
      link,
    });
  } catch (error) {
    console.error("Error creating admin notification:", error);
    return null;
  }
}

async function getSystemStats() {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: "active" } });
    const inactiveUsers = await User.count({ where: { status: "inactive" } });

    // Calculate user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error getting system stats:", error);
    throw error;
  }
}

module.exports = {
  getSetting,
  createNotification,
  getSystemStats,
};
