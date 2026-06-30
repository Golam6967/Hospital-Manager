const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email:       { type: String, required: true, unique: true },
    firstName:   { type: String, required: true },
    lastName:    { type: String, required: true },
    phone:       { type: String },
    department:  { type: String },
    hospitalId:  { type: String },
    role: {
      type: String,
      enum: ['ADMIN', 'STAFF', 'DOCTOR', 'MANAGER', 'USER'],
      default: 'USER',
    },
    isActive:    { type: Boolean, default: true },
    permissions: { type: [String], default: [] },
    lastLogin:   { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
