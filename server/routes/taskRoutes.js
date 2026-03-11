const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Importing our blueprint

// POST: Create a new task
router.post('/', async (req, res) => {
  try {
    // req.body contains the data sent from the frontend (title, energyLevel, etc.)
    const newTask = new Task(req.body); 
    const savedTask = await newTask.save(); // Saves to MongoDB
    
    res.status(201).json(savedTask); // Send back the saved task as confirmation
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update Task Status (Start, Pause, or Complete)
router.put('/:id/status', async (req, res) => {
  try {
    const { action } = req.body; // 'start', 'pause', or 'complete'
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const now = new Date();

    if (action === 'start') {
      task.status = 'Active';
      task.lastStartedAt = now;
    } 
    
    else if (action === 'pause' || action === 'complete') {
      // Calculate how long it was active
      if (task.lastStartedAt) {
        const diffMs = now - task.lastStartedAt;
        const diffMins = Math.floor(diffMs / 60000);
        task.timeSpent += diffMins;
      }
      
      task.status = action === 'pause' ? 'Paused' : 'Completed';
      task.lastStartedAt = null; // Reset the clock
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find(); // Retrieves everything in the tasks collection
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Mark a task as complete and remove it
router.delete('/:id', async (req, res) => {
  try {
    // req.params.id grabs the unique ID from the URL
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task completed and removed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;