// config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Water Utility API",
      version: "1.0.0",
      description:
        "API documentation for Water Utility Management System with user authentication, role-based access control, and profile management",
      contact: {
        name: "API Support",
        email: "support@waterutility.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "User",
        description: "User profile and onboarding endpoints",
      },
      {
        name: "Admin",
        description: "Administrative endpoints (admin role required)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your Firebase JWT token (without 'Bearer ' prefix)",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Error message",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to API route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
