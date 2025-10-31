// models/BigData/UserActivityLog.js
import mongoose from 'mongoose';

const UserActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userRole: {
    type: String,
    enum: ['estudiante', 'profesor', 'administrador'],
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'view_building',
      'view_event',
      'search_building',
      'create_event',
      'update_event',
      'delete_event',
      'view_profile',
      'update_profile'
    ],
    index: true
  },
  resourceType: {
    type: String,
    enum: ['building', 'event', 'profile', 'auth', 'other']
  },
  resourceId: {
    type: String,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'unknown']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices para consultas eficientes
UserActivityLogSchema.index({ userId: 1, timestamp: -1 });
UserActivityLogSchema.index({ action: 1, timestamp: -1 });
UserActivityLogSchema.index({ timestamp: -1 });

export default mongoose.model('UserActivityLog', UserActivityLogSchema, 'user_activity_logs');

