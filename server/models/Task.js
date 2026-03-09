// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  estimatedMinutes: {
    type: Number,
    required: true, // e.g., 45 minutes
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  energyLevel: {
    type: String,
    enum: ['High Focus', 'Neutral', 'Recharge'], // High Focus = Studying, Recharge = Gaming
    required: true,
  },
  isFlexible: {
    type: Boolean,
    default: true, // Can it be moved? True for studying, False for a scheduled class
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true }); 
module.exports = mongoose.model('Task', TaskSchema);