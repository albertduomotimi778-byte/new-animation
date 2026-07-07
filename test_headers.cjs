require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const SELLERS_SPREADSHEET_ID = "1VzaInQ38FadtpdAxyogusb8oQJDC8mhlU0bH-rEiwgk";

async function run() {
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SELLERS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    for (let title of Object.keys(doc.sheetsByTitle)) {
        const sheet = doc.sheetsByTitle[title];
        await sheet.loadHeaderRow();
        console.log("Sheet:", title, "Headers:", sheet.headerValues);
    }
}
run();
