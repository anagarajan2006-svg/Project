import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  votingTime: {
    start: { type: String, default: null },
    end: { type: String, default: null },
    label: { type: String, default: null }
  },
  resultsAnnounced: { type: Boolean, default: false }
});

export default mongoose.model('Config', ConfigSchema);
