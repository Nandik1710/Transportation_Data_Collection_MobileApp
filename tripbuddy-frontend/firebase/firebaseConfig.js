import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || Constants.manifest?.extra?.FIREBASE_API_KEY || "AIzaSyAkJl5Pt9Awht7gqKNAuLhEISd5jaoAqIw",
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || Constants.manifest?.extra?.FIREBASE_AUTH_DOMAIN || "travelbuddy-f8695.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || Constants.manifest?.extra?.FIREBASE_PROJECT_ID || "travelbuddy-f8695",
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || Constants.manifest?.extra?.FIREBASE_STORAGE_BUCKET || "travelbuddy-f8695.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || Constants.manifest?.extra?.FIREBASE_MESSAGING_SENDER_ID || "434260183210",
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || Constants.manifest?.extra?.FIREBASE_APP_ID || "1:434260183210:web:4428da176fac2d5e54a8d3",
  measurementId: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID || Constants.manifest?.extra?.FIREBASE_MEASUREMENT_ID || "G-7H4531LYEQ"
};

const app = initializeApp(firebaseConfig);

export default app;
