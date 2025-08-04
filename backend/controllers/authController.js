// controllers/authController.js
const {
  registerUser,
  getWaterServices,
  signInUser,
} = require("../services/authService");
const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

/**
 * POST /api/auth/signup
 * Body: { email, password, phone, address }
 */
exports.signUp = async (req, res) => {
  try {
    const { email, password, phone, address, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const newUser = await registerUser({
      email,
      password,
      phone,
      address,
      role,
    });
    return res.json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("signUp error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await signInUser({ email, password });

    return res.json({
      message: "Sign in successful",
      idToken: result.idToken,
      user: result.user,
    });
  } catch (error) {
    console.log("signIn error: ", error);

    if (error.message.includes("Token expired")) {
      return res.status(401).json({
        error: "Token expired, please sign in again",
      });
    }

    if (error.message.includes("Invalid token")) {
      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }

    if (error.message.includes("User not found")) {
      return res.status(404).json({
        error: "User not found in system",
      });
    }

    return res.status(500).json({ error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const waterServices = await getWaterServices();
    return res.json({
      message: "Water services fetched successfully",
      waterServices,
    });
  } catch (error) {
    console.error("getServices error:", error);
    return res.status(500).json({ error: error.message });
  }
};
