const passport = require('passport');

module.exports = ((req, res, next) => {
  if (req.path.startsWith('/api/auth/signup')) {
    return next();
  }
  
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('[ERROR] Passport error:', err);
      return next(err);
    }
    if (!user) {
      console.warn('[WARNING] No user found in request.');
    } else {
      console.log('[DEBUG] Authenticated user:', user);
      req.user = user;
    }
    next();
  })(req, res, next);
});