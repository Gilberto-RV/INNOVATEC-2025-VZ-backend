// models/BigData/SystemMetrics.js
import mongoose from 'mongoose';

const SystemMetricsSchema = new mongoose.Schema({
  metricType: {
    type: String,
    required: true,
    enum: [
      'api_response_time',
      'api_error_rate',
      'database_query_time',
      'active_users',
      'requests_per_minute',
      'memory_usage',
      'cpu_usage'
    ],
    index: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'ms' // milliseconds, percentage, count, etc.
  },
  endpoint: {
    type: String // Para métricas de API
  },
  errorCode: {
    type: String // Para métricas de errores
  },
  timestamp: {
    type: Date,
    default: Date.now,
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

// Índices para consultas de tiempo
SystemMetricsSchema.index({ metricType: 1, timestamp: -1 });
SystemMetricsSchema.index({ timestamp: -1 });

export default mongoose.model('SystemMetrics', SystemMetricsSchema, 'system_metrics');

