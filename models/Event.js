// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  building_assigned: [{
    type: String, // ojo aquí, porque en tu modelo de Building el _id es String, no ObjectId
    ref: 'Building'
  }],
  classroom: {
    type: String
  },
  date_time: {
    type: Date,
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories'
  }],
  status: {
    type: String,
    enum: ["programado", "en_curso", "finalizado", "cancelado"],
    default: "programado"
  },
  media: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model("Event", EventSchema);
