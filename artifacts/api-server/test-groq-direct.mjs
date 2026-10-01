import fs from "fs";

console.log("-----------------------------------------");
console.log("Testing Groq API directly via HTTP fetch...");

// Parse .env manually
const envText = fs.readFileSync("./.env", "utf8");
const groqMatch = envText.match(/^GROQ_API_KEY=(.*)$/m);
const apiKey = groqMatch ? groqMatch[1].trim() : null;

if (!apiKey) {
  console.error("❌ Could not find GROQ_API_KEY in .env");
  process.exit(1);
}

console.log("Found GROQ_API_KEY:", apiKey.slice(0, 8) + "...");

const TEXT_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "groq/compound",
  "groq/compound-mini",
];

async function testGroqDirect() {
  for (const model of TEXT_MODELS) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hello! Respond with: GROQ_WORKING" }],
          max_tokens: 15,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`⚠️ Model ${model} returned ${res.status}:`, errText.slice(0, 150));
        continue;
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      console.log(`\n✅ SUCCESS! Model ${model} responded: "${reply}"`);
      console.log("-----------------------------------------");
      return;
    } catch (err) {
      console.error(`⚠️ Network error with ${model}:`, err.message);
    }
  }
  console.error("\n❌ All Groq models failed.");
}

testGroqDirect();
