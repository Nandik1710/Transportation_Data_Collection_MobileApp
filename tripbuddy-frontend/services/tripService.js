import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

const TRIPS_KEY = 'user_trips';
const USER_ID_KEY = 'user_id';

// Generate or get user ID
export const getUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Add flight to trip (both local and backend)
export const addFlightToTrip = async (flight) => {
  try {
    const userId = await getUserId();
    
    // Create trip object
    const newTrip = {
      id: Date.now().toString(),
      type: 'flight',
      userId,
      flight,
      addedAt: new Date().toISOString(),
      status: 'saved'
    };
    
    // Save locally first
    const existingTrips = await getLocalTrips();
    const updatedTrips = [...existingTrips, newTrip];
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    
    // Try to save to backend
    try {
      await axiosClient.post('/transport/trip/add', {
        userId,
        tripData: newTrip
      });
      console.log('Trip saved to backend successfully');
    } catch (backendError) {
      console.warn('Failed to save to backend, saved locally:', backendError.message);
    }
    
    return newTrip;
  } catch (error) {
    console.error('Error adding flight to trip:', error);
    throw error;
  }
};

// Get trips from local storage
export const getLocalTrips = async () => {
  try {
    const trips = await AsyncStorage.getItem(TRIPS_KEY);
    return trips ? JSON.parse(trips) : [];
  } catch (error) {
    console.error('Error getting local trips:', error);
    return [];
  }
};

// Get trips from backend
export const getTripsFromBackend = async () => {
  try {
    const userId = await getUserId();
    const response = await axiosClient.get(`/transport/history/${userId}`);
    return response.data.trips || [];
  } catch (error) {
    console.error('Error getting trips from backend:', error);
    return [];
  }
};

// Get all trips (merge local and backend)
export const getTrips = async () => {
  try {
    const [localTrips, backendTrips] = await Promise.all([
      getLocalTrips(),
      getTripsFromBackend()
    ]);
    
    // Merge and deduplicate trips
    const allTrips = [...localTrips, ...backendTrips];
    const uniqueTrips = allTrips.filter((trip, index, self) => 
      index === self.findIndex(t => t.id === trip.id)
    );
    
    return uniqueTrips.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  } catch (error) {
    console.error('Error getting all trips:', error);
    return await getLocalTrips(); // Fallback to local trips
  }
};

// Remove trip
export const removeTrip = async (tripId) => {
  try {
    const userId = await getUserId();
    
    // Remove from local storage
    const existingTrips = await getLocalTrips();
    const updatedTrips = existingTrips.filter(trip => trip.id !== tripId);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    
    // Try to remove from backend
    try {
      await axiosClient.delete(`/transport/trip/${tripId}`, {
        data: { userId }
      });
      console.log('Trip removed from backend successfully');
    } catch (backendError) {
      console.warn('Failed to remove from backend, removed locally:', backendError.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error removing trip:', error);
    throw error;
  }
};

// Sync local trips with backend
export const syncTrips = async () => {
  try {
    const userId = await getUserId();
    const localTrips = await getLocalTrips();
    
    for (const trip of localTrips) {
      try {
        await axiosClient.post('/transport/trip/sync', {
          userId,
          tripData: trip
        });
      } catch (syncError) {
        console.warn('Failed to sync trip:', trip.id, syncError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing trips:', error);
    return false;
  }
};
