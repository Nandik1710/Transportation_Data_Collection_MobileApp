const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { cacheMiddleware } = require('../middleware/cache');
const {
  searchFlights,
  searchTrains,
  searchBuses,
  searchCars,
  saveTripToFirestore,
  getUserTrips,
  deleteTripFromFirestore,
  addTripToFirestore,
  syncTripToFirestore
} = require('../controllers/transportController');

router.get('/test', (req, res) => {
  res.json({ 
    message: 'Transport API is working!',
    timestamp: new Date().toISOString(),
    endpoint: req.originalUrl
  });
});
/**
 * POST /api/transport/search
 * Handles search requests for different transport modes
 */
router.post('/search', rateLimiter, cacheMiddleware, async (req, res) => {
  const { source, destination, date, mode, userId } = req.body;

  if (!source || !destination || !mode) {
    return res.status(400).json({ 
      error: 'Missing required fields: source, destination, and mode are required.' 
    });
  }

  try {
    let results = [];
    const startTime = Date.now();

    switch (mode) {
      case 'flights':
        results = await searchFlights(source, destination, date);
        break;
      case 'trains':
        results = await searchTrains(source, destination, date);
        break;
      case 'buses':
        results = searchBuses(source, destination);
        break;
      case '4wheelers':
        results = searchCars(source, destination);
        break;
      default:
        return res.status(400).json({ error: 'Invalid mode selected.' });
    }

    const responseTime = Date.now() - startTime;
    console.log(`Search completed in ${responseTime}ms, found ${results.length} results`);

    if (req.cacheUtils && results.length > 0) {
      req.cacheUtils.set(results);
    }

    let tripId = null;
    if (userId && results.length > 0) {
      try {
        const trip = await saveTripToFirestore(userId, { 
          source, 
          destination, 
          date, 
          mode, 
          resultsCount: results.length,
          searchTime: new Date().toISOString()
        });
        tripId = trip.id;
      } catch (saveError) {
        console.error('Error saving trip:', saveError);
      }
    }

    res.json({ 
      results,
      cached: false,
      count: results.length,
      responseTime,
      tripId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      error: 'Failed to process search request.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/transport/history/:userId
 * Retrieves all trips saved by the specified user
 */
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const trips = await getUserTrips(userId);
    res.json({ 
      trips,
      count: trips.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user trips.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/transport/trip/add
 * Add a specific trip to user's saved trips
 */
router.post('/trip/add', async (req, res) => {
  const { userId, tripData } = req.body;
  
  if (!userId || !tripData) {
    return res.status(400).json({ error: 'User ID and trip data are required.' });
  }

  try {
    const savedTrip = await addTripToFirestore(userId, tripData);
    res.json({ 
      success: true, 
      trip: savedTrip,
      message: 'Trip added successfully' 
    });
  } catch (error) {
    console.error('Trip addition error:', error);
    res.status(500).json({ 
      error: 'Failed to add trip.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/transport/trip/sync
 * Sync a trip from local storage to backend
 */
router.post('/trip/sync', async (req, res) => {
  const { userId, tripData } = req.body;
  
  if (!userId || !tripData) {
    return res.status(400).json({ error: 'User ID and trip data are required.' });
  }

  try {
    const syncedTrip = await syncTripToFirestore(userId, tripData);
    res.json({ 
      success: true, 
      trip: syncedTrip,
      message: 'Trip synced successfully' 
    });
  } catch (error) {
    console.error('Trip sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync trip.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/transport/trip/:tripId
 * Deletes a specific trip
 */
router.delete('/trip/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const { userId } = req.body;
  
  if (!tripId || !userId) {
    return res.status(400).json({ error: 'Trip ID and User ID are required.' });
  }

  try {
    const result = await deleteTripFromFirestore(tripId, userId);
    res.json(result);
  } catch (error) {
    console.error('Trip deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete trip.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
