import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCVNRhbTTN1F9Mo4dtLRNZ-tTrMrJIesFk",
  authDomain: "fit5032-873b2.firebaseapp.com",
  projectId: "fit5032-873b2",
  storageBucket: "fit5032-873b2.firebasestorage.app",
  messagingSenderId: "888313203015",
  appId: "1:888313203015:web:9c461b04221c1d6cf6e462",
  measurementId: "G-45MX66THVH"
}

const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)