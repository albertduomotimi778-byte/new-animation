
console.log('--- Environment Variables ---');
console.log('SHEET_ID:', process.env.GOOGLE_SPREADSHEET_ID);
console.log('SA_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('SA_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log('Found SA_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
} else {
    console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL not found in process.env');
}
