const mongoose = require("mongoose");

const UserOTPVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
  },

  expiresAt: {
    type: Date,
  },
});

module.exports = UserOTPVerification = mongoose.model(
  "UserOTPVerification",
  UserOTPVerificationSchema
);