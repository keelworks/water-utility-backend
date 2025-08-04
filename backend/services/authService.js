// registerUser.js

const admin = require("../config/firebaseAdmin");
const User = require("../models/User");
const Role = require("../models/Role");
const sequelize = require("../config/db");
const logger = require("../config/logger"); // Assuming you have a logger here
const { NotFoundError, ValidationError } = require("../Errors");
const WaterService = require("../models/WaterService"); // Assuming you have a WaterService model

async function registerUser({ email, password, phone, address, role }) {
  let transaction = null;
  let firebaseUid = null;

  try {
    // Start a transaction to ensure atomicity
    transaction = await sequelize.transaction();
    let userRecord = null;

    // 1️⃣ Create user in Firebase
    try {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        const err = new Error(
          "New password must be at least 8 characters long, with one uppercase letter, one number, and one special character"
        );
        err.statusCode = 400;
        throw err;
      }
      userRecord = await admin
        .auth()
        .createUser({ email, password, phoneNumber: phone });
      logger.info(`User created in Firebase with email: ${userRecord.email}`);
    } catch (error) {
      logger.error(`Error creating user in Firebase: ${error.code}`);

      if (error.code === "auth/email-already-exists") {
        userRecord = await admin.auth().getUserByEmail(email);
        logger.info(`Existing user fetched with email: ${email}`);
      } else {
        throw error;
      }
    }

    firebaseUid = userRecord.uid;
    const roles = [role];

    // 2️⃣ Hash password locally (if storing it in DB)
    const passwordHash = "PLACEHOLDER";

    // 3️⃣ Create user in 'users' table via Sequelize
    const user = await User.create(
      {
        email,
        password_hash: passwordHash,
        phone_number: phone,
        address,
      },
      { transaction }
    );

    // 4️⃣Set custom claims in Firebase
    await admin
      .auth()
      .setCustomUserClaims(firebaseUid, { roles, user: user.user_id });

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
    logger.error("registerUser error:", error);

    if (transaction) await transaction.rollback();

    if (firebaseUid) {
      try {
        await admin.auth().deleteUser(firebaseUid);
      } catch (firebaseError) {
        logger.error(
          `Failed to delete Firebase user: ${firebaseError.message}`
        );
      }
    }

    throw new Error(`User registration failed: ${error.message}`);
  }
}

async function signInUser({ email, password }) {
  const firebaseWebApiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!firebaseWebApiKey) {
    throw new Error("Firebase Web API Key not configured");
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseWebApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      if (
        responseData.error?.message === "INVALID_PASSWORD" ||
        responseData.error?.message === "INVALID_LOGIN_CREDENTIALS"
      ) {
        const err = new Error("Incorrect current password");
        err.statusCode = 401;
        throw err;
      }
      throw new Error("Failed to verify current password");
    }

    const firebaseToken = responseData.idToken;

    const user = await User.findOne({
      where: { email: email },
      include: ["Roles"],
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    await user.update({
      last_login_at: new Date(),
      status: "active",
    });

    return {
      idToken: firebaseToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        phone_number: user.phone_number,
        status: user.status,
        last_login_at: user.last_login_at,
      },
    };
  } catch (error) {
    logger.error("signInUser error:", error);

    if (error.code === "auth/id-token-expired") {
      throw new Error("Token expired");
    }
    if (error.code === "auth/invalid-id-token") {
      throw new Error("Invalid token");
    }

    throw new Error(`Sign in failed: ${error.message}`);
  }
}

async function getWaterServices() {
  try {
    const waterServices = await WaterService.findAll();
    return waterServices;
  } catch (error) {
    logger.error("Error fetching water services:", error);
    throw new Error("Error fetching water services");
  }
}

module.exports = { registerUser, getWaterServices, signInUser };
