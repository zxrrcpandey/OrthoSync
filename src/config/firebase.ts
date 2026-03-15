// ==========================================
// OrthoSync - Firebase Configuration
// ==========================================
// TODO: Replace with your actual Firebase config
// Get these values from: https://console.firebase.google.com
// Project Settings > General > Your Apps > Web App

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export default firebaseConfig;

// ==========================================
// Firebase Setup Instructions:
// ==========================================
// 1. Go to https://console.firebase.google.com
// 2. Create a new project named "OrthoSync"
// 3. Enable Authentication (Email/Password + Phone)
// 4. Create Firestore Database
// 5. Enable Storage
// 6. Enable Cloud Messaging
// 7. Add a Web App and copy the config here
// 8. For Android: Add SHA-1 fingerprint
// 9. For iOS: Download GoogleService-Info.plist
// ==========================================
