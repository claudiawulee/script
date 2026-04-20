import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

import { FIREBASE_CONFIG } from "./firebase.config.js";

const app = initializeApp(FIREBASE_CONFIG);

const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {
  db,
  ref,
  onValue,
  set,
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  push
};