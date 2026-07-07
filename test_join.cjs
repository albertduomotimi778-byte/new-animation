const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp, query, collection, where, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
    try {
        const email = "test@example.com";
        const finalSellerId = "test" + Math.floor(100 + Math.random() * 900);
        console.log("Writing seller", finalSellerId);
        await setDoc(doc(db, 'sellers', finalSellerId), {
            sellerId: finalSellerId,
            email: email,
            payout: 0,
            bankName: "",
            bankOwnerName: "",
            accountNumber: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log("Success seller");

        const q = query(collection(db, 'sellers'), where('email', '==', email));
        const snap = await getDocs(q);
        console.log("Query snap length:", snap.docs.length);

    } catch (err) {
        console.error("Error!!!", err.message);
    }
}
test();
