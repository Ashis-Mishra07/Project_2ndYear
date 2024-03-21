// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "shelterpaws-65d62.firebaseapp.com",
  projectId: "shelterpaws-65d62",
  storageBucket: "shelterpaws-65d62.appspot.com",
  messagingSenderId: "750638292829",
  appId: "1:750638292829:web:9a7dc77dc79f11ce0c12b4",
  measurementId: "G-823DLJE477",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);