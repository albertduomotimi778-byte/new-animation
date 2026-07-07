import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

async function test() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  let sheet = doc.sheetsByTitle['Subscriptions'];
  const rows = await sheet.getRows();
  const existingRow = rows.find(r => (r.get('email') || r.toObject().email) === 'fresh_test_new@example.com');
  if (existingRow) {
    existingRow.assign({ country: 'Togo' });
    await existingRow.save();
    console.log('Update OK');
  } else {
    console.log('Not found');
  }
}
test().catch(e => console.error(e));
