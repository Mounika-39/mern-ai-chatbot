import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

console.log("Testing OpenRouter API...");

// List of free models to try
const models = [
  "mistralai/mistral-7b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

async function testModel(model) {
  console.log(`\n📡 Testing model: ${model}`);
  
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: [
          {
            role: "user",
            content: "Say hello in 2 words"
          }
        ],
        max_tokens: 50
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );
    console.log(`✅ ${model} WORKS!`);
    console.log(`Response: ${response.data.choices[0].message.content}`);
    return true;
  } catch (error) {
    console.log(`❌ ${model} FAILED: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function testAll() {
  console.log("Testing multiple models...");
  
  for (const model of models) {
    await testModel(model);
    // Wait 2 seconds between tests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testAll();