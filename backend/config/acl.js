//acl.js

const acl = require('express-acl');

// Define Access Rules
const aclConfig = {
  baseUrl: 'api/',
  defaultRole: 'consumer', // Default role if none is found
  rules: [
    {
      group: 'public', // ✅ A new "public" group for unauthenticated access
      permissions: [
        {
          resource: 'auth/signup',
          methods: ['POST'],
          action: 'allow' // ✅ Explicitly allow signup
        }
      ]
    },
    
    {
      group: 'admin',
      permissions: [
        {
          resource: 'admin/*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          action: 'allow'
        }
      ]
    },
    {
      group: 'consumer',
      permissions: [
        {
          resource: 'user/profile',
          methods: ['GET'],
          action: 'allow'
        },

        {
           resource: 'welcome',
           methods: ['GET'],
           action: 'allow'
        }
        
      ]
    },
    {
      group: 'technician',
      permissions: [
        {
          resource: '/technician/*',
          methods: ['GET', 'POST'],
          action: 'allow'
        }
      ]
    }
  ]
};

// Initialize ACL Middleware
acl.config({
  filename: 'n/a', // No file needed, using JS rules
  baseUrl: aclConfig.baseUrl,
  defaultRole: aclConfig.defaultRole,
  decodedObjectName: 'decoded',
  roleSearchPath: 'decoded.role',
  rules: aclConfig.rules
    
});

module.exports = acl;
