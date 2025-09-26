#!/usr/bin/env node

/**
 * Database setup script for SiteMind
 * Run with: node setup-database.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: "inherit" });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found!");
    console.log("Please run: npm run setup-env");
    process.exit(1);
  }
  return envPath;
}

function getDatabaseUrl() {
  const envPath = checkEnvFile();
  const envContent = fs.readFileSync(envPath, "utf8");

  const match = envContent.match(/DATABASE_URL="([^"]+)"/);
  if (!match) {
    console.error("❌ DATABASE_URL not found in .env file");
    process.exit(1);
  }

  return match[1];
}

function parseDatabaseUrl(url) {
  // Parse postgresql://user:password@host:port/database
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error("Invalid DATABASE_URL format");
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

async function setupDatabase() {
  console.log("🗄️  SiteMind Database Setup\n");

  try {
    // Get database configuration
    const dbUrl = getDatabaseUrl();
    const dbConfig = parseDatabaseUrl(dbUrl);

    console.log("📋 Database Configuration:");
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}\n`);

    // Test connection
    console.log("🔍 Testing database connection...");
    try {
      runCommand(
        `psql "${dbUrl}" -c "SELECT version();"`,
        "Database connection test"
      );
    } catch (error) {
      console.log("\n⚠️  Database connection failed. This might be because:");
      console.log("   1. PostgreSQL is not running");
      console.log("   2. Database does not exist");
      console.log("   3. User does not have permissions");
      console.log("   4. Wrong credentials\n");

      const createDb = await askQuestion(
        "Would you like to create the database? (y/N): "
      );
      if (createDb.toLowerCase() === "y" || createDb.toLowerCase() === "yes") {
        try {
          // Try to create database
          const createDbUrl = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/postgres`;
          runCommand(
            `psql "${createDbUrl}" -c "CREATE DATABASE ${dbConfig.database};"`,
            "Creating database"
          );
        } catch (createError) {
          console.log("\n❌ Could not create database automatically.");
          console.log("Please create it manually:");
          console.log(
            `   psql -U ${dbConfig.user} -c "CREATE DATABASE ${dbConfig.database};"`
          );
          console.log("\nOr connect to PostgreSQL and run:");
          console.log(`   CREATE DATABASE ${dbConfig.database};`);
          process.exit(1);
        }
      } else {
        console.log("Please fix the database connection and try again.");
        process.exit(1);
      }
    }

    // Push Prisma schema
    runCommand("npx prisma db push", "Pushing Prisma schema to database");

    // Generate Prisma client
    runCommand("npx prisma generate", "Generating Prisma client");

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Start LMStudio and load your model");
    console.log("2. Run: npm run dev (main application)");
    console.log("3. Run: cd api-agent && npm run dev (AI agent)");
    console.log("4. Test LMStudio: cd api-agent && npm run test-lmstudio");
  } catch (error) {
    console.error("\n❌ Database setup failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure PostgreSQL is installed and running");
    console.log("2. Check your DATABASE_URL in .env file");
    console.log("3. Ensure the database user has proper permissions");
    console.log("4. Try creating the database manually");
    process.exit(1);
  }
}

function askQuestion(question) {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\nSetup cancelled.");
  process.exit(0);
});

// Run setup
setupDatabase();
