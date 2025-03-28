// registerUser.js

const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const Role = require('../models/Role');
const sequelize = require('../config/db');
const logger = require('../config/logger'); // Assuming you have a logger here
const { NotFoundError, ValidationError } = require('../Errors');

async function registerUser({ email, password, phone, address, role }) {
  let transaction = null;
  let firebaseUid = null;
  
  try {
    // Start a transaction to ensure atomicity
    transaction = await sequelize.transaction();
    let userRecord = null;

    // 1️⃣ Create user in Firebase
    try {
      userRecord = await admin.auth().createUser({ email, password, phoneNumber: phone });
      logger.info(`User created in Firebase with email: ${userRecord.email}`);
    } catch (error) {
      logger.error(`Error creating user in Firebase: ${error.code}`);

      if (error.code === 'auth/email-already-exists') {
        userRecord = await admin.auth().getUserByEmail(email);
        logger.info(`Existing user fetched with email: ${email}`);
      } else {
        throw error;
      }
    }

    firebaseUid = userRecord.uid;
    const roles = [role];

    // 2️⃣ Set custom claims in Firebase
    await admin.auth().setCustomUserClaims(firebaseUid, { roles });

    // 3️⃣ Hash password locally (if storing it in DB)
    const passwordHash = 'PLACEHOLDER';

    // 4️⃣ Create user in 'users' table via Sequelize
    const user = await User.create(
      {
        firebase_uid: firebaseUid,
        email,
        password_hash: passwordHash,
        phone_number: phone,
        address,
      },
      { transaction }
    );

    // 5️⃣ Assign role in 'user_roles' (many-to-many association)
    const dbRole = await Role.findOne({ where: { role_name: role } });
    if (!dbRole) {
      throw new NotFoundError(`Role ${role} does not exist`);
    }
    await user.addRole(dbRole, { transaction });

    // ✅ Commit the transaction if everything is successful
    await transaction.commit();
    return user;

  } catch (error) {
    logger.error('registerUser error:', error);

    if (transaction) await transaction.rollback();

    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (firebaseError) {
        logger.error(`Failed to delete Firebase user: ${firebaseError.message}`);
      }
    }

    throw new Error(`User registration failed: ${error.message}`);
  }
}

module.exports = {registerUser};
