// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const passport = require('passport');
const acl = require('../config/acl');

// Protected admin route - only an admin can update roles
router.put(
  '/update-role', 
  passport.authenticate('jwt', { session: false }), adminController.updateUserRole);

/*passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log('req.user:', req.user);
  console.log('req.user.role:', req.user.roles);
  if (!req.user.roles.includes('admin')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }*/

module.exports = router;
