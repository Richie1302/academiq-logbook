console.log("-----------------------------------------");
console.log("1. Starting live API route test...");

async function runTest() {
  try {
    const healthRes = await fetch("http://localhost:3000/api/healthz");
    console.log("Health check status:", healthRes.status);
    const healthText = await healthRes.text();
    console.log("Health check body:", healthText);
    
    if (healthRes.ok) {
      console.log("✅ API Server is running and responding cleanly!");
    } else {
      console.error("❌ API Server returned error code:", healthRes.status);
    }
  } catch (err) {
    console.error("❌ Could not connect to http://localhost:3000. Is the server running?");
  }
}

runTest();
