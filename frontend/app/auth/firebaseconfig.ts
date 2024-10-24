import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCG97wgoirEbXPB1s7GgQ9A0C9XBwQCd80",
    authDomain: "what2wear-be847.firebaseapp.com",
    projectId: "what2wear-be847",
    storageBucket: "what2wear-be847.appspot.com",
    messagingSenderId: "261272407550",
    appId: "1:261272407550:web:19a3e4b3a52581dbdf04af",
    measurementId: "G-GTF5CHGFXL"
  };


  
// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize services
let analytics: Analytics | null = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  } else {
    console.log("Firebase Analytics is not supported in this environment.");
  }
});

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db, analytics };