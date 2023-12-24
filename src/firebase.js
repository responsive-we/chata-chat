import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  deleteObject,
} from "firebase/storage";
import {
  doc,
  setDoc,
  getFirestore,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  getDoc
} from "firebase/firestore";
import { getDatabase, set,update,get,child } from "firebase/database";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage();
const db = getFirestore();
const chatDb = getDatabase(app);
export {
  auth,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  updateProfile,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  doc,
  setDoc,
  db,
  storage,
  onAuthStateChanged,
  deleteObject,
  updateDoc,
  signOut,
  query,
  collection,
  where,
  getDocs,
  chatDb,
  set,
  update,
  getDoc,get,child
};
