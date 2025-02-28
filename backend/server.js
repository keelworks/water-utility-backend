// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { swaggerUi, specs } = require('./config/swagger');

// Route imports
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Basic route for health check
app.get('/', (req, res) => {
  res.send('Water Utility Auth Service is Running...');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Auth endpoints
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
