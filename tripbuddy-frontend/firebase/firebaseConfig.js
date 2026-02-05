import { initializeApp } from 'firebase/app';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || Constants.manifest?.extra?.FIREBASE_API_KEY || "###################",
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || Constants.manifest?.extra?.FIREBASE_AUTH_DOMAIN || "####################",
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || Constants.manifest?.extra?.FIREBASE_PROJECT_ID || "####################",
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || Constants.manifest?.extra?.FIREBASE_STORAGE_BUCKET || "######################",
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || Constants.manifest?.extra?.FIREBASE_MESSAGING_SENDER_ID || "#############",
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || Constants.manifest?.extra?.FIREBASE_APP_ID || "##############################",
  measurementId: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID || Constants.manifest?.extra?.FIREBASE_MEASUREMENT_ID || "#######################"
};

const app = initializeApp(firebaseConfig);

export default app;

