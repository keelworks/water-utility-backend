// services/userService.js
const { User, UserDetails, Address } = require("../models");
const sequelize = require("../config/db");
const admin = require("../config/firebaseAdmin");
const logger = require("../config/logger");

/**
 * Upsert the onboarding details and primary address for a logged-in user.
 *
 * @param {string} firebaseUid  The Firebase UID of the authenticated user.
 * @param {Object} data         The validated onboarding payload:
 *   {
 *     first_name,
 *     last_name,
 *     email,
 *     phone,
 *     address: {
 *       address_line_1,
 *       address_line_2,
 *       city,
 *       state_province,
 *       postal_code,
 *       country
 *     }
 *   }
 * @returns {Promise<{ userDetails: UserDetails, address: Address }>}
 */
async function upsertOnboarding(data) {
  // 1️⃣ Find the core User record
  const user = await User.findOne({ where: { email: data.email } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // 2️⃣ Begin transaction
  const transaction = await sequelize.transaction();

  try {
    // 3️⃣ Upsert UserDetails
    let userDetails = await UserDetails.findOne({
      where: { user_id: user.user_id },
      transaction,
    });

    const detailsPayload = {
      first_name: data.first_name,
      last_name: data.last_name,
      profile_picture_url: userDetails?.profile_picture_url || null,
      onboarding_completed_at: new Date(),
      role_specific_data: userDetails?.role_specific_data || {},
    };

    if (userDetails) {
      userDetails = await userDetails.update(detailsPayload, { transaction });
    } else {
      userDetails = await UserDetails.create(
        { user_id: user.user_id, ...detailsPayload },
        { transaction }
      );
    }

    // 4️⃣ Upsert primary Address
    let address = await Address.findOne({
      where: { user_detail_id: userDetails.user_detail_id, is_primary: true },
      transaction,
    });

    const addrPayload = {
      user_detail_id: userDetails.user_detail_id,
      address_line_1: data.address.address_line_1,
      address_line_2: data.address.address_line_2 || null,
      city: data.address.city,
      state_province: data.address.state_province,
      postal_code: data.address.postal_code,
      country: data.address.country || "United States",
      is_primary: true,
    };

    if (address) {
      address = await address.update(addrPayload, { transaction });
    } else {
      address = await Address.create(addrPayload, { transaction });
    }

    // 5️⃣ Commit
    await transaction.commit();
    return { userDetails, address };
  } catch (err) {
    // 6️⃣ Rollback on error
    await transaction.rollback();
    throw err;
  }
}

/**
 * Get user profile details including user info, details, address, and roles
 * @param {string} email - User's email from Firebase token
 * @returns {Promise<Object>} User profile data
 */
async function getUserProfile(email) {
  try {
    const user = await User.findOne({
      where: { email },
      include: [
        {
          association: "Roles",
          attributes: ["role_name"],
        },
        {
          association: "UserDetail",
          include: [
            {
              association: "Addresses",
              where: { is_primary: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // Extract role names
    const roles = user.Roles ? user.Roles.map((role) => role.role_name) : [];
    const primaryRole = roles.length > 0 ? roles[0] : null;

    // Get user details and primary address
    const userDetail = user.UserDetail;
    const primaryAddress =
      userDetail?.Addresses?.length > 0 ? userDetail.Addresses[0] : null;

    // Format address string
    let address = null;
    if (primaryAddress) {
      const addressParts = [
        primaryAddress.address_line_1,
        primaryAddress.address_line_2,
        primaryAddress.city,
        primaryAddress.state_province,
        primaryAddress.postal_code,
      ].filter(Boolean);
      address = addressParts.join(", ");
    }

    return {
      user_id: user.user_id,
      first_name: userDetail?.first_name || null,
      last_name: userDetail?.last_name || null,
      email: user.email,
      profile_picture: userDetail?.profile_picture_url || null,
      phone_number: user.phone_number,
      address: address,
      role: primaryRole,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile details including phone, address, and profile picture
 * @param {string} email - User's email from Firebase token
 * @param {Object} updateData - Profile data to update
 * @returns {Promise<Object>} Updated user profile data
 */
async function updateUserProfile(email, updateData) {
  const transaction = await sequelize.transaction();

  try {
    // Find the user first
    const user = await User.findOne({
      where: { email },
      include: [
        {
          association: "UserDetail",
          include: [
            {
              association: "Addresses",
              where: { is_primary: true },
              required: false,
            },
          ],
        },
      ],
      transaction,
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    if (updateData.first_name || updateData.last_name) {
      // Validate name formats if provided
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (updateData.first_name && !nameRegex.test(updateData.first_name)) {
        const err = new Error("Invalid first name format");
        err.statusCode = 400;
        throw err;
      }
      if (updateData.last_name && !nameRegex.test(updateData.last_name)) {
        const err = new Error("Invalid last name format");
        err.statusCode = 400;
        throw err;
      }
    }

    // Validate phone number format if provided
    if (updateData.phone_number) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (
        !phoneRegex.test(updateData.phone_number.replace(/[\s\-\(\)]/g, ""))
      ) {
        const err = new Error("Invalid phone number format");
        err.statusCode = 400;
        throw err;
      }
    }

    // Update user table (phone_number)
    const userUpdates = {};
    if (updateData.phone_number) {
      userUpdates.phone_number = updateData.phone_number;
    }

    if (Object.keys(userUpdates).length > 0) {
      await user.update(userUpdates, { transaction });
    }

    // Update user details (profile_picture, first_name, last_name)
    const userDetailUpdates = {};
    if (updateData.profile_picture) {
      userDetailUpdates.profile_picture_url = updateData.profile_picture;
    }
    if (updateData.first_name) {
      userDetailUpdates.first_name = updateData.first_name;
    }
    if (updateData.last_name) {
      userDetailUpdates.last_name = updateData.last_name;
    }

    if (Object.keys(userDetailUpdates).length > 0) {
      let userDetail = user.UserDetail;

      if (userDetail) {
        await userDetail.update(userDetailUpdates, { transaction });
      } else {
        // Create user details if they don't exist
        await UserDetails.create(
          {
            user_id: user.user_id,
            ...userDetailUpdates,
          },
          { transaction }
        );
      }
    }

    // Update address if provided (handle as object like onboarding)
    if (updateData.address) {
      const userDetail = user.UserDetail;
      if (userDetail) {
        const primaryAddress =
          userDetail.Addresses && userDetail.Addresses.length > 0
            ? userDetail.Addresses[0]
            : null;

        const addressPayload = {
          user_detail_id: userDetail.user_detail_id,
          address_line_1: updateData.address.address_line_1,
          address_line_2: updateData.address.address_line_2 || null,
          city: updateData.address.city,
          state_province: updateData.address.state_province,
          postal_code: updateData.address.postal_code,
          country: updateData.address.country || "United States",
          is_primary: true,
        };

        if (primaryAddress) {
          await primaryAddress.update(addressPayload, { transaction });
        } else {
          await Address.create(addressPayload, { transaction });
        }
      } else {
        // Create user details first, then address
        const newUserDetail = await UserDetails.create(
          { user_id: user.user_id },
          { transaction }
        );

        await Address.create(
          {
            user_detail_id: newUserDetail.user_detail_id,
            address_line_1: updateData.address.address_line_1,
            address_line_2: updateData.address.address_line_2 || null,
            city: updateData.address.city,
            state_province: updateData.address.state_province,
            postal_code: updateData.address.postal_code,
            country: updateData.address.country || "United States",
            is_primary: true,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Return the updated user profile
    return await getUserProfile(email);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Change user password using Firebase Authentication
 * @param {string} email - User's email from Firebase token
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
async function changeUserPassword(email, currentPassword, newPassword) {
  try {
    // Validate new password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      const err = new Error(
        "New password must be at least 8 characters long, with one uppercase letter, one number, and one special character"
      );
      err.statusCode = 400;
      throw err;
    }

    // Get user from database first
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // Verify current password by attempting to sign in with Firebase REST API
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
            password: currentPassword,
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

      const userUid = responseData.localId;

      // Update password using Firebase Admin SDK
      await admin.auth().updateUser(userUid, {
        password: newPassword,
      });

      logger.info(`Password updated successfully for user: ${email}`);
    } catch (error) {
      if (error.statusCode) {
        throw error; // Re-throw our custom errors
      }

      logger.error("Error changing password:", error);
      throw new Error("Failed to change password");
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  upsertOnboarding,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};
