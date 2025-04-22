// validators/onboardingValidator.js

// Very basic email regex (you may swap in a more robust one if needed)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// US phone regex: (123) 456‑7890 or 123‑456‑7890 or 123.456.7890 or 1234567890
const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

function validateOnboarding(req, res, next) {
  const {
    first_name,
    last_name,
    email,
    phone,
    address
  } = req.body;

  const errors = [];

  if (!first_name || typeof first_name !== 'string') {
    errors.push('First name is required');
  }
  if (!last_name || typeof last_name !== 'string') {
    errors.push('Last name is required');
  }
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email is required');
  }
  if (!phone || !phoneRegex.test(phone)) {
    errors.push('A valid US mobile phone number is required');
  }

  if (
    !address ||
    typeof address !== 'object' ||
    !address.address_line_1 ||
    !address.city ||
    !address.state_province ||
    !address.postal_code
  ) {
    errors.push('Complete address (line1, city, state, postal code) is required');
  } else {
    // postal_code: 5 digits
    if (!/^\d{5}$/.test(address.postal_code)) {
      errors.push('Postal code must be 5 digits');
    }
  }

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  // everything looks good
  next();
}

module.exports = { validateOnboarding };
