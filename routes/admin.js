const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

router.get('/users', auth, getAllUsers);

module.exports = router;