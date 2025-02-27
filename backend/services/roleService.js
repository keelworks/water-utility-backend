// services/roleService.js
const admin = require('../config/firebaseAdmin');
const { User, Role } = require('../models');  // might do an index.js that exports all models

/**
 * Assign or remove a role for a user, then update Firebase custom claims
 * @param {string} firebaseUid
 * @param {string} roleName
 * @param {boolean} assign - if true, we add the role; if false, remove
 */
async function updateUserRoleAndClaims(firebaseUid, roleName, assign = true) {
  // 1. Find the user record
  const user = await User.findOne({ where: { firebase_uid: firebaseUid } });
  if (!user) throw new Error(`User with UID=${firebaseUid} not found in DB`);

  // 2. Find (or create) the role record
  let [role] = await Role.findOrCreate({
    where: { role_name: roleName.toLowerCase() },
    defaults: { role_name: roleName.toLowerCase() },
  });
  // (If you don't want to auto-create, just do Role.findOne({ where: { role_name } }))

  // 3. Assign or remove
  if (assign) {
    // user.addRole(role) uses the belongsToMany association
    await user.addRole(role);
  } else {
    await user.removeRole(role);
  }

  // 4. Now fetch *all* roles for that user
  const userWithRoles = await User.findOne({
    where: { user_id: user.user_id },
    include: [Role],
  });
  // userWithRoles.Roles is an array of role objects
  const allRoleNames = userWithRoles.Roles.map(r => r.role_name);

  // 5. Update Firebase custom claims
  await admin.auth().setCustomUserClaims(firebaseUid, {
    roles: allRoleNames,
  });

  return allRoleNames;  // return the updated list of roles
}

module.exports = { updateUserRoleAndClaims };
