// models/UserDetails.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserDetails = sequelize.define('UserDetail', {
    user_detail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(100)
    },
    last_name: {
      type: DataTypes.STRING(100)
    },
    date_of_birth: {
      type: DataTypes.DATEONLY
    },
    gender: {
      type: DataTypes.STRING(20)
    },
    profile_picture_url: {
      type: DataTypes.STRING(255)
    },
    // id_proof_type: {
    //   type: DataTypes.STRING(50)
    // },
    // id_proof_number: {
    //   type: DataTypes.STRING(100)
    // },
    // emergency_contact_name: {
    //   type: DataTypes.STRING(200)
    // },
    // emergency_contact_phone: {
    //   type: DataTypes.STRING(20)
    // },
    // preferred_language: {
    //   type: DataTypes.STRING(50),
    //   defaultValue: 'English'
    // },
    notification_preferences_json: {
      type: DataTypes.JSONB,
      defaultValue: { email: true, sms: true, push: false }
    },
    onboarding_completed_at: {
      type: DataTypes.DATE
    },
    role_specific_data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'user_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

module.exports = UserDetails;