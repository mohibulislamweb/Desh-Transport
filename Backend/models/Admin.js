const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    authTokenHash: { type: String, select: false, default: null },
    authTokenExpiresAt: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
