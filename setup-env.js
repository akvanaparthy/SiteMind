#!/usr/bin/env node

/**
 * Interactive .env setup script for SiteMind
 * Run with: node setup-env.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function generateSecret() {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

async function setupEnv() {
  console.log("🚀 SiteMind Environment Setup\n");
  console.log(
    "This script will help you create a .env file with the correct configuration.\n"
  );

  // Check if .env already exists
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const overwrite = await question(
      "⚠️  .env file already exists. Overwrite? (y/N): "
    );
    if (overwrite.toLowerCase() !== "y" && overwrite.toLowerCase() !== "yes") {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }
  }

  console.log("📋 Let's gather your configuration:\n");

  // Database configuration
  console.log("🗄️  Database Configuration:");
  const dbHost =
    (await question("PostgreSQL host (default: localhost): ")) || "localhost";
  const dbPort =
    (await question("PostgreSQL port (default: 5432): ")) || "5432";
  const dbName =
    (await question("Database name (default: sitemind): ")) || "sitemind";
  const dbUser =
    (await question("Database username (default: postgres): ")) || "postgres";
  const dbPassword = await question("Database password: ");

  if (!dbPassword) {
    console.log("❌ Database password is required!");
    rl.close();
    return;
  }

  // LMStudio configuration
  console.log("\n🤖 LMStudio Configuration:");
  const lmstudioHost =
    (await question("LMStudio host (default: localhost): ")) || "localhost";
  const lmstudioPort =
    (await question("LMStudio port (default: 1234): ")) || "1234";
  const modelName =
    (await question(
      "Model name (default: llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b): "
    )) ||
    "llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b";

  // Server configuration
  console.log("\n🌐 Server Configuration:");
  const mainPort =
    (await question("Main app port (default: 3000): ")) || "3000";
  const agentPort =
    (await question("AI agent port (default: 3001): ")) || "3001";

  // Generate secret
  console.log("\n🔐 Generating secure secret...");
  const secret = await generateSecret();

  // Create .env content
  const envContent = `# ===========================================
# SiteMind Configuration
# ===========================================
# Generated on ${new Date().toISOString()}
# 
# This file contains environment variables that override the config.json settings.
# All settings can be configured in config.json, but environment variables take precedence.

# ===========================================
# Application Settings
# ===========================================
APP_NAME="SiteMind"
APP_VERSION="1.0.0"
NODE_ENV="development"

# ===========================================
# Server Configuration
# ===========================================
# Main application server
PORT=${mainPort}
HOST="localhost"
NEXTAUTH_URL="http://localhost:${mainPort}"
NEXTAUTH_SECRET="${secret}"

# AI Agent server
AGENT_PORT=${agentPort}
AGENT_HOST="localhost"
AGENT_URL="http://localhost:${agentPort}"

# WebSocket Configuration
NEXT_PUBLIC_WS_URL="http://localhost:${agentPort}"
WS_PATH="/ws"
WS_RECONNECT_ATTEMPTS=5
WS_RECONNECT_DELAY=1000

# ===========================================
# Database Configuration
# ===========================================
# PostgreSQL Database URL
DATABASE_URL="postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"
DB_POOL_MIN=2
DB_POOL_MAX=10

# ===========================================
# LLM Configuration
# ===========================================
# Provider: "lmstudio" or "openai"
LLM_PROVIDER="lmstudio"

# Model Configuration
LLM_MODEL_NAME="${modelName}"
LLM_TEMP_MAIN=0.1
LLM_TEMP_BLOG=0.7
LLM_TEMP_CREATIVE=0.9
LLM_MAX_TOKENS_DEFAULT=2048
LLM_MAX_TOKENS_BLOG=4000
LLM_MAX_TOKENS_SHORT=100

# LMStudio Configuration
OPENAI_API_BASE="http://${lmstudioHost}:${lmstudioPort}/v1"
OPENAI_API_KEY="lm-studio"
LLM_TIMEOUT=30000
LLM_AUTO_LOAD=true
LLM_FALLBACK_MODELS="llama-3.2-8x3b-moe,dark-champion"

# ===========================================
# Features Configuration
# ===========================================
AUTO_MODEL_LOADING=true
WS_RECONNECTION=true
LOG_LEVEL="info"
MAX_LOGS=1000
CACHING_ENABLED=true
CACHE_TTL=3600

# ===========================================
# Security Configuration
# ===========================================
CORS_ORIGIN="http://localhost:${mainPort},http://localhost:${agentPort}"
CORS_CREDENTIALS=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# ===========================================
# External Services
# ===========================================
# Pinecone (optional - for vector storage)
PINECONE_API_KEY=""
PINECONE_ENVIRONMENT=""
PINECONE_INDEX_NAME="sitemind-agent-memory"
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ .env file created successfully!");
    console.log(`📁 Location: ${envPath}`);

    console.log("\n📋 Next steps:");
    console.log("1. Make sure PostgreSQL is running");
    console.log("2. Create the database:");
    console.log(`   psql -U ${dbUser} -c "CREATE DATABASE ${dbName};"`);
    console.log("3. Start LMStudio and load your model");
    console.log("4. Run: npm install --legacy-peer-deps");
    console.log("5. Run: npx prisma db push");
    console.log("6. Run: npm run dev (in one terminal)");
    console.log("7. Run: cd api-agent && npm run dev (in another terminal)");

    console.log("\n🎯 Your configuration:");
    console.log(
      `   Database: postgresql://${dbUser}:***@${dbHost}:${dbPort}/${dbName}`
    );
    console.log(`   LMStudio: http://${lmstudioHost}:${lmstudioPort}`);
    console.log(`   Model: ${modelName}`);
    console.log(`   Main App: http://localhost:${mainPort}`);
    console.log(`   AI Agent: http://localhost:${agentPort}`);
  } catch (error) {
    console.error("❌ Error creating .env file:", error.message);
  }

  rl.close();
}

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\nSetup cancelled.");
  rl.close();
  process.exit(0);
});

// Run setup
setupEnv().catch((error) => {
  console.error("❌ Setup failed:", error);
  rl.close();
  process.exit(1);
});
