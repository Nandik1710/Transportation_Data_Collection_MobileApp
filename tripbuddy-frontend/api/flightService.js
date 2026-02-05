import axiosClient from './axiosClient';

export const searchFlights = async ({ source, destination, date }) => {
  try {
    console.log('Searching flights with params:', { source, destination, date });
    
    // Validate inputs
    if (!source?.trim() || !destination?.trim() || !date) {
      throw new Error('Please provide valid source, destination, and date');
    }
    
    const requestData = {
      source: source.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      date,
      mode: 'flights',
    };
    
    console.log('Sending request:', requestData);
    
    const response = await axiosClient.post('/transport/search', requestData);
    
    console.log('Flight search response:', response.data);
    
    if (response.data && response.data.results) {
      return response.data.results;
    } else {
      console.warn('No results in response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Flight search error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Re-throw with user-friendly message
    if (error.message.includes('Unable to connect')) {
      throw new Error('Cannot connect to flight search service. Please check your internet connection.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    } else {
      throw new Error(error.response?.data?.error || error.message || 'Failed to search flights');
    }
  }
};
