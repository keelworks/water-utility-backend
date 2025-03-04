// controllers/authController.js
const { registerUser } = require('../services/authService');
const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

/**
 * POST /api/auth/signup
 * Body: { email, password, phone, address }
 */
exports.signUp = async (req, res) => {
  try {
    const { email, password, phone, address, roles } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const newUser = await registerUser({ email, password, phone, address, roles });
    return res.json({ message: 'Signup successful', user: newUser });
  } catch (error) {
    console.error('signUp error:', error);
    return res.status(500).json({ error: error.message });
  }
};


