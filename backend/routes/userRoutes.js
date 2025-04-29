// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const validateOnboarding  = require('../validators/onboardingValidator');


router.post('/onboarding/user', authMiddleware(), validateOnboarding(), userController.submitOnboarding);

module.exports = router;
 