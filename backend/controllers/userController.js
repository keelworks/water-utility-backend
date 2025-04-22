// controllers/onboardingController.js
const { upsertOnboarding } = require('../services/userService');

exports.submitOnboarding = async (req, res) => {
  const firebaseUid = req.user?.uid;
  if (!firebaseUid) {
    return res.status(401).json({ success: false, error: 'User not authenticated' });
  }

  try {
    const { userDetails, address } = await upsertOnboarding(firebaseUid, req.body);
    return res.status(200).json({ success: true, user_details: userDetails, address });
  } catch (err) {
    console.error('submitOnboarding error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message || 'Internal error' });
  }
};