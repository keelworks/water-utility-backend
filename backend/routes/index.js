// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
//const technicianRoutes = require('./technicianRoutes'); // if applicable

// Mount route modules on appropriate paths
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
//router.use('/technician', technicianRoutes);

module.exports = router;
