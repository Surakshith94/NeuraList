// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));
// ---------------------------

// connect the routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes); // All routes in taskRoutes will be prefixed with /api/tasks 

// A simple test route
app.get('/', (req, res) => {
  res.send('Smart To-Do Engine is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});