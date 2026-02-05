const { saveTripToFirestore } = require('./controllers/transportController');

async function testFirebaseConnection() {
  try {
    const savedDoc = await saveTripToFirestore('testUser1455', {
      source: 'bomboy',
      destination: 'delhi',
      date: '2025-09-07',
      mode: 'bus',
      results: { busName: 'TestBus', price: 100 },
    });
    console.log('Trip saved with ID:', savedDoc.id);
  } catch (error) {
    console.error('Firebase save error:', error);
  }
}

testFirebaseConnection();

