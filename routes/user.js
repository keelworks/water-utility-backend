const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = ['image/jpeg', 'image/png'];
    cb(null, types.includes(file.mimetype));
  }
});

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/upload-profile-picture', auth, upload.single('profile_picture'), uploadProfilePicture);

module.exports = router;