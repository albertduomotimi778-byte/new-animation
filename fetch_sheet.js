async function run() {
  const url = "https://docs.google.com/spreadsheets/d/1aCRRxFE1hQkSuQJngCejJ5MkTu2JvdojYoCvlTUSnYA/export?format=csv";
  const res = await fetch(url);
  const text = await res.text();
  console.log(res.status, text.substring(0, 100));
}
run();
