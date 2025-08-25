// controllers/onboardingController.js
const {
  upsertOnboarding,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} = require("../services/userService");

exports.submitOnboarding = async (req, res) => {
  try {
    const { userDetails, address } = await upsertOnboarding(req.body);
    return res
      .status(200)
      .json({ success: true, user_details: userDetails, address });
  } catch (err) {
    console.error("submitOnboarding error:", err);
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({ success: false, error: err.message || "Internal error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Extract email from the decoded Firebase token (set by authMiddleware)
    const userEmail = req.user.email;

    const profile = await getUserProfile(userEmail);

    return res.status(200).json({
      message: "Successfully retrived profile",
      profile: profile,
    });
  } catch (err) {
    console.error("getProfile error:", err);
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({ error: err.message || "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Extract email from the decoded Firebase token (set by authMiddleware)
    const userEmail = req.user.email;
    const updateData = req.body;

    // Validate that at least one field is provided for update
    if (
      !updateData.profile_picture &&
      !updateData.phone_number &&
      !updateData.address &&
      !updateData.first_name &&
      !updateData.last_name
    ) {
      return res.status(400).json({
        error:
          "At least one field (profile_picture, phone_number, address, first_name, last_name) is required for update",
      });
    }

    const updatedProfile = await updateUserProfile(userEmail, updateData);

    return res.status(200).json({
      message: "Successfully updated profile",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({ error: err.message || "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Extract email from the decoded Firebase token (set by authMiddleware)
    const userEmail = req.user.email;
    const { current_password, new_password } = req.body;

    // Validate required fields
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: "Both current_password and new_password are required",
      });
    }

    // Call service to change password
    await changeUserPassword(userEmail, current_password, new_password);

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("changePassword error:", err);
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({ error: err.message || "Internal server error" });
  }
};
