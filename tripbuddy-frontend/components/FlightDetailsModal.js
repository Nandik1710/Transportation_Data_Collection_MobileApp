import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function FlightDetailsModal({ 
  visible, 
  flight, 
  onClose, 
  onAddToTrip, 
  addingToTrip = false 
}) {
  if (!flight) return null;

  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDate = (timeString) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
      return new Date(timeString).toLocaleDateString('en-US', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
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

  const handleAddToTrip = () => {
    if (addingToTrip) return;
    
    Alert.alert(
      "Add to Trip",
      `Do you want to add ${flight.flightNumber} to your trip?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Add",
          onPress: () => onAddToTrip(flight)
        }
      ]
    );
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Flight Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Flight Info Card */}
          <View style={styles.flightInfoCard}>
            <View style={styles.flightHeader}>
              <View>
                <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
                <Text style={styles.airline}>{flight.airlineName}</Text>
              </View>
              <View style={styles.statusContainer}>
                <Text style={styles.status}>{flight.flightStatus}</Text>
                <Text style={styles.cabinType}>{flight.cabinType}</Text>
              </View>
            </View>
          </View>

          {/* Route Details */}
          <View style={styles.routeCard}>
            <Text style={styles.sectionTitle}>Route Information</Text>
            
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Text style={styles.airportCode}>{flight.departureAirport}</Text>
                <Text style={styles.time}>{formatTime(flight.departureTime)}</Text>
                <Text style={styles.date}>{formatDate(flight.departureTime)}</Text>
                <Text style={styles.label}>DEPARTURE</Text>
              </View>
              
              <View style={styles.routeLine}>
                <View style={styles.durationContainer}>
                  <Text style={styles.duration}>{flight.duration}</Text>
                  <View style={styles.flightPath} />
                  <Text style={styles.stops}>{flight.stops}</Text>
                </View>
              </View>
              
              <View style={styles.routePoint}>
                <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
                <Text style={styles.time}>{formatTime(flight.arrivalTime)}</Text>
                <Text style={styles.date}>{formatDate(flight.arrivalTime)}</Text>
                <Text style={styles.label}>ARRIVAL</Text>
              </View>
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.priceCard}>
            <Text style={styles.sectionTitle}>Pricing Details</Text>
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Fare</Text>
                <Text style={styles.priceValue}>
                  {formatPrice(flight.baseFare || flight.price, flight.currency)}
                </Text>
              </View>
              {flight.taxes && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Taxes & Fees</Text>
                  <Text style={styles.priceValue}>
                    {formatPrice(flight.taxes, flight.currency)}
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalPrice}>
                  {formatPrice(flight.price, flight.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.additionalCard}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Flight Date</Text>
                <Text style={styles.infoValue}>{flight.flightDate}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{flight.duration}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Stops</Text>
                <Text style={styles.infoValue}>{flight.stops}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
        
        {/* Fixed Add to Trip Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.addButton,
              addingToTrip && styles.addButtonDisabled
            ]}
            onPress={handleAddToTrip}
            activeOpacity={0.8}
            disabled={addingToTrip}
          >
            {addingToTrip ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.addButtonText, { marginLeft: 8 }]}>Adding...</Text>
              </View>
            ) : (
              <Text style={styles.addButtonText}>Add to My Trip</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  
  flightInfoCard: {
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
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 4,
  },
  airline: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  cabinType: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff5f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b35',
  },

  routeCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routePoint: {
    flex: 1,
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b35',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  label: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  routeLine: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  durationContainer: {
    alignItems: 'center',
    width: '100%',
  },
  duration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 8,
  },
  flightPath: {
    height: 3,
    width: '80%',
    backgroundColor: '#ff6b35',
    borderRadius: 1.5,
    marginBottom: 8,
  },
  stops: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  priceCard: {
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
  priceBreakdown: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6b35',
  },

  additionalCard: {
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
  infoGrid: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  buttonContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
