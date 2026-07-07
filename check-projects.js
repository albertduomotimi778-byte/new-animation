import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const snap = await getDocs(collection(db, 'user_cloud_projects'));
    console.log(`Total projects in user_cloud_projects: ${snap.size}`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`- DocID: ${doc.id}, Name: ${data.name}, Email: ${data.email}, Size: ${data.size_bytes}`);
    });
  } catch (e) {
    console.error("Error reading user_cloud_projects:", e.message);
  }
}
run();
