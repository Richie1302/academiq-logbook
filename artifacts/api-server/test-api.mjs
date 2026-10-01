import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import fileURLToPath from "url";

dotenv.config();

console.log("-----------------------------------------");
console.log("1. Checking GROQ_API_KEY environment variable...");
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("❌ GROQ_API_KEY is missing in .env!");
  process.exit(1);
}
console.log("✅ GROQ_API_KEY exists (starts with:", apiKey.slice(0, 7) + "...)");

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: apiKey,
});

const TEXT_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

console.log("\n2. Testing Groq API live completion...");
async function testModels() {
  for (const model of TEXT_MODELS) {
    try {
      console.log(`   Trying model: ${model}...`);
      const res = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: "Say HELLO in 1 word." }],
        max_tokens: 10,
      });
      const output = res.choices[0]?.message?.content?.trim();
      console.log(`   ✅ SUCCESS with ${model}! Response: "${output}"`);
      return model;
    } catch (err) {
      console.error(`   ⚠️ Failed with ${model}: ${err?.message}`);
    }
  }
  throw new Error("All Groq models failed.");
}

testModels().then((workingModel) => {
  console.log("\n-----------------------------------------");
  console.log(`🎉 VERIFIED! Working Groq model is: ${workingModel}`);
  console.log("-----------------------------------------");
}).catch((err) => {
  console.error("\n❌ GROQ API TEST FAILED:", err.message);
});
