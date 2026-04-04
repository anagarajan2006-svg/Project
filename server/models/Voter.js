import mongoose from 'mongoose';

const VoterSchema = new mongoose.Schema({
  voterId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  dob: { type: String, required: true },
  gender: { type: String, default: 'male' },
  photo: { type: String, required: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false },
  role: { type: String, default: 'voter' }
});

export default mongoose.model('Voter', VoterSchema);
