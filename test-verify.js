import fetch from 'node-fetch';

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference: 'mock_ref_123',
                email: 'test_real_user@example.com',
                planType: 'monthly'
            })
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
