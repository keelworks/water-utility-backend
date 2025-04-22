// services/userService.js
const { User, UserDetails, Address, sequelize } = require('../models');

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
async function upsertOnboarding(firebaseUid, data) {
  // 1️⃣ Find the core User record
  const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // 2️⃣ Begin transaction
  const transaction = await sequelize.transaction();

  try {
    // 3️⃣ Upsert UserDetails
    let userDetails = await UserDetails.findOne({
      where: { user_id: user.user_id },
      transaction
    });

    const detailsPayload = {
      first_name: data.first_name,
      last_name: data.last_name,
      profile_picture_url: userDetails?.profile_picture_url || null,
      onboarding_completed_at: new Date(),
      role_specific_data: userDetails?.role_specific_data || {}
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
      where: { user_id: userDetails.user_detail_id, is_primary: true },
      transaction
    });

    const addrPayload = {
      user_id: userDetails.user_detail_id,
      address_line_1: data.address.address_line_1,
      address_line_2: data.address.address_line_2 || null,
      city: data.address.city,
      state_province: data.address.state_province,
      postal_code: data.address.postal_code,
      country: data.address.country || 'United States',
      is_primary: true
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

module.exports = {
  upsertOnboarding
};
