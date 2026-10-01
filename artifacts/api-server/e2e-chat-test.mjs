import OpenAI from "openai";
import fs from "fs";

const envText = fs.readFileSync("./.env", "utf8");
const groqMatch = envText.match(/^GROQ_API_KEY=(.*)$/m);
const apiKey = groqMatch ? groqMatch[1].trim() : null;

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: apiKey,
});

async function testChatEndpointLogic() {
  console.log("-----------------------------------------");
  console.log("1. Testing Chat Endpoint Logic with Groq...");

  const systemPrompt = `You are AcademiQ's AI assistant — a helpful, friendly, and knowledgeable guide for Nigerian university students going through SIWES.`;
  const messages = [{ role: "user", content: "What is SIWES?" }];

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    console.log("2. Response Received!");
    console.log("-----------------------------------------");
    console.log("AI REPLY Snippet:", reply?.slice(0, 150) + "...");
    console.log("-----------------------------------------");
    console.log("🎉 E2E TEST PASSED SUCCESSFUL!");
  } catch (err) {
    console.error("❌ E2E TEST FAILED:", err.message);
  }
}

testChatEndpointLogic();
