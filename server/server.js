// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // Allows us to accept JSON data
app.use(cors());

// A simple test route
app.get('/', (req, res) => {
  res.send('Smart To-Do Engine is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});