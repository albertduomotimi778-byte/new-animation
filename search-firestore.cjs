
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function searchEmail(email) {
    const collections = ['user_cloud_projects', 'user_subscriptions_v3', 'users', 'user_accounts', 'user_settings'];
    for (const colName of collections) {
        console.log(`Searching in collection: ${colName}`);
        try {
            const snap = await getDocs(collection(db, colName));
            snap.forEach(doc => {
                const data = doc.data();
                const str = JSON.stringify(data);
                if (str.toLowerCase().includes(email.toLowerCase())) {
                    console.log(`Found in ${colName}/${doc.id}:`, data);
                }
            });
        } catch (e) {
            console.error(`Error searching ${colName}:`, e.message);
        }
    }
}

searchEmail('albertduomotimi778@gmail.com');
searchEmail('albertsamuel@gmail.com');
