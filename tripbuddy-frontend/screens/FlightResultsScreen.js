import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform
} from 'react-native';
import FlightCard from '../components/FlightCard';
import FlightDetailsModal from '../components/FlightDetailsModal';
import { addFlightToTrip } from '../services/tripService';

export default function FlightResultsScreen({ route, navigation }) {
  const { flights, searchParams } = route.params;
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingToTrip, setAddingToTrip] = useState(false);

  const handleFlightPress = useCallback((flight) => {
    setSelectedFlight(flight);
    setModalVisible(true);
  }, []);

  const showToast = useCallback((message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', message);
    }
  }, []);

  const handleAddToTrip = useCallback(async (flight) => {
    if (addingToTrip) return;
    
    setAddingToTrip(true);
    
    try {
      await addFlightToTrip(flight);
      showToast(`${flight.flightNumber} added to your trip!`);
      setModalVisible(false);
      setSelectedFlight(null);
    } catch (error) {
      console.error('Error adding flight to trip:', error);
      Alert.alert('Error', 'Failed to add flight to trip. Please try again.');
    } finally {
      setAddingToTrip(false);
    }
  }, [addingToTrip, showToast]);

  const renderItem = useCallback(({ item, index }) => {
    return (
      <FlightCard
        key={item.id || `flight-${index}`}
        flight={item}
        onPress={() => handleFlightPress(item)}
      />
    );
  }, [handleFlightPress]);

  const keyExtractor = useCallback((item, index) => {
    return item.id || item.flightNumber || `flight-${index}`;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flight Results</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Info */}
      <View style={styles.searchInfo}>
        <Text style={styles.routeTitle}>
          {searchParams.source} → {searchParams.destination}
        </Text>
        <Text style={styles.dateTitle}>
          {new Date(searchParams.date).toDateString()}
        </Text>
        <Text style={styles.flightCount}>
          {flights.length} flights found
        </Text>
      </View>

      {/* Flight List */}
      {flights.length > 0 ? (
        <FlatList
          data={flights}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.flatList}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No flights found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching with different criteria
          </Text>
        </View>
      )}

      {/* Flight Details Modal */}
      <FlightDetailsModal
        visible={modalVisible}
        flight={selectedFlight}
        onClose={() => {
          setModalVisible(false);
          setSelectedFlight(null);
        }}
        onAddToTrip={handleAddToTrip}
        addingToTrip={addingToTrip}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  searchInfo: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  dateTitle: {
    fontSize: 16,
    color: '#ffffff90',
    textAlign: 'center',
    marginBottom: 8,
  },
  flightCount: {
    fontSize: 14,
    color: '#ffffff70',
    textAlign: 'center',
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
