// middlewares/authMiddleware.js
const admin = require("../config/firebaseAdmin");

function authMiddleware(requiredRole = "consumer") {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || "";
      const [scheme, token] = authHeader.split(" ");
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Unauthorized - Missing token" });
      }

      // Verify the token with Firebase
      const decoded = await admin.auth().verifyIdToken(token);
      console.log("Custom Claims:", decoded);
      req.user = decoded; // e.g. { uid: ..., email: ..., role: 'admin' }

      const userRoles = decoded.roles || [];
      if (!userRoles.includes(requiredRole)) {
        return res
          .status(403)
          .json({ error: `Forbidden - Requires role: ${requiredRole}` });
      }

      next();
    } catch (err) {
      console.error("authMiddleware error:", err);

      // Handle specific Firebase auth errors
      if (err.code === "auth/id-token-expired") {
        return res.status(401).json({
          error: "Token expired",
          code: "TOKEN_EXPIRED",
          message:
            "Please refresh your token using the /api/auth/refresh endpoint",
        });
      }

      if (err.code === "auth/invalid-id-token") {
        return res.status(401).json({
          error: "Invalid token",
          code: "INVALID_TOKEN",
        });
      }

      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = authMiddleware;
