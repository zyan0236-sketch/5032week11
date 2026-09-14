import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCdOO6XZCJCcHEpXixC7Md1rxhUoWIdbuk",
  authDomain: "fit5032-3d110.firebaseapp.com",
  projectId: "fit5032-3d110",
  storageBucket: "fit5032-3d110.firebasestorage.app",
  messagingSenderId: "887276928344",
  appId: "1:887276928344:web:ac37cd7ff89744b7d5f92d"
};

const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
