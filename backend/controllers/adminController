// controllers/adminController.js
const { updateUserRoleAndClaims } = require('../services/roleService');

exports.updateUserRole = async (req, res) => {
  try {
    const { firebaseUid, roleName, assign } = req.body;
    if (!firebaseUid || !roleName) {
      return res.status(400).json({ error: 'Missing firebaseUid or roleName' });
    }
    if(assign === false) {
      const updatedRoles = await updateUserRoleAndClaims(firebaseUid, roleName, false);
      return res.json({
        message: 'Role removed',
        roles: updatedRoles,
      });
    } else {
      const updatedRoles = await updateUserRoleAndClaims(firebaseUid, roleName, true);
      return res.json({
        message: 'Role updated',
        roles: updatedRoles,
      });
    }
    
  } catch (error) {
    console.error('assignRole error:', error);
    return res.status(500).json({ error: error.message });
  }
};
