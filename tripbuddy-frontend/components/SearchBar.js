import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SearchBar({ onSearch }) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Search Flights</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>From Airport Code (e.g., DEL)</Text>
        <TextInput
          style={styles.input}
          placeholder="DEL"
          value={source}
          onChangeText={setSource}
          autoCapitalize="characters"
          maxLength={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>To Airport Code (e.g., BOM)</Text>
        <TextInput
          style={[styles.input, styles.destinationInput]}
          placeholder="BOM"
          value={destination}
          onChangeText={setDestination}
          autoCapitalize="characters"
          maxLength={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Journey Date</Text>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="09-09-2025"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <TouchableOpacity 
        style={styles.searchButton} 
        onPress={() => onSearch({ source, destination, date })}
      >
        <Text style={styles.searchButtonText}>Search Flights</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  destinationInput: {
    borderColor: '#ff6b35',
  },
  dateInput: {
    borderColor: '#ff6b35',
  },
  searchButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 15,
    paddingVertical: 18,
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

