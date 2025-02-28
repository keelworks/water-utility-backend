const User = require('./User');
const Role = require('./Role');

// Define associations
User.belongsToMany(Role, {
  through: 'user_roles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  timestamps: false,
});
Role.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  timestamps: false,
});

module.exports = {
  User,
  Role,
};
