// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/signup', authController.signUp);
//router.post('/verify-otp', authController.verifyOtp);

// Protected admin route - only an admin can update roles
router.put('/admin/update-role', authMiddleware('admin'), adminController.updateUserRole);

router.get('/welcome', authMiddleware(), (req, res) => {
  res.json({ message: 'Welcome to the protected route!' });
});

module.exports = router;
