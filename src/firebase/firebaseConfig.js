import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8XFDYUyXqm0Q85ZPUH6HEvOgu6pTYEpk",
  authDomain: "rs-ajuda.firebaseapp.com",
  projectId: "rs-ajuda",
  storageBucket: "rs-ajuda.appspot.com",
  messagingSenderId: "795503193183",
  appId: "1:795503193183:web:5127277e3ef6c94c79bfea"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { db, auth, googleProvider, storage };