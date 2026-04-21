const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  estimatedMinutes: { type: Number, required: true },
  priority: { type: String, default: 'Medium' },
  energyLevel: { type: String, default: 'Neutral' },
  project: { type: String, default: 'General' },
  status: { type: String, default: 'Pending' }, // FIX: Changed from 'active' to 'Pending'
  completedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Task', TaskSchema);