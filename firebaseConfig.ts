// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJvVpG5v7bUs7CiZCFuUezsnJDM2ZyENM",
  authDomain: "campnity-222ba.firebaseapp.com",
  databaseURL: "https://campnity-222ba-default-rtdb.firebaseio.com",
  projectId: "campnity-222ba",
  storageBucket: "campnity-222ba.firebasestorage.app",
  messagingSenderId: "124870719847",
  appId: "1:124870719847:web:9d8debecb697c1bb78d7c2",
  measurementId: "G-V85E4EEHD9"
};



export const FIREBASE_APP = initializeApp(firebaseConfig)
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
export const FIRESTORE_DB = getFirestore(FIREBASE_APP)