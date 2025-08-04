// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");
const validateOnboarding = require("../validators/onboardingValidator");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         profile_picture:
 *           type: string
 *           format: uri
 *           nullable: true
 *           example: "https://example.com/profile.jpg"
 *         phone_number:
 *           type: string
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           nullable: true
 *           example: "123 Main Street, NY"
 *         role:
 *           type: string
 *           example: "consumer"
 *     GetProfileResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Successfully retrived profile"
 *         profile:
 *           $ref: '#/components/schemas/UserProfile'
 *     UpdateProfileResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Successfully updated profile"
 *         profile:
 *           $ref: '#/components/schemas/UserProfile'
 *     PasswordChangeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Password updated successfully"
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /api/user/onboarding/user:
 *   post:
 *     summary: Submit user onboarding details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - address
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               address:
 *                 type: object
 *                 required:
 *                   - address_line_1
 *                   - city
 *                   - state_province
 *                   - postal_code
 *                 properties:
 *                   address_line_1:
 *                     type: string
 *                     example: "123 Main Street"
 *                   address_line_2:
 *                     type: string
 *                     example: "Apt 4B"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state_province:
 *                     type: string
 *                     example: "NY"
 *                   postal_code:
 *                     type: string
 *                     example: "10001"
 *                   country:
 *                     type: string
 *                     default: "United States"
 *                     example: "United States"
 *     responses:
 *       200:
 *         description: Onboarding completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user_details:
 *                   type: object
 *                 address:
 *                   type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/onboarding/user",
  authMiddleware(),
  validateOnboarding(),
  userController.submitOnboarding
);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile details
 *     description: Fetches the logged-in user's profile details including personal information, address, and role. Requires valid Firebase JWT token in Authorization header.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Firebase JWT token with Bearer prefix
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetProfileResponse'
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid or expired token"
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found in database"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
router.get("/profile", authMiddleware(), userController.getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile details
 *     description: Updates the logged-in user's profile details including phone number, address, and profile picture. Requires valid Firebase JWT token in Authorization header.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Firebase JWT token with Bearer prefix
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_picture:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/new-profile.jpg"
 *                 description: URL to the new profile picture
 *               phone_number:
 *                 type: string
 *                 example: "+1234567891"
 *                 description: Updated phone number in E.164 format
 *               address:
 *                 type: string
 *                 example: "456 New Street, NY"
 *                 description: Updated address as a formatted string
 *             minProperties: 1
 *             description: At least one field must be provided for update
 *           examples:
 *             update_all:
 *               summary: Update all fields
 *               value:
 *                 profile_picture: "https://example.com/new-profile.jpg"
 *                 phone_number: "+1234567891"
 *                 address: "456 New Street, New York, NY 10001"
 *             update_phone_only:
 *               summary: Update phone number only
 *               value:
 *                 phone_number: "+1987654321"
 *             update_address_only:
 *               summary: Update address only
 *               value:
 *                 address: "789 Another St, Los Angeles, CA 90210"
 *     responses:
 *       200:
 *         description: Profile updated successfully with updated user profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateProfileResponse'
 *       400:
 *         description: Bad request - Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_phone:
 *                 value:
 *                   error: "Invalid phone number format"
 *               missing_fields:
 *                 value:
 *                   error: "At least one field (profile_picture, phone_number, or address) is required for update"
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid or expired token"
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal server error"
 */
router.put("/profile", authMiddleware(), userController.updateProfile);

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change user password
 *     description: Allows users to update their password securely. Requires current password verification and validates new password strength.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: Firebase JWT token with Bearer prefix
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: "OldPass@123"
 *                 description: Current password for verification
 *               new_password:
 *                 type: string
 *                 format: password
 *                 example: "NewPass@123"
 *                 description: New password (min 8 chars, must include uppercase, number, special char)
 *           example:
 *             current_password: "OldPass@123"
 *             new_password: "NewPass@123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasswordChangeResponse'
 *       400:
 *         description: Bad request - Invalid input or weak password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_fields:
 *                 value:
 *                   error: "Both current_password and new_password are required"
 *               weak_password:
 *                 value:
 *                   error: "New password must be at least 8 characters long, with one uppercase letter, one number, and one special character"
 *       401:
 *         description: Unauthorized - Invalid current password or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               wrong_password:
 *                 value:
 *                   error: "Incorrect current password"
 *               invalid_token:
 *                 value:
 *                   error: "Invalid or expired token"
 *       404:
 *         description: User not found in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to change password"
 */
router.put("/change-password", authMiddleware(), userController.changePassword);

module.exports = router;
