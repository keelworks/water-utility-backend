// config/firebaseAdmin.js
require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// serviceAccountKey.json path stored in .env or a secure secret manager
const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: 'https://<YOUR-PROJECT>.firebaseio.com'  // if needed for other Firebase services
});

module.exports = admin;
