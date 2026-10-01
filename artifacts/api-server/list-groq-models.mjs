import fs from "fs";

const envText = fs.readFileSync("./.env", "utf8");
const groqMatch = envText.match(/^GROQ_API_KEY=(.*)$/m);
const apiKey = groqMatch ? groqMatch[1].trim() : null;

async function listModels() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { "Authorization": `Bearer ${apiKey}` },
  });
  const data = await res.json();
  console.log("ACTIVE GROQ MODELS:", JSON.stringify(data.data.map(m => m.id), null, 2));
}

listModels();
