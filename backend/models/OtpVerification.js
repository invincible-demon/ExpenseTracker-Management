import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

export default OtpVerification; 