import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  _id: String, // e.g., LAB
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Service', ServiceSchema); // ← plural, como en populate
