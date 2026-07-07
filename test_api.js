import fs from 'fs';
async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/store/products');
    const text = await res.text();
    fs.writeFileSync('products.json', text);
    console.log('Saved to products.json');
  } catch (err) {
    console.error(err);
  }
}
run();
