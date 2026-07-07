import * as admin from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import config from './firebase-applet-config.json' assert { type: 'json' };

const app = admin.initializeApp({
  projectId: config.projectId,
});

async function run() {
  try {
    const db = getFirestore(app);
    db.settings({ databaseId: config.firestoreDatabaseId, ignoreUndefinedProperties: true });
    const snap = await db.collection("sellers").limit(1).get();
    console.log("Success admin:", snap.empty);
  } catch (e) {
    console.error("Admin error:", e);
  }
}
run();
