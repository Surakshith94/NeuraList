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

// GET: Fetch all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find(); // Retrieves everything in the tasks collection
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;