// --- Dependencies ---
const axios = require('axios');
const { db } = require('../config/firebase');

// Load environment variables
require('dotenv').config();

// Helper function to convert airline codes to full names
function getAirlineName(code) {
  if (!code) return null;
  
  const airlineMap = {
    'AI': 'Air India',
    'IX': 'Air India Express',
    '6E': 'IndiGo',
    'SG': 'SpiceJet',
    'UK': 'Vistara',
    'G8': 'Go First',
    '9W': 'Jet Airways',
    'I5': 'AirAsia India',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'SV': 'Saudi Arabian Airlines'
  };
  return airlineMap[code.toUpperCase()] || null;
}

// Add trip to Firestore (different from saveTripToFirestore)
async function addTripToFirestore(userId, tripData) {
  try {
    const enhancedTripData = {
      ...tripData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'saved'
    };
    
    const docRef = await db.collection('savedTrips').add(enhancedTripData);
    console.log(`Saved trip added with ID: ${docRef.id}`);
    
    return { 
      id: docRef.id, 
      ...enhancedTripData,
      createdAt: enhancedTripData.createdAt.toISOString(),
      updatedAt: enhancedTripData.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error adding trip to Firestore:', error);
    throw error;
  }
}

// Sync trip to Firestore (handles duplicates)
async function syncTripToFirestore(userId, tripData) {
  try {
    // Check if trip already exists
    const existingTrip = await db.collection('savedTrips')
      .where('userId', '==', userId)
      .where('id', '==', tripData.id)
      .get();

    if (!existingTrip.empty) {
      console.log(`Trip ${tripData.id} already exists, skipping sync`);
      return { id: tripData.id, ...tripData, synced: false };
    }

    // Add new trip
    const enhancedTripData = {
      ...tripData,
      userId,
      syncedAt: new Date(),
      status: 'synced'
    };

    const docRef = await db.collection('savedTrips').add(enhancedTripData);
    console.log(`Trip synced with ID: ${docRef.id}`);

    return {
      id: docRef.id,
      ...enhancedTripData,
      syncedAt: enhancedTripData.syncedAt.toISOString(),
      synced: true
    };
  } catch (error) {
    console.error('Error syncing trip to Firestore:', error);
    throw error;
  }
}

// Get user's saved trips
async function getUserSavedTrips(userId) {
  try {
    const tripsRef = db.collection('savedTrips')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    const snapshot = await tripsRef.get();

    if (snapshot.empty) {
      console.log('No saved trips found for user:', userId);
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
      syncedAt: doc.data().syncedAt?.toDate()?.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching saved trips:', error);
    throw error;
  }
}

// Separate function for search history trips
async function getUserSearchTrips(userId) {
  try {
    const tripsRef = db.collection('trips')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc');

    const snapshot = await tripsRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()?.toISOString(),
      type: 'search'
    }));
  } catch (error) {
    console.error('Error fetching search trips:', error);
    return [];
  }
}

