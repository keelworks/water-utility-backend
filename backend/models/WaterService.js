const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WaterService = sequelize.define('WaterService', {
    service_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    service_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['residential', 'commercial', 'industrial']]
      }
    },
    base_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive']]
      }
    }
  }, {
    tableName: 'water_services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

module.exports = WaterService;