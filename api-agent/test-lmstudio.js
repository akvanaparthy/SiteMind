/**
 * Simple test script to verify LMStudio integration
 * Run with: node test-lmstudio.js
 */

const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Load configuration
let config;
try {
  const configPath = path.join(__dirname, "..", "config.json");
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (error) {
  console.warn("Could not load config.json, using environment variables");
}

const BASE_URL =
  process.env.OPENAI_API_BASE?.replace("/v1", "") ||
  config?.llm?.lmstudio?.baseUrl ||
  "http://localhost:1234";
const MODEL_NAME =
  process.env.LLM_MODEL_NAME ||
  config?.llm?.model?.name ||
  "llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b";

async function testLMStudio() {
  console.log("🧪 Testing LMStudio Integration...\n");

  try {
    // Test 1: Check if LMStudio is running
    console.log("1. Checking if LMStudio is running...");
    const modelsEndpoint =
      config?.llm?.lmstudio?.endpoints?.models || "/v1/models";
    const modelsResponse = await fetch(`${BASE_URL}${modelsEndpoint}`);

    if (!modelsResponse.ok) {
      console.log("❌ LMStudio is not running or not accessible");
      console.log(`   Make sure LMStudio is running on ${BASE_URL}`);
      return;
    }

    console.log("✅ LMStudio is running and accessible");

    // Test 2: List available models
    console.log("\n2. Listing available models...");
    const models = await modelsResponse.json();
    console.log("Available models:");
    models.data?.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.id}`);
    });

    // Test 3: Check if our specific model is loaded
    console.log("\n3. Checking if target model is loaded...");
    const isLoaded = models.data?.some(
      (model) =>
        model.id === MODEL_NAME ||
        model.id.includes("llama-3.2-8x3b-moe") ||
        model.id.includes("dark-champion")
    );

    if (isLoaded) {
      console.log("✅ Target model is already loaded");
    } else {
      console.log("⚠️  Target model is not loaded, attempting to load...");

      // Test 4: Try to load the model
      const loadEndpoint =
        config?.llm?.lmstudio?.endpoints?.load || "/api/v0/models/load";
      const loadResponse = await fetch(`${BASE_URL}${loadEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL_NAME }),
      });

      if (loadResponse.ok) {
        console.log("✅ Model loaded successfully");
      } else {
        console.log("❌ Failed to load model");
        console.log(`   Response: ${await loadResponse.text()}`);
      }
    }

    // Test 5: Test a simple API call
    console.log("\n4. Testing API call...");
    const chatEndpoint =
      config?.llm?.lmstudio?.endpoints?.chat || "/v1/chat/completions";
    const testResponse = await fetch(`${BASE_URL}${chatEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer lm-studio",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content:
              'Hello! Please respond with "LMStudio integration working!"',
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log("✅ API call successful");
      console.log(
        `   Response: ${result.choices[0]?.message?.content || "No response"}`
      );
    } else {
      console.log("❌ API call failed");
      console.log(`   Status: ${testResponse.status}`);
      console.log(`   Response: ${await testResponse.text()}`);
    }
  } catch (error) {
    console.log("❌ Error during testing:");
    console.log(`   ${error.message}`);
  }

  console.log("\n🏁 Test completed!");
}

// Run the test
testLMStudio();
