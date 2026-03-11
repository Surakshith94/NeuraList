// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  estimatedMinutes: {
    type: Number,
    required: true, 
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  energyLevel: {
    type: String,
    enum: ['High Focus', 'Neutral', 'Recharge'], 
    required: true,
  },
  
  // --- NEW: STATE TRACKING FIELDS ---
  
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Paused', 'Completed'],
    default: 'Pending',
  },
  timeSpent: {
    type: Number,
    default: 0, // How many minutes you've already put into this task
  },
  lastStartedAt: {
    type: Date,
    default: null, // The exact moment you click "Start" or "Resume"
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);