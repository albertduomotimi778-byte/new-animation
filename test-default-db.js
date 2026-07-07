import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const dbDefault = getFirestore(app); // Uses the default database

async function run() {
  console.log("Checking default Firestore database (without passing specific database ID)...");
  try {
    const snap = await getDocs(collection(dbDefault, 'user_cloud_projects'));
    console.log(`Total documents in user_cloud_projects (DEFAULT DB): ${snap.size}`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`- DocID: ${doc.id}`);
      console.log(`  Name: ${data.name}`);
      console.log(`  Email: ${data.email}`);
    });
  } catch (e) {
    console.error("Error reading default database:", e.message);
  }
  process.exit(0);
}
run();
