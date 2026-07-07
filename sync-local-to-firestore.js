import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error("firebase-applet-config.json not found!");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const collectionsToSync = ['products', 'sellers', 'referrals', 'competitions', 'tutorials', 'dropbox_keys'];

async function run() {
  console.log("Starting local to firestore synchronization...");
  for (const col of collectionsToSync) {
    const filePath = path.join(process.cwd(), 'db_store', `${col}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found for ${col}, skipping...`);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content || '{}');
      const keys = Object.keys(data);
      console.log(`Syncing ${keys.length} items for collection: ${col}`);
      
      for (const key of keys) {
        const item = data[key];
        // Clean item data to avoid any weird circular or empty objects
        const cleanItem = { ...item };
        if (cleanItem.id === undefined) {
          cleanItem.id = key;
        }
        
        const docRef = doc(db, col, key);
        await setDoc(docRef, cleanItem);
        console.log(`  - Synced ${col}/${key}`);
      }
      console.log(`Successfully synced collection: ${col}`);
    } catch (err) {
      console.error(`Error syncing collection ${col}:`, err);
    }
  }
  console.log("Sync process completed successfully!");
}

run();
