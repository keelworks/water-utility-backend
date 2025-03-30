
// models/WaterConnectionAccount.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WaterConnectionAccount = sequelize.define('WaterConnectionAccount', {
    connection_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    utility_service_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    meter_number: {
      type: DataTypes.STRING(50)
    },
    installation_date: {
      type: DataTypes.DATEONLY
    },
    connection_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['active', 'disconnected', 'pending']]
      }
    },
    billing_cycle: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'monthly',
      validate: {
        isIn: [['monthly', 'quarterly']]
      }
    },
    connection_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'postpaid',
      validate: {
        isIn: [['prepaid', 'postpaid']]
      }
    },
    meter_reading_method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'manual',
      validate: {
        isIn: [['manual', 'smart']]
      }
    }
  }, {
    tableName: 'water_connection_accounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  module.exports = WaterConnectionAccount;