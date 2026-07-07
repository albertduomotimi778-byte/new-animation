import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, initializeFirestore } from "firebase/firestore/lite";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

async function check() {
  try {
    const snap = await getDocs(collection(db, "sellers"));
    console.log("Success! Docs:", snap.docs.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

check();
