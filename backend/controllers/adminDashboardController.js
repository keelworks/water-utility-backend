const {
  AdminActivity,
  AdminSettings,
  AdminNotification,
  User,
} = require("../models");
const { getSystemStats } = require("../services/adminService");

exports.getAdminActivities = async (req, res) => {
  try {
    const activities = await AdminActivity.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "email"],
        },
      ],
      order: [["timestamp", "DESC"]],
      limit: parseInt(req.query.limit) || 100,
    });
    return res.json(activities);
  } catch (error) {
    console.error("getAdminActivities error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.findAll({
      order: [["setting_key", "ASC"]],
    });
    return res.json(settings);
  } catch (error) {
    console.error("getAdminSettings error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateAdminSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Setting key is required" });
    }

    const [setting, created] = await AdminSettings.findOrCreate({
      where: { setting_key: key },
      defaults: {
        setting_value: value,
        updated_by: req.user.user_id,
      },
    });

    if (!created) {
      await setting.update({
        setting_value: value,
        updated_by: req.user.user_id,
        updated_at: new Date(),
      });
    }

    return res.json(setting);
  } catch (error) {
    console.error("updateAdminSetting error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.findAll({
      order: [["created_at", "DESC"]],
      limit: parseInt(req.query.limit) || 50,
    });
    return res.json(notifications);
  } catch (error) {
    console.error("getAdminNotifications error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await AdminNotification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notification.update({
      is_read: true,
      read_at: new Date(),
    });

    return res.json(notification);
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const stats = await getSystemStats();
    return res.json(stats);
  } catch (error) {
    console.error("getSystemStats error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.createAdminActivity = async (
  userData,
  actionType,
  resourceType,
  resourceId,
  details = {},
  ipAddress = null
) => {
  try {
    return await AdminActivity.create({
      user_id: userData.user_id,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error("Error creating admin activity log:", error);
    return null;
  }
};
