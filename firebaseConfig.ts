// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence, browserSessionPersistence } from "firebase/auth"; // Import persistence types
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Correct import

const firebaseConfig = {
  apiKey: "AIzaSyDJvVpG5v7bUs7CiZCFuUezsnJDM2ZyENM", // Replace with your actual config
  authDomain: "campnity-222ba.firebaseapp.com",
  databaseURL: "https://campnity-222ba-default-rtdb.firebaseio.com",
  projectId: "campnity-222ba",
  storageBucket: "campnity-222ba.firebasestorage.app",
  messagingSenderId: "124870719847",
  appId: "1:124870719847:web:9d8debecb697c1bb78d7c2",
  measurementId: "G-V85E4EEHD9"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {

  persistence: browserLocalPersistence // This tells Firebase to use the "local" tier of persistence.
                                       // In a React Native context, it should adapt to AsyncStorage.
});

export const FIRESTORE_DB = getFirestore(FIREBASE_APP);