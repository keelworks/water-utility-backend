// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     SignUpRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "securePassword123"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           example: "123 Main Street, NY"
 *         role:
 *           type: string
 *           default: "consumer"
 *           example: "consumer"
 *     SignUpResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Signup successful"
 *         user:
 *           type: object
 *     SignInRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "securePassword123"
 *     SignInResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Sign in successful"
 *         idToken:
 *           type: string
 *           example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *         expiresIn:
 *           type: string
 *           example: "3600"
 *         user:
 *           type: object
 *     WaterService:
 *       type: object
 *       properties:
 *         service_id:
 *           type: integer
 *           example: 1
 *         service_name:
 *           type: string
 *           example: "Residential Basic"
 *         description:
 *           type: string
 *           example: "Basic water connection for residential properties"
 *         service_type:
 *           type: string
 *           example: "residential"
 *         base_rate:
 *           type: number
 *           example: 25.00
 *         status:
 *           type: string
 *           example: "active"
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignUpResponse'
 *       400:
 *         description: Bad request - Email and password required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email and password required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/signup", authController.signUp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Sign in user with email and password
 *     description: Authenticates user with email and password, returns JWT token for subsequent requests
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignInResponse'
 *       400:
 *         description: Bad request - Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Email and password required"
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_credentials:
 *                 value:
 *                   error: "Invalid authentication token"
 *               expired_token:
 *                 value:
 *                   error: "Token expired, please sign in again"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "User not found in system"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", authController.signIn);

/**
 * @swagger
 * /api/auth/admin/update-role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Requires admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Forbidden - Requires role: admin"
 */
router.put(
  "/admin/update-role",
  authMiddleware("admin"),
  adminController.updateUserRole
);

/**
 * @swagger
 * /api/auth/welcome:
 *   get:
 *     summary: Test protected route
 *     tags: [Authentication]
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
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the protected route!"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/welcome", authMiddleware(), (req, res) => {
  res.json({ message: "Welcome to the protected route!" });
});

/**
 * @swagger
 * /api/auth/onboarding/services:
 *   get:
 *     summary: Get available water services
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Water services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Water services fetched successfully"
 *                 waterServices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WaterService'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/onboarding/services", authController.getServices);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token obtained from login
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzIxZGM3..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 idToken:
 *                   type: string
 *                   description: New access token
 *                   example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzIxZGM3..."
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token
 *                   example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzIxZGM3..."
 *                 expiresIn:
 *                   type: string
 *                   description: Token expiration time in seconds
 *                   example: "3600"
 *       400:
 *         description: Bad request - Missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
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
router.post("/refresh", authController.refreshToken);

module.exports = router;
