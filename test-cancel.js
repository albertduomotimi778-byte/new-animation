import fetch from 'node-fetch';

async function test() {
    try {
        console.log('Initializing...');
        const resInit = await fetch('http://localhost:3000/api/paystack/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test_cancel@example.com',
                amount: 1000,
                planType: 'daily',
                callbackUrl: 'http://localhost:3000/callback'
            })
        });
        const initText = await resInit.text();
        console.log('Init Status:', resInit.status);
        if (resInit.status !== 200) {
            console.log(initText);
        }
        
        console.log('Wait 5s then cancel.');
        await new Promise(r => setTimeout(r, 5000));
        
        const resCancel = await fetch('http://localhost:3000/api/paystack/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_cancel@example.com' })
        });
        const cancelText = await resCancel.text();
        console.log('Cancel Status:', resCancel.status);
        console.log('Cancel Output:', cancelText);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
