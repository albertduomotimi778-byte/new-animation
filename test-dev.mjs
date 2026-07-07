async function run() {
  const res = await fetch("http://localhost:3000/api/user/dev-activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "albertsamuel0011@gmail.com", plan: "daily", expiryMs: Date.now() + 86400000, amount: 100 })
  });
  console.log(await res.text());
}
run();
