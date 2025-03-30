const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Address = sequelize.define('Address', {
    address_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // address_type: {
    //   type: DataTypes.STRING(20),
    //   allowNull: false,
    //   validate: {
    //     isIn: [['billing', 'service', 'mailing']]
    //   }
    // },
    address_line_1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address_line_2: {
      type: DataTypes.STRING(255)
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state_province: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'United States'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    tableName: 'addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

module.exports = Address;