import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  partyName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Vote', VoteSchema);
