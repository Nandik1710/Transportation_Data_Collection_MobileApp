const express = require('express');
const cors = require('cors');
const transportRoutes = require('./routes/transport');

const app = express();

// Enable CORS for all origins
app.use(cors());

// Enable JSON body parser middleware  
app.use(express.json());

// Mount transport routes WITHOUT /api prefix (since your base URL doesn't have /api)
app.use('/transport', transportRoutes);  // ✅ Changed from '/api/transport' to '/transport'

// Root route for health check
app.get('/', (req, res) => {
  res.send('TripBuddy Backend is running');
});

// Test route
app.get('/transport/test', (req, res) => {
  res.json({ 
    message: 'Transport API is working!',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
