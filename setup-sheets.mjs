import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = "moniepoint-sheet-reader@moniepoint-tracker.iam.gserviceaccount.com";
const GOOGLE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrb2+pibkEr6C+
96OHTzLzrS4/w6wHN63o5C2x09S7PIqb14AlChmKjzoeGWoaOMpgKZl+QnBFiLPc
9at1LEUTEV1JktynVx6rfsq4rWx4WQt17MYi5XnP4l1yndK0/LE/96t+ZrphZiiD
ZU/lRuwaGqIby2ccMouCeaKVkOLXfHLPrRKA30FbIg0wh3DR1x08NJI2cSooWsP+
IKlyiArvJERU9+KzomQF0JHtiLCgXv1o8tijLhVI0AU29M1+CEaHNUyZg93+cw43
G5nocE5PSjP2/V+WR9RoxwrjcxlgHOji7uFUisvQH5tSpB1wAX9GiBK3KrwwJeI9
j9ffzf6pAgMBAAECggEAEUnxc6JTQZz5o9CjEf4DeC4epCkWU/sCQ6KhVhX0Ffbe
zqUew/1/Aml71bW/7MmN5UFEvMYz/tswsmenJS+z/p6JbyZLsOeZDPgCNzosHn3y
aS/Z8oJ8dKHSRUET0xNJx9bxGVQAV1q/WrLwqgFrRZ2qfA2ZBi+1wJCGPDmqmssE
otxm+kieSHWmhMhd/Ir7L/DVeuM+Ksx+GHJUmp/RYoQI94kgtKocA6DFNccAX8ch
Pxhcqkm3RllL5oFkCkP4lkF/V5GYDJjmVmNpLFmraqvrOhcmuFt5J4XmmoyLIqaB
daSSMQCDH2J51xd871sDFqHmZxDU7c25HI2AZuJVdQKBgQDScJRrsW8JRGe+fl9j
5ndeklUzFOW2oh0z7RGlTjRmcch2CRgr2NDqpDcz/L7BeiNFyjsmrTibudzqIjQe
4Xr2Q740HPsoaSLW7L3CrJcjVNvinyjvqsv43wU40O7w/qjnWnxEgmDF3gSH6uYp
AwfagfMqr07YsYPSJ/tMOw1MHQKBgQDQjRJTLWIKPptIWxtsLbJksrjsAZcvd8Rt
c2px4rcNTK7rS6DNM9Dbb5ImP9/mYn4u5DEV+Yvdggd6zKh9vjiDFTlF5idAQvBL
daRI+/adTAKfd+ftcgbzDynEV9zwC3p9VtQrZ/pRZxtARoZhd4DJjK4LCZpBOYbE
xA0k76n+/QKBgQDDimrPuxsDEHYaE1FOAdwPm4fhpFxjnTXnhzUrVoToYHg1/fNg
4uIV9it5ejRCkdxuwCDAqpr8UPOO9+NYgoqAhKgbwoY6oZ8G+QrG9xqlcPe1F9Gx
ChLomUs/5RzyAKAwAeuQuVl04v1w0nu1xiQpDTFIC4gHYMOtpwsiZYjQnQKBgHrr
63UjNrobFKOdL5ifhppbzSst9NKBoUFx2beujX5FSIRfWzQX6m6sYFQzKeE9BGrX
DSeKoqm4znfO0TDsQZrhk5Rjh5cU3VVczaxG9qDYAGPF5OnLX9U7hr63mv3Rhi0C
VKQQ8TWxtBo6d1JTgZFKXfsbedQf+BNaCvVOXcBxAoGAIejbbe5uItC8+PCDQyNT
FjNGfxG49OTK6rbFMT8WikYNv5CzDpYUIVDzt8/Wfm230u28INn2sRAIhN2alzNQ
B5EDfG35YeNqQOoo7s9r5s79Lol7xc/7yfgGBjo74CG6oVyjqqfR7g3RQlJ17icl
dcqxq8qjZkTBAW54wK8Yzug=
-----END PRIVATE KEY-----`;

const PRODUCT_SPREADSHEET_ID = "1aCRRxFE1hQkSuQJngCejJ5MkTu2JvdojYoCvlTUSnYA";
const SELLERS_SPREADSHEET_ID = "1VzaInQ38FadtpdAxyogusb8oQJDC8mhlU0bH-rEiwgk";

const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function setup() {
    console.log("Setting up products sheet...");
    const productDoc = new GoogleSpreadsheet(PRODUCT_SPREADSHEET_ID, serviceAccountAuth);
    await productDoc.loadInfo();
    const productSheet = productDoc.sheetsByIndex[0];
    await productSheet.clear();
    await productSheet.setHeaderRow(['Product Name', 'Price', 'Amount', 'Thumbnail Product', 'Product Images', 'Category', 'Seller ID', 'Times Purchased', 'Revenue', 'Product', 'Star Rating', 'Product Description', 'Video URL']);
    console.log("Adding test product...");
    await productSheet.addRow({
        'Product Name': 'Test Animation Pack',
        'Price': 'paid',
        'Amount': '15.00',
        'Thumbnail Product': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop',
        'Product Images': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop',
        'Category': 'Project File',
        'Seller ID': 'test_seller_123',
        'Times Purchased': '0',
        'Revenue': '0',
        'Product': 'https://example.com/project.zip',
        'Star Rating': '5',
        'Product Description': 'Premium animated timeline templates, fully optimized for seamless studio integration.',
        'Video URL': 'https://assets.mixkit.co/videos/preview/mixkit-motion-graphic-animation-of-shapes-and-lines-31518-large.mp4'
    });
    console.log("Products sheet configured.");

    console.log("Setting up sellers sheet...");
    const sellersDoc = new GoogleSpreadsheet(SELLERS_SPREADSHEET_ID, serviceAccountAuth);
    await sellersDoc.loadInfo();
    const sellerSheet = sellersDoc.sheetsByIndex[0];
    await sellerSheet.clear();
    await sellerSheet.setHeaderRow(['Seller ID', 'Name', 'Payout']);
    console.log("Adding test seller...");
    await sellerSheet.addRow({
        'Seller ID': 'test_seller_123',
        'Name': 'Test Seller',
        'Payout': '0'
    });
    console.log("Sellers sheet configured.");
}

setup().catch(e => {
    console.error("Error setting up sheets:", e);
    process.exit(1);
});
