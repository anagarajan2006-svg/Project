import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCUv5jlmqYSHzN-guy0fG9aIowfQyB7cQM",
  authDomain: "voting-system-2c32a.firebaseapp.com",
  projectId: "voting-system-2c32a",
  storageBucket: "voting-system-2c32a.firebasestorage.app",
  messagingSenderId: "576381143271",
  appId: "1:576381143271:web:da398cb1040b6b7987ba42",
  measurementId: "G-N73839K5VH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
