// File: src/services/FirebaseService.js
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDpxHgIEKHbIIrJRmeV6mYh4M2MjtWQBus',
  authDomain: 'gps-tracker-25.firebaseapp.com',
  databaseURL: 'https://gps-tracker-25-default-rtdb.firebaseio.com',
  projectId: 'gps-tracker-25',
  storageBucket: 'gps-tracker-25.firebasestorage.app',
  messagingSenderId: '1029912969532',
  appId: '1:1029912969532:web:07714677d091fa6dddde39',
}

// Initialize Firebase hanya jika belum diinisialisasi
let app
if (!firebase.apps.length) {
  app = firebase.initializeApp(firebaseConfig)
} else {
  app = firebase.app()
}

const database = app.database()

export { database }
