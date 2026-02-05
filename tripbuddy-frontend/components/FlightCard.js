import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FlightCard({ flight, onPress }) {
  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDate = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      return new Date(timeString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'Price N/A';
    
    if (currency === 'USD') {
      return `$${Math.round(price)}`;
    } else if (currency === 'INR') {
      return `₹${price.toLocaleString('en-IN')}`;
    } else {
      return `${currency} ${Math.round(price)}`;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Flight Number & Airline */}
      <View style={styles.header}>
        <View>
          <Text style={styles.flightNumber}>
            {flight.flightNumber || 'N/A'}
          </Text>
          <Text style={styles.airlineName}>
            {flight.airlineName || 'Unknown Airline'}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>Starting from</Text>
          <Text style={styles.priceValue}>
            {formatPrice(flight.price, flight.currency)}
          </Text>
        </View>
      </View>

      {/* Flight Times */}
      <View style={styles.timeContainer}>
        <View style={styles.timeSection}>
          <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
          <Text style={styles.date}>{formatDate(flight.departureTime)}</Text>
          <Text style={styles.label}>DEPARTURE</Text>
        </View>

        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{flight.duration || 'N/A'}</Text>
          <View style={styles.durationLine} />
          <Text style={styles.stops}>{flight.stops || 'N/A'}</Text>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
          <Text style={styles.date}>{formatDate(flight.arrivalTime)}</Text>
          <Text style={styles.label}>ARRIVAL</Text>
        </View>
      </View>

      {/* Flight Classes */}
      <View style={styles.classContainer}>
        <View style={styles.classTag}>
          <Text style={styles.classText}>{flight.cabinType || 'Economy'}</Text>
        </View>
        <Text style={styles.flightStatus}>Status: {flight.flightStatus}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    padding: 20,
    minHeight: 180,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  flightNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 4,
  },
  airlineName: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  timeSection: {
    alignItems: 'center',
    flex: 1,
  },
  time: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  durationContainer: {
    alignItems: 'center',
    flex: 1.2,
  },
  duration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 8,
  },
  durationLine: {
    height: 2,
    width: 80,
    backgroundColor: '#ff6b35',
    marginBottom: 4,
  },
  stops: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  classContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  classTag: {
    backgroundColor: '#fff5f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  classText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  flightStatus: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
