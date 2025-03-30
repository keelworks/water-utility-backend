const {
  createAdminActivity,
} = require("../controllers/adminDashboardController");

const activityLogger = (
  actionType,
  resourceType,
  getResourceId = (req) => null,
  getDetails = (req) => ({})
) => {
  return async (req, res, next) => {
    // Save original end method
    const originalEnd = res.end;

    // Override end method
    res.end = async function (chunk, encoding) {
      // Restore original end
      res.end = originalEnd;

      // Only log for successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const resourceId =
            typeof getResourceId === "function"
              ? getResourceId(req)
              : getResourceId;
          const details =
            typeof getDetails === "function" ? getDetails(req) : getDetails;

          // Log activity asynchronously (don't await)
          createAdminActivity(
            req.user,
            actionType,
            resourceType,
            resourceId,
            details,
            req.ip
          );
        } catch (error) {
          console.error("Error in activity logger middleware:", error);
        }
      }

      // Call the original end
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

module.exports = activityLogger;
