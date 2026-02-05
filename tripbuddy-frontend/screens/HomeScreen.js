import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import SearchBar from '../components/SearchBar';
import { searchFlights } from '../api/flightService';
import { syncTrips } from '../services/tripService';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Prevent duplicate API calls
  const searchInProgress = useRef(false);
  const lastSearchKey = useRef('');

  useEffect(() => {
    syncTrips().catch(console.error);
  }, []);

  const performSearch = useCallback(async (params) => {
    const searchKey = `${params.source}-${params.destination}-${params.date}`;
    
    if (searchInProgress.current || lastSearchKey.current === searchKey) {
      console.log('Search already in progress or duplicate, skipping...');
      return;
    }

    console.log('Starting search:', params);
    searchInProgress.current = true;
    lastSearchKey.current = searchKey;
    
    setLoading(true);
    setError(null);

    try {
      const results = await searchFlights(params);
      console.log('Search results received:', results?.length || 0);
      
      // Navigate to FlightResults screen with data
      navigation.navigate('FlightResults', {
        flights: results || [],
        searchParams: params
      });
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search flights');
      Alert.alert('Search Error', err.message || 'Failed to search flights');
    } finally {
      setLoading(false);
      searchInProgress.current = false;
    }
  }, [navigation]);

  const onSearch = useCallback((params) => {
    console.log('Search requested:', params);
    setError(null);
    
    setTimeout(() => {
      performSearch(params);
    }, 100);
  }, [performSearch]);

  const navigateToMyTrips = useCallback(() => {
    navigation.navigate('MyTrips');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good Evening!</Text>
            <Text style={styles.subtitle}>Where do you want to go?</Text>
          </View>
          <TouchableOpacity style={styles.tripsButton} onPress={navigateToMyTrips}>
            <Text style={styles.tripsButtonText}>My Trips</Text>
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <SearchBar onSearch={onSearch} />
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => setError(null)}
              >
                <Text style={styles.retryText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff6b35" />
              <Text style={styles.loadingText}>Searching flights...</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </View>
          ) : (
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Find Your Perfect Flight</Text>
              <Text style={styles.welcomeSubtitle}>
                Search for flights to discover the best deals and options for your next trip
              </Text>
              
              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionCard}>
                  <Text style={styles.actionTitle}>Popular Routes</Text>
                  <Text style={styles.actionSubtitle}>DEL → BOM, BLR → DEL</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionCard}>
                  <Text style={styles.actionTitle}>Last Minute Deals</Text>
                  <Text style={styles.actionSubtitle}>Save up to 30%</Text>
                </TouchableOpacity>
              </View>

              {/* Features */}
              <View style={styles.featuresSection}>
                <Text style={styles.featuresTitle}>Why Choose TripBuddy?</Text>
                
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✈️</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Real-time Prices</Text>
                    <Text style={styles.featureDesc}>Get the most up-to-date flight prices</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💰</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Best Deals</Text>
                    <Text style={styles.featureDesc}>Compare prices across multiple airlines</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📱</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Easy Booking</Text>
                    <Text style={styles.featureDesc}>Simple and secure booking process</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ff6b35',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff90',
  },
  tripsButton: {
    backgroundColor: '#ffffff20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  tripsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b35',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionCard: {
    backgroundColor: '#fff',
    flex: 0.48,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  featuresSection: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});
