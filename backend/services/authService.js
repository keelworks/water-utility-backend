// services/authService.js
const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
// If you want password hashing, e.g. 'bcrypt':
// const bcrypt = require('bcrypt');

async function registerUser({ email, password, phone, address }) {
  // 1. Create user in Firebase
  const userRecord = await admin.auth().createUser({ email, password });
  const firebaseUid = userRecord.uid;

  // 2. Hash password locally if you want to store it:
  //    If you rely purely on Firebase for auth, you can store a placeholder.
  // const saltRounds = 10;
  // const passwordHash = await bcrypt.hash(password, saltRounds);
  const passwordHash = 'PLACEHOLDER'; // if purely using Firebase
  
  // 3. Create user in 'users' table via Sequelize
  const user = await User.create({
    firebase_uid: firebaseUid,
    email,
    password_hash: passwordHash,
    phone_number: phone,
    address
    // ...other fields
  });

  return user;
}

module.exports = {
  registerUser,
};
