const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
    try {
        console.log("Writing...");
        const finalSellerId = "usertest123" + Math.floor(100 + Math.random() * 900);
        await setDoc(doc(db, 'sellers', finalSellerId), {
            sellerId: finalSellerId,
            email: "test@example.com",
            payout: 0,
            bankName: "",
            bankOwnerName: "",
            accountNumber: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log("SUCCESS!");
        process.exit(0);
    } catch (e) {
        console.error("FAILED", e.message);
        process.exit(1);
    }
}
test();
