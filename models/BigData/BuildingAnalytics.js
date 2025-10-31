// models/BigData/BuildingAnalytics.js
import mongoose from 'mongoose';

const BuildingAnalyticsSchema = new mongoose.Schema({
  buildingId: {
    type: String,
    ref: 'Building',
    required: true,
    index: true
  },
  buildingName: {
    type: String,
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  searchCount: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  visitorsByRole: {
    estudiante: { type: Number, default: 0 },
    profesor: { type: Number, default: 0 },
    administrador: { type: Number, default: 0 }
  },
  averageViewDuration: {
    type: Number, // en segundos
    default: 0
  },
  peakHours: [{
    hour: Number, // 0-23
    count: Number
  }],
  dayOfWeek: {
    type: String,
    enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
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

// Índice compuesto para consultas por edificio y fecha
BuildingAnalyticsSchema.index({ buildingId: 1, date: -1 });
BuildingAnalyticsSchema.index({ date: -1 });

export default mongoose.model('BuildingAnalytics', BuildingAnalyticsSchema, 'building_analytics');

