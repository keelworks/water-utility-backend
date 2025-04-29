// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { swaggerUi, specs } = require('./config/swagger');
const logger = require("./config/logger")
// const pinoHttp = require("pino-http")
const { NotFoundError, ValidationError } = require('./Errors');


const { errorHandler } = require("./middlewares/exceptionMiddleware")

// Route imports
const routes = require('./routes/');

const app = express();
app.use(cors());
app.use(express.json());
// app.use(pinoHttp({
//   logger,
// }))


// Basic route for health check
app.get('/', (req, res) => {
  res.send('Water Utility Auth Service is Running...');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Auth endpoints
app.use('/api/', routes);


// Error handling
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`,));
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  logger.info("Logger Initiated..");
});

// Unhandled rejection/exception handler
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
      process.exit(1);
  });
}).on('uncaughtException', err => {
  logger.error(`Uncaught Exception thrown`, err);
  process.exit(1);
});