// FLIGHTS: Real API integration with RapidAPI Flight Fare Search
async function searchFlights(src, dest, date) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "xyz";
  const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "abc";

  const options = {
    method: 'GET',
    url: `https://${RAPIDAPI_HOST}/v2/flights`,
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
      'Content-Type': 'application/json'
    },
    params: {
      from: src,
      to: dest,
      date: date,
      type: 'Economy',
      adult: 1,
      child: 0,
      infant: 0,
      currency: 'USD'
    }
  };

  try {
    const response = await axios.request(options);
    console.log('API Response received, processing...');

    const apiData = response.data;
    let flights = [];

    // Handle different possible API response structures
    if (apiData.results && Array.isArray(apiData.results)) {
      flights = apiData.results;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      flights = apiData.data;
    } else if (apiData.flights && Array.isArray(apiData.flights)) {
      flights = apiData.flights;
    } else if (Array.isArray(apiData)) {
      flights = apiData;
    } else {
      console.warn('Unexpected API response structure:', Object.keys(apiData));
      return [];
    }

    if (!flights.length) {
      console.warn('No flight data found in API response');
      return [];
    }

    console.log(`Raw flights received: ${flights.length}`);

    // ✅ LIMIT TO 20 FLIGHTS FIRST - before processing
    const limitedFlights = flights.slice(0, 20);
    console.log(`Limited to: ${limitedFlights.length} flights for processing`);

    // Map the limited flights
    const formattedFlights = limitedFlights.map((flight, index) => ({
      id: flight.id || `flight-${Date.now()}-${index}`,
      flightDate: flight.departureAirport?.time?.split('T')[0] ||
                 flight.departure_date ||
                 date,
      flightStatus: flight.status || 'scheduled',

      // Departure info
      departureAirport: flight.departureAirport?.city ||
                       flight.departureAirport?.code ||
                       flight.from ||
                       src,
      departureTime: flight.departureAirport?.time ||
                    flight.departure_time ||
                    flight.departureDateTime ||
                    'N/A',

      // Arrival info
      arrivalAirport: flight.arrivalAirport?.city ||
                     flight.arrivalAirport?.code ||
                     flight.to ||
                     dest,
      arrivalTime: flight.arrivalAirport?.time ||
                  flight.arrival_time ||
                  flight.arrivalDateTime ||
                  'N/A',

      // Airline info
      airlineName: getAirlineName(flight.airline_code || flight.careerCode) ||
                  flight.airline_name ||
                  flight.airline ||
                  'Unknown Airline',
      flightNumber: flight.flight_number ||
                   flight.flight_code ||
                   flight.flightNumber ||
                   'N/A',

      // Pricing
      price: flight.price?.total ||
             flight.totals?.total ||
             flight.price ||
             flight.fare ||
             null,
      currency: flight.price?.currency ||
               flight.totals?.currency ||
               flight.currency ||
               'USD',
      baseFare: flight.price?.base ||
               flight.totals?.base ||
               flight.baseFare ||
               null,
      taxes: flight.price?.tax ||
            flight.totals?.tax ||
            flight.taxes ||
            null,

      // Flight details
      stops: flight.stops !== undefined ?
             (flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`) :
             (flight.direct ? 'Direct' : 'N/A'),
      duration: flight.duration?.text ||
               flight.duration ||
               flight.flight_duration ||
               'N/A',
      cabinType: flight.cabin_class ||
                flight.cabinType ||
                flight.class ||
                'Economy',

      // Additional info
      baggage: {
        cabin: flight.baggage?.cabin || flight.cabin_baggage || null,
        checkIn: flight.baggage?.checkIn || flight.checked_baggage || null
      },
      path: flight.path || [],
      departureDelay: flight.departureDelay || 0,
      arrivalDelay: flight.arrivalDelay || 0
    }));

    console.log(`Successfully processed ${formattedFlights.length} flights from ${src} to ${dest}`);
    return formattedFlights;

  } catch (error) {
    console.error('Error fetching flights from RapidAPI:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: options.url
    });

    // ✅ Handle specific error cases
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded (429), returning empty results');
      return [];
    }

    if (error.response?.status === 403) {
      console.warn('API access forbidden (403), check API key');
      return [];
    }

    if (error.response?.status >= 500) {
      console.warn('Server error (5xx), API temporarily unavailable');
      return [];
    }

    // Return empty array for any other errors
    return [];
  }
}

// TRAINS: Mock data for now, replace later with real API
async function searchTrains(src, dest, date) {
  // ✅ Limit trains to 20 as well
  const trainData = [
    {
      id: `train-${Date.now()}-1`,
      trainName: "Rajdhani Express",
      trainNumber: "12951",
      from: src,
      to: dest,
      date,
      price: 800,
      departureTime: "16:55",
      arrivalTime: "08:10",
      duration: "15h 15m",
      class: "3A"
    },
    {
      id: `train-${Date.now()}-2`,
      trainName: "Shatabdi Express",
      trainNumber: "12002",
      from: src,
      to: dest,
      date,
      price: 900,
      departureTime: "06:00",
      arrivalTime: "14:30",
      duration: "8h 30m",
      class: "CC"
    },
    {
      id: `train-${Date.now()}-3`,
      trainName: "Duronto Express",
      trainNumber: "12259",
      from: src,
      to: dest,
      date,
      price: 750,
      departureTime: "22:50",
      arrivalTime: "12:35",
      duration: "13h 45m",
      class: "SL"
    }
  ];
  return trainData.slice(0, 20); // Limit to 20
}

// BUSES: Mock data with more realistic options
const busData = [
  {
    id: 'bus-1',
    operatorName: 'RedBus Express',
    busType: 'AC Sleeper',
    departureTime: '22:00',
    arrivalTime: '06:00',
    duration: '8h 0m',
    price: 1200,
    seatsAvailable: 12,
    route: ['Delhi', 'Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Ahmedabad']
  },
  {
    id: 'bus-2',
    operatorName: 'Travels India',
    busType: 'AC Semi-Sleeper',
    departureTime: '23:30',
    arrivalTime: '07:30',
    duration: '8h 0m',
    price: 1000,
    seatsAvailable: 8,
    route: ['Delhi', 'Jaipur', 'Mumbai', 'Pune', 'Goa', 'Bangalore']
  },
  {
    id: 'bus-3',
    operatorName: 'Express Tours',
    busType: 'Non-AC Sleeper',
    departureTime: '20:00',
    arrivalTime: '05:00',
    duration: '9h 0m',
    price: 800,
    seatsAvailable: 15,
    route: ['Mumbai', 'Pune', 'Hyderabad', 'Bangalore', 'Chennai']
  }
];

function searchBuses(src, dest) {
  const results = busData
    .filter(bus =>
      bus.route.some(city => city.toLowerCase().includes(src.toLowerCase())) &&
      bus.route.some(city => city.toLowerCase().includes(dest.toLowerCase()))
    )
    .map(bus => ({
      ...bus,
      bookingId: `BUS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amenities: ['AC', 'WiFi', 'Charging Port', 'Water Bottle'],
      rating: (Math.random() * 2 + 3).toFixed(1)
    }));
  
  return results.slice(0, 20); // ✅ Limit to 20
}

// 4 WHEELERS: Mock data with enhanced details
const carData = [
  {
    id: 'car-1',
    carModel: 'Sedan - Swift Dzire',
    carType: 'AC',
    pricePerKm: 12,
    estimatedDistance: 300,
    route: ['Delhi', 'Mumbai', 'Pune', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad']
  },
  {
    id: 'car-2',
    carModel: 'SUV - Innova',
    carType: 'AC',
    pricePerKm: 15,
    estimatedDistance: 280,
    route: ['Delhi', 'Jaipur', 'Mumbai', 'Pune', 'Goa', 'Bangalore']
  },
  {
    id: 'car-3',
    carModel: 'Hatchback - Alto',
    carType: 'Non-AC',
    pricePerKm: 8,
    estimatedDistance: 320,
    route: ['Mumbai', 'Pune', 'Hyderabad', 'Bangalore', 'Chennai', 'Cochin']
  }
];

function searchCars(src, dest) {
  const results = carData
    .filter(car =>
      car.route.some(city => city.toLowerCase().includes(src.toLowerCase())) &&
      car.route.some(city => city.toLowerCase().includes(dest.toLowerCase()))
    )
    .map(car => ({
      ...car,
      totalPrice: car.pricePerKm * car.estimatedDistance,
      bookingId: `CAR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      driver: 'Professional Driver Included',
      fuel: 'Fuel Included',
      estimatedTime: `${Math.ceil(car.estimatedDistance / 60)}h ${(car.estimatedDistance % 60)}m`,
      features: ['AC', 'Music System', 'GPS Navigation', 'First Aid Kit']
    }));
  
  return results.slice(0, 20); // ✅ Limit to 20
}

// Save trip details to Firestore (for search history)
async function saveTripToFirestore(userId, tripDetails) {
  try {
    const tripData = {
      userId,
      ...tripDetails,
      timestamp: new Date(),
      status: 'planned'
    };
    const docRef = await db.collection('trips').add(tripData);
    console.log(`Trip saved with ID: ${docRef.id}`);
    return { id: docRef.id, ...tripData };
  } catch (error) {
    console.error('Error saving trip to Firestore:', error);
    throw error;
  }
}

// Update the existing getUserTrips function to include saved trips
async function getUserTrips(userId) {
  try {
    const [searchTrips, savedTrips] = await Promise.all([
      getUserSearchTrips(userId),
      getUserSavedTrips(userId)
    ]);

    // Combine and sort all trips
    const allTrips = [...searchTrips, ...savedTrips];
    return allTrips.sort((a, b) =>
      new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
    );
  } catch (error) {
    console.error('Error fetching user trips:', error);
    throw error;
  }
}

// Delete a trip from Firestore
async function deleteTripFromFirestore(tripId, userId) {
  try {
    // Try to delete from both collections
    const collections = ['trips', 'savedTrips'];
    let deleted = false;
    
    for (const collectionName of collections) {
      try {
        const tripRef = db.collection(collectionName).doc(tripId);
        const tripDoc = await tripRef.get();

        if (tripDoc.exists) {
          const tripData = tripDoc.data();
          if (tripData.userId === userId) {
            await tripRef.delete();
            console.log(`Trip ${tripId} deleted from ${collectionName}`);
            deleted = true;
            break;
          }
        }
      } catch (collectionError) {
        console.warn(`Error checking ${collectionName}:`, collectionError);
      }
    }

    if (!deleted) {
      throw new Error('Trip not found or unauthorized');
    }

    return { success: true, message: 'Trip deleted successfully' };
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}

module.exports = {
  searchFlights,
  searchTrains,
  searchBuses,
  searchCars,
  saveTripToFirestore,
  getUserTrips,
  deleteTripFromFirestore,
  addTripToFirestore,
  syncTripToFirestore,
  getUserSavedTrips,
  getUserSearchTrips
};
