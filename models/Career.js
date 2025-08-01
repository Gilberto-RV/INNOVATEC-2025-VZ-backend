// models/Career.js
import mongoose from 'mongoose';

const CareerSchema = new mongoose.Schema({
  _id: String, // Ej: "CAR-TIC"
  name: String,
  description: String,
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Career', CareerSchema); // Singular, la colección puede llamarse "careers"
