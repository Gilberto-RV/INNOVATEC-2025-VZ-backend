// models/BigData/EventAnalytics.js
import mongoose from 'mongoose';

const EventAnalyticsSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  buildingId: {
    type: String,
    ref: 'Building'
  },
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories'
  }],
  status: {
    type: String,
    enum: ["programado", "en_curso", "finalizado", "cancelado"]
  },
  attendancePrediction: {
    type: Number, // Predicción de asistencia basada en datos históricos
    default: 0
  },
  actualAttendance: {
    type: Number
  },
  popularityScore: {
    type: Number, // Score calculado basado en vistas, fecha, categoría, etc.
    default: 0
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Índices
EventAnalyticsSchema.index({ eventId: 1, date: -1 });
EventAnalyticsSchema.index({ status: 1, date: -1 });
EventAnalyticsSchema.index({ date: -1 });

export default mongoose.model('EventAnalytics', EventAnalyticsSchema, 'event_analytics');

