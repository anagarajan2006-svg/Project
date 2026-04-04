import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // Auto-delete after 5 min
});

export default mongoose.model('OTP', OTPSchema);
