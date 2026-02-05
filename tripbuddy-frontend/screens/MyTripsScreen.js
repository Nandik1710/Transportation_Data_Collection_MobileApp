import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import { getTrips, removeTrip } from '../services/tripService';

export default function MyTripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const userTrips = await getTrips();
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrip = (tripId) => {
    Alert.alert(
      'Remove Trip',
      'Are you sure you want to remove this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTrip(tripId);
              setTrips(trips.filter(trip => trip.id !== tripId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove trip');
            }
          }
        }
      ]
    );
  };

  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.flightNumber}>
          {item.flight?.flightNumber || 'Flight'}
        </Text>
        <TouchableOpacity
          onPress={() => handleRemoveTrip(item.id)}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.airline}>
        {item.flight?.airlineName || 'Unknown Airline'}
      </Text>
      
      <View style={styles.routeInfo}>
        <Text style={styles.route}>
          {item.flight?.departureAirport} → {item.flight?.arrivalAirport}
        </Text>
        <Text style={styles.price}>
          {item.flight?.currency === 'USD' ? '$' : '₹'}{item.flight?.price}
        </Text>
      </View>
      
      <Text style={styles.addedDate}>
        Added: {new Date(item.addedAt).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Trips</Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTrips} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No saved trips</Text>
            <Text style={styles.emptySubtitle}>
              Search for flights and add them to your trips
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ff6b35',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  flightNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#666',
    fontSize: 12,
  },
  airline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  route: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  addedDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
