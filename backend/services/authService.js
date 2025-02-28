// services/authService.js
const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const Role = require('../models/Role');
// If you want password hashing, e.g. 'bcrypt':
// const bcrypt = require('bcrypt');

// roles = ['consumer'] is a default value
async function registerUser({ email, password, phone, address, roles = ['consumer'] }) {
  // 1. Create user in Firebase
  const userRecord = await admin.auth().createUser({ email, password });
  const firebaseUid = userRecord.uid;

  // Correct way to set custom claims:
  await admin.auth().setCustomUserClaims(firebaseUid, { roles });

  // 2. Hash password locally if you want to store it:
  // If relying purely on Firebase for auth, you can store a placeholder.
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
  // The association: User.belongsToMany(Role, { through: 'user_roles' })
  const role = await Role.findOne({ where: { role_name: 'consumer' } });
  if (role) {
    await user.addRole(role);
  }


  return user;
}

module.exports = {
  registerUser,
};
