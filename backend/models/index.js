const User = require('./User');
const Role = require('./Role');
const UserDetails = require('./UserDetails');
const Address = require('./Address');
const WaterConnectionAccount = require('./WaterConnectionAccount');
const WaterService = require('./WaterServices');


// Define associations
User.belongsToMany(Role, {
    through: 'user_roles',
    foreignKey: 'user_id',
    otherKey: 'role_id',
    timestamps: true,
  });
  Role.belongsToMany(User, {
    through: 'user_roles',
    foreignKey: 'role_id',
    otherKey: 'user_id',
    timestamps: false,
  });
  

User.hasOne(UserDetails, { foreignKey: 'user_id' });
UserDetails.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Address, { foreignKey: 'user_id' });
Address.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WaterConnectionAccount, { foreignKey: 'user_id' });
WaterConnectionAccount.belongsTo(User, { foreignKey: 'user_id' });

WaterService.hasMany(WaterConnectionAccount, { foreignKey: 'service_id' });
WaterConnectionAccount.belongsTo(WaterService, { foreignKey: 'service_id' });

Address.hasMany(WaterConnectionAccount, { foreignKey: 'address_id' });
WaterConnectionAccount.belongsTo(Address, { foreignKey: 'address_id' });

// Admin activity associations
AdminActivity.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Admin notification associations
AdminNotification.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Admin settings associations
AdminSettings.belongsTo(User, {
  foreignKey: "updated_by",
  as: "updatedByUser",
});

module.exports = {
  User,
  Role,
  AdminActivity,
  AdminSettings,
  AdminNotification,

};
