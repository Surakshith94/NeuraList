const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  estimatedMinutes: { type: Number, required: true },
  priority: { type: String, default: 'Medium' },
  energyLevel: { type: String, default: 'Neutral' },
  // --- NEW: Tell MongoDB to accept Project Tags ---
  project: { type: String, default: 'General' } 
});

module.exports = mongoose.model('Task', TaskSchema);