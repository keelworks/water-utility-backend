// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const acl = require('./config/acl');
const { swaggerUi, specs } = require('./config/swagger');

// Import our custom middlewares
const authMiddleware = require('./middlewares/authMiddleware');
const aclRoleMiddleware = require('./middlewares/aclRoleMiddleware');

// Import central routes aggregator
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Use authentication middleware to set req.user
app.use(authMiddleware);

// Use our ACL role assignment middleware to set req.decoded
app.use(aclRoleMiddleware);


app.use(acl.authorize);

// Mount central router at /api
app.use('/api', routes);

// Health check route
app.get('/', (req, res) => {
  res.send('Water Utility Auth Service is Running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
