// config/passport.js
const passport = require('passport');
const { ExtractJwt } = require('passport-jwt');
const { Strategy: JwtStrategy } = require('passport-jwt');
const admin = require('./firebaseAdmin'); // Your Firebase Admin SDK
const { User } = require('../models');
const { Role } = require('../models');
const jwksRsa = require("jwks-rsa");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKeyProvider: jwksRsa.passportJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`,
  }),
  algorithms: ["RS256"], // Firebase always uses RS256
  issuer: `https://securetoken.google.com/keelworks-water-utility`,
  audience: "keelworks-water-utility",
};

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      // Fetch the Firebase user using the 'sub' from the JWT payload
      const firebaseUser = await admin.auth().getUser(payload.sub);
      
      if (!firebaseUser) {
        console.log("No matching Firebase user for sub:", payload.sub);
        return done(null, false); // User not found in Firebase
      }

      // Check if the user exists in the database by email
      const user = await User.findOne({
        where: { email: firebaseUser.email },
        include: [Role], // Including roles
      });
      
      if (!user) {
        console.log("No matching user in DB for email:", firebaseUser.email);
        return done(null, false); // User not found in DB
      }

      // Get the roles associated with the user
      const userRoles = await user.getRoles();
      
      const fbRoles = firebaseUser.customClaims.roles
      

      // Check if the user has the all role in the roles array
      const hasAdminRole = userRoles.some(role => fbRoles.includes(role.role_name));
      

      if (!hasAdminRole) {
        console.log("User roles are inconsistent.");
        return done(null, false); // User does not have the 'admin' role
      }

      // Return the user in a format compatible with express-acl
      const aclUser = {
        firebaseUid: user.firebase_uid,
        email: user.email,
        roles: fbRoles, // Assuming 'role_name' holds the role
      };
      

            // Successful authentication
      return done(null, aclUser);

    } catch (error) {
      console.error("Error during authentication:", error);
      return done(error, false); // Handle errors
    }
  })
);

module.exports = passport;
