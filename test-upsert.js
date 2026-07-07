import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from "google-auth-library";

const SA_EMAIL = 'moniepoint-sheet-reader@moniepoint-tracker.iam.gserviceaccount.com';
const SA_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrb2+pibkEr6C+\n96OHTzLzrS4/w6wHN63o5C2x09S7PIqb14AlChmKjzoeGWoaOMpgKZl+QnBFiLPc\n9at1LEUTEV1JktynVx6rfsq4rWx4WQt17MYi5XnP4l1yndK0/LE/96t+ZrphZiiD\nZU/lRuwaGqIby2ccMouCeaKVkOLXfHLPrRKA30FbIg0wh3DR1x08NJI2cSooWsP+\nIKlyiArvJERU9+KzomQF0JHtiLCgXv1o8tijLhVI0AU29M1+CEaHNUyZg93+cw43\nG5nocE5PSjP2/V+WR9RoxwrjcxlgHOji7uFUisvQH5tSpB1wAX9GiBK3KrwwJeI9\nj9ffzf6pAgMBAAECggEAEUnxc6JTQZz5o9CjEf4DeC4epCkWU/sCQ6KhVhX0Ffbe\nzqUew/1/Aml71bW/7MmN5UFEvMYz/tswsmenJS+z/p6JbyZLsOeZDPgCNzosHn3y\naS/Z8oJ8dKHSRUET0xNJx9bxGVQAV1q/WrLwqgFrRZ2qfA2ZBi+1wJCGPDmqmssE\notxm+kieSHWmhMhd/Ir7L/DVeuM+Ksx+GHJUmp/RYoQI94kgtKocA6DFNccAX8ch\nPxhcqkm3RllL5oFkCkP4lkF/V5GYDJjmVmNpLFmraqvrOhcmuFt5J4XmmoyLIqaB\ndaSSMQCDH2J51xd871sDFqHmZxDU7c25HI2AZuJVdQKBgQDScJRrsW8JRGe+fl9j\n5ndeklUzFOW2oh0z7RGlTjRmcch2CRgr2NDqpDcz/L7BeiNFyjsmrTibudzqIjQe\n4Xr2Q740HPsoaSLW7L3CrJcjVNvinyjvqsv43wU40O7w/qjnWnxEgmDF3gSH6uYp\nAwfagfMqr07YsYPSJ/tMOw1MHQKBgQDQjRJTLWIKPptIWxtsLbJksrjsAZcvd8Rt\nc2px4rcNTK7rS6DNM9Dbb5ImP9/mYn4u5DEV+Yvdggd6zKh9vjiDFTlF5idAQvBL\ndaRI+/adTAKfd+ftcgbzDynEV9zwC3p9VtQrZ/pRZxtARoZhd4DJjK4LCZpBOYbE\nxA0k76n+/QKBgQDDimrPuxsDEHYaE1FOAdwPm4fhpFxjnTXnhzUrVoToYHg1/fNg\n4uIV9it5ejRCkdxuwCDAqpr8UPOO9+NYgoqAhKgbwoY6oZ8G+QrG9xqlcPe1F9Gx\nChLomUs/5RzyAKAwAeuQuVl04v1w0nu1xiQpDTFIC4gHYMOtpwsiZYjQnQKBgHrr\n63UjNrobFKOdL5ifhppbzSst9NKBoUFx2beujX5FSIRfWzQX6m6sYFQzKeE9BGrX\nDSeKoqm4znfO0TDsQZrhk5Rjh5cU3VVczaxG9qDYAGPF5OnLX9U7hr63mv3Rhi0C\nVKQQ8TWxtBo6d1JTgZFKXfsbedQf+BNaCvVOXcBxAoGAIejbbe5uItC8+PCDQyNT\nFjNGfxG49OTK6rbFMT8WikYNv5CzDpYUIVDzt8/Wfm230u28INn2sRAIhN2alzNQ\nB5EDfG35YeNqQOoo7s9r5s79Lol7xc/7yfgGBjo74CG6oVyjqqfR7g3RQlJ17icl\ndcqxq8qjZkTBAW54wK8Yzug=\n-----END PRIVATE KEY-----\n`;

async function test() {
    const serviceAccountAuth = new JWT({
        email: SA_EMAIL,
        key: SA_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet('1nUnRupleiBoQVkAedORzP6d9Syfn1gLREQT1NR2N2FQ', serviceAccountAuth);

    try {
        await doc.loadInfo();
        let sheet = doc.sheetsByTitle['Subscriptions'];
        const rows = await sheet.getRows();
        const existingRow = rows.find(r => (r.get('email') || r.toObject().email) === 'fresh_test_new@example.com');
        if (existingRow) {
            console.log('Got row, data:', existingRow.toObject());
        }
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}
test();
