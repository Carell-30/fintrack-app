// config/firebase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCWsSWf_b88aWpbwUbxoEH2LzmlMMussZc",
  authDomain: "fintrackproject-c31ed.firebaseapp.com",
  projectId: "fintrackproject-c31ed",
  storageBucket: "fintrackproject-c31ed.firebasestorage.app",
  messagingSenderId: "291287315052",
  appId: "1:291287315052:web:7b878540a8bac0cceb9e49",
  measurementId: "G-MPG9CGZSFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };

