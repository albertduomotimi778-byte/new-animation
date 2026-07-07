import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const snap = await getDocs(collection(db, 'user_cloud_projects'));
    console.log(`Total documents in user_cloud_projects: ${snap.size}`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`- DocID: ${doc.id}`);
      console.log(`  Name: ${data.name}`);
      console.log(`  Email: ${data.email}`);
      console.log(`  Dropbox: ${data.dropbox}`);
      console.log(`  Chunks: ${data.chunks}`);
      console.log(`  Size: ${data.size_bytes}`);
      console.log(`  UpdatedAt: ${data.updated_at}`);
    });
  } catch (e) {
    console.error("Error reading user_cloud_projects:", e.message);
  }
  process.exit(0);
}
run();
