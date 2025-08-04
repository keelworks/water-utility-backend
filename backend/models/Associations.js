const Address = require("./Address");
const Role = require("./Role");
const User = require("./User");
const UserDetails = require("./UserDetails");
const WaterConnectionAccount = require("./WaterConnectionAccount");
const WaterService = require("./WaterServices");

// Define associations
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

User.belongsToMany(Role, {
  through: "user_roles",
  foreignKey: "user_id",
  otherKey: "role_id",
  timestamps: false,
  as: "Roles",
});
Role.belongsToMany(User, {
  through: "user_roles",
  foreignKey: "role_id",
  otherKey: "user_id",
  timestamps: false,
});

User.hasOne(UserDetails, { foreignKey: "user_id", as: "UserDetail" });
UserDetails.belongsTo(User, { foreignKey: "user_id" });

UserDetails.hasMany(Address, { foreignKey: "user_detail_id", as: "Addresses" });
Address.belongsTo(UserDetails, { foreignKey: "user_detail_id" });

User.hasMany(WaterConnectionAccount, { foreignKey: "user_id" });
WaterConnectionAccount.belongsTo(User, { foreignKey: "user_id" });

WaterService.hasMany(WaterConnectionAccount, { foreignKey: "service_id" });
WaterConnectionAccount.belongsTo(WaterService, { foreignKey: "service_id" });

Address.hasMany(WaterConnectionAccount, { foreignKey: "address_id" });
WaterConnectionAccount.belongsTo(Address, { foreignKey: "address_id" });

module.exports = {
  User,
  UserDetails,
  Role,
  Address,
  WaterService,
  WaterConnectionAccount,
};
