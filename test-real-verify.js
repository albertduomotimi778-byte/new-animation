import fetch from 'node-fetch';

async function test() {
    try {
        console.log('1. Initialize...');
        const resInit = await fetch('http://localhost:3000/api/paystack/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'fresh_test_new@example.com',
                amount: 5000,
                planType: 'monthly',
                callbackUrl: 'http://localhost:3000/callback'
            })
        });
        console.log('Init Status:', resInit.status);
        
        console.log('2. Verify...');
        const resVerify = await fetch('http://localhost:3000/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference: 'test_verify_active',
                email: 'fresh_test_new@example.com',
                planType: 'monthly'
            })
        });
        const text = await resVerify.text();
        console.log('Verify Status:', resVerify.status);
        console.log('Verify Response:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
