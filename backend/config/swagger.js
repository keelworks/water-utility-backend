// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Water Utility API',
      version: '1.0.0',
      description: 'API documentation for user authentication and role-based access control',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Change this to match your production URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to API route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
