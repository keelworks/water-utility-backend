// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

//Consumer routes
router.get('/welcome', passport.authenticate('jwt', { session: false }), // Authenticate via Firebase JWT
(req, res) => {
  res.json({ message: 'Welcome to the protected route!' });
});

module.exports = router;
