import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FlightDetailsScreen({ route }) {
  const { flight } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{flight.airlineName} - {flight.flightNumber}</Text>
      <Text>Flight Date: {flight.flightDate}</Text>
      <Text>Status: {flight.flightStatus}</Text>
      <Text>Departure Airport: {flight.departureAirport}</Text>
      <Text>Departure Time: {new Date(flight.departureTime).toLocaleString()}</Text>
      <Text>Arrival Airport: {flight.arrivalAirport}</Text>
      <Text>Arrival Time: {new Date(flight.arrivalTime).toLocaleString()}</Text>
      <Text>Departure Gate: {flight.departureGate}</Text>
      <Text>Arrival Gate: {flight.arrivalGate}</Text>
      <Text>Departure Delay: {flight.departureDelay} min</Text>
      <Text>Arrival Delay: {flight.arrivalDelay} min</Text>
      {/* Add more details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
