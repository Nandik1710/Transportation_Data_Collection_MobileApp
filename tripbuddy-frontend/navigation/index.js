import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import FlightDetailsScreen from '../screens/FlightDetailsScreen';
import FlightResultsScreen from '../screens/FlightResultsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} options={{ title: 'Flight Details' }} />
        <Stack.Screen name="FlightResults" component={FlightResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
