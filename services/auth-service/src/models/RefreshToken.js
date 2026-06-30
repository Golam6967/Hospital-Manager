const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token:     { type: String, required: true, unique: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
