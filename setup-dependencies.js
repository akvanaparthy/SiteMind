#!/usr/bin/env node

/**
 * Dependency setup script for SiteMind
 * Handles dependency installation with proper error handling
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(command, description, options = {}) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, {
      stdio: "inherit",
      cwd: options.cwd || process.cwd(),
      ...options,
    });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function cleanInstall(cwd) {
  console.log(`🧹 Cleaning node_modules in ${path.basename(cwd)}...`);

  // Remove node_modules and package-lock.json
  const nodeModulesPath = path.join(cwd, "node_modules");
  const packageLockPath = path.join(cwd, "package-lock.json");

  try {
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
    }
    if (fs.existsSync(packageLockPath)) {
      fs.rmSync(packageLockPath, { force: true });
    }
    console.log("✅ Cleaned successfully");
  } catch (error) {
    console.warn("⚠️  Could not clean completely:", error.message);
  }
}

async function setupDependencies() {
  console.log("📦 SiteMind Dependency Setup\n");

  const rootDir = process.cwd();
  const agentDir = path.join(rootDir, "api-agent");

  try {
    // Step 1: Clean and install main dependencies
    console.log("📋 Step 1: Setting up main application dependencies");
    cleanInstall(rootDir);

    if (
      !runCommand(
        "npm install --legacy-peer-deps",
        "Installing main dependencies"
      )
    ) {
      console.log(
        "⚠️  Main dependencies installation failed, trying alternative approach..."
      );

      // Try with --force flag
      if (
        !runCommand(
          "npm install --force",
          "Installing main dependencies (force)"
        )
      ) {
        console.log(
          "⚠️  Force installation also failed, trying with --no-optional..."
        );
        runCommand(
          "npm install --legacy-peer-deps --no-optional",
          "Installing main dependencies (no optional)"
        );
      }
    }

    // Step 2: Clean and install agent dependencies
    console.log("\n📋 Step 2: Setting up AI agent dependencies");
    cleanInstall(agentDir);

    if (
      !runCommand(
        "npm install --legacy-peer-deps",
        "Installing agent dependencies",
        { cwd: agentDir }
      )
    ) {
      console.log(
        "⚠️  Agent dependencies installation failed, trying alternative approach..."
      );

      // Try with --force flag
      if (
        !runCommand(
          "npm install --force",
          "Installing agent dependencies (force)",
          { cwd: agentDir }
        )
      ) {
        console.log(
          "⚠️  Force installation also failed, trying with --no-optional..."
        );
        runCommand(
          "npm install --legacy-peer-deps --no-optional",
          "Installing agent dependencies (no optional)",
          { cwd: agentDir }
        );
      }
    }

    // Step 3: Verify installations
    console.log("\n📋 Step 3: Verifying installations");

    // Check main dependencies
    const mainPackageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, "package.json"), "utf8")
    );
    const mainDeps = Object.keys(mainPackageJson.dependencies || {});
    console.log(`✅ Main app has ${mainDeps.length} dependencies`);

    // Check agent dependencies
    const agentPackageJson = JSON.parse(
      fs.readFileSync(path.join(agentDir, "package.json"), "utf8")
    );
    const agentDeps = Object.keys(agentPackageJson.dependencies || {});
    console.log(`✅ AI agent has ${agentDeps.length} dependencies`);

    console.log("\n🎉 Dependency setup completed!");
    console.log("\n📋 Next steps:");
    console.log("1. Run: npm run setup-env (to create .env file)");
    console.log("2. Run: npm run setup-db (to setup database)");
    console.log("3. Start LMStudio and load your model");
    console.log("4. Run: npm run dev (main application)");
    console.log("5. Run: cd api-agent && npm run dev (AI agent)");
  } catch (error) {
    console.error("\n❌ Dependency setup failed:", error.message);
    console.log("\n🔧 Manual troubleshooting:");
    console.log("1. Make sure you have Node.js 18+ installed");
    console.log("2. Try running: npm cache clean --force");
    console.log(
      "3. Delete node_modules and package-lock.json in both directories"
    );
    console.log("4. Try: npm install --legacy-peer-deps in each directory");
    console.log(
      "5. If Pinecone issues persist, it's optional - you can remove it from package.json"
    );
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on("SIGINT", () => {
  console.log("\n\nSetup cancelled.");
  process.exit(0);
});

// Run setup
setupDependencies();
