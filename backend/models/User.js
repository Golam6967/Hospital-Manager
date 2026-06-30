const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    phone:       { type: String, trim: true },
    role: {
      type: String,
      enum: ['admin', 'staff', 'doctor', 'manager', 'user'],
      default: 'user',
    },
    department:  { type: String },
    hospitalId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    isActive:    { type: Boolean, default: true },
    permissions: [{ type: String }],
    refreshTokens: [
      {
        token:     { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 604800 },
      },
    ],
    lastLogin:      { type: Date },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
