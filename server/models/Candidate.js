import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  partyName: { type: String, required: true },
  photo: { type: String, required: true },
  flag: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  password: { type: String, required: true },
});

export default mongoose.model('Candidate', CandidateSchema);
