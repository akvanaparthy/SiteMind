# SiteMind Troubleshooting Guide

This guide helps you resolve common issues when setting up SiteMind.

## 🚨 Common Issues

### 1. Dependency Installation Errors

#### Error: `No matching version found for @langchain/pinecone@^0.3.0`

**Problem:** The Pinecone package version doesn't exist.

**Solution:**

```bash
# Option 1: Use the fixed setup script
npm run setup-deps

# Option 2: Manual fix
# Remove Pinecone from package.json (it's optional)
# Then run:
npm install --legacy-peer-deps
```

#### Error: `ERESOLVE unable to resolve dependency tree`

**Problem:** Peer dependency conflicts.

**Solutions:**

```bash
# Solution 1: Use legacy peer deps
npm install --legacy-peer-deps

# Solution 2: Force installation
npm install --force

# Solution 3: Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Error: `Cannot find module` errors

**Problem:** Missing or corrupted dependencies.

**Solution:**

```bash
# Clean everything and reinstall
npm run setup-deps
```

### 2. Database Connection Issues

#### Error: `Connection refused` or `ECONNREFUSED`

**Problem:** PostgreSQL is not running.

**Solutions:**

```bash
# Windows
net start postgresql-x64-14
# or
services.msc  # Find PostgreSQL service and start it

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Error: `Authentication failed`

**Problem:** Wrong database credentials.

**Solution:**

1. Check your `.env` file
2. Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
3. Test connection manually:

```bash
psql -U postgres -h localhost -d sitemind
```

#### Error: `Database does not exist`

**Problem:** Database hasn't been created.

**Solution:**

```bash
# Create database
psql -U postgres -c "CREATE DATABASE sitemind;"

# Or use the setup script
npm run setup-db
```

### 3. LMStudio Connection Issues

#### Error: `Could not connect to LMStudio API`

**Problem:** LMStudio is not running or wrong port.

**Solutions:**

1. **Start LMStudio:**

   - Open LMStudio application
   - Go to "Local Server" tab
   - Click "Start Server"
   - Note the port (default: 1234)

2. **Check configuration:**

   ```bash
   # Test connection
   curl http://localhost:1234/v1/models
   ```

3. **Update .env if needed:**
   ```env
   OPENAI_API_BASE="http://localhost:1234/v1"
   ```

#### Error: `Model not found`

**Problem:** Model not loaded in LMStudio.

**Solution:**

1. Download your model in LMStudio
2. Load it in the server
3. Update model name in `.env`:
   ```env
   LLM_MODEL_NAME="your-actual-model-name"
   ```

### 4. Build and Runtime Errors

#### Error: `Module not found` in Next.js

**Problem:** Missing dependencies or build cache issues.

**Solution:**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Error: `TypeScript compilation errors`

**Problem:** Type mismatches or missing types.

**Solution:**

```bash
# Check types
npm run type-check

# If using API agent
cd api-agent
npm run type-check
```

#### Error: `WebSocket connection failed`

**Problem:** Agent server not running or wrong URL.

**Solution:**

1. **Start agent server:**

   ```bash
   cd api-agent
   npm run dev
   ```

2. **Check .env configuration:**

   ```env
   NEXT_PUBLIC_WS_URL="http://localhost:3001"
   ```

3. **Verify ports:**
   - Main app: 3000
   - Agent: 3001

### 5. Configuration Issues

#### Error: `Config file not found`

**Problem:** Missing config.json or .env file.

**Solution:**

```bash
# Create .env file
npm run setup-env

# Or copy from example
cp env.example .env
```

#### Error: `Invalid configuration`

**Problem:** Wrong values in config files.

**Solution:**

1. Check `config.json` syntax (valid JSON)
2. Verify `.env` format (no spaces around =)
3. Use setup scripts to regenerate:
   ```bash
   npm run setup-env
   ```

## 🔧 Advanced Troubleshooting

### Complete Clean Setup

If nothing else works, try a complete clean setup:

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json
rm -rf api-agent/node_modules api-agent/package-lock.json
rm -rf .next

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall everything
npm run setup-deps

# 4. Setup environment
npm run setup-env

# 5. Setup database
npm run setup-db
```

### Dependency Version Conflicts

If you're still having dependency issues:

1. **Check Node.js version:**

   ```bash
   node --version  # Should be 18+
   npm --version
   ```

2. **Use exact versions:**

   ```bash
   # Remove ^ and ~ from package.json versions
   # Install with exact versions
   npm install --save-exact
   ```

3. **Use yarn instead:**

   ```bash
   # Install yarn
   npm install -g yarn

   # Use yarn for installation
   yarn install
   ```

### Database Issues

#### PostgreSQL Service Issues

**Windows:**

```bash
# Check service status
sc query postgresql-x64-14

# Start service
net start postgresql-x64-14

# Or use pg_ctl
pg_ctl start -D "C:\Program Files\PostgreSQL\14\data"
```

**macOS:**

```bash
# Check if running
brew services list | grep postgresql

# Start service
brew services start postgresql

# Or start manually
pg_ctl -D /usr/local/var/postgres start
```

**Linux:**

```bash
# Check status
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql
```

#### Database Permission Issues

```sql
-- Connect as postgres user
psql -U postgres

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sitemind TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### LMStudio Issues

#### Model Loading Problems

1. **Check model file:**

   - Ensure model is downloaded completely
   - Check file size (should be ~18GB for the specified model)
   - Verify model format (GGUF)

2. **LMStudio Server Issues:**

   ```bash
   # Test server health
   curl http://localhost:1234/health

   # List loaded models
   curl http://localhost:1234/v1/models
   ```

3. **Alternative LMStudio Setup:**
   - Try different port (1235, 1236, etc.)
   - Update .env accordingly
   - Restart LMStudio completely

## 🆘 Getting Help

If you're still having issues:

1. **Check logs:**

   ```bash
   # Main app logs
   npm run dev

   # Agent logs
   cd api-agent && npm run dev
   ```

2. **Test components individually:**

   ```bash
   # Test database
   npm run setup-db

   # Test LMStudio
   cd api-agent && npm run test-lmstudio
   ```

3. **Verify environment:**

   ```bash
   # Check Node.js version
   node --version

   # Check npm version
   npm --version

   # Check PostgreSQL
   psql --version
   ```

4. **Common solutions:**
   - Restart all services (PostgreSQL, LMStudio)
   - Clear all caches (npm, Next.js)
   - Use exact dependency versions
   - Check firewall/antivirus settings

## 📝 Environment-Specific Issues

### Windows Issues

- **Path issues:** Ensure PostgreSQL and Node.js are in PATH
- **Permission issues:** Run as Administrator if needed
- **Service issues:** Use Services.msc to manage PostgreSQL

### macOS Issues

- **Homebrew issues:** Update Homebrew and packages
- **Permission issues:** Check file permissions
- **Port conflicts:** Use different ports if needed

### Linux Issues

- **Service issues:** Use systemctl for service management
- **Permission issues:** Check user permissions
- **Firewall issues:** Check ufw/iptables settings

## 🔄 Recovery Steps

If everything is broken:

1. **Backup your .env file**
2. **Run complete clean setup:**
   ```bash
   npm run setup
   ```
3. **If that fails, manual recovery:**

   ```bash
   # Clean everything
   rm -rf node_modules .next api-agent/node_modules

   # Reinstall step by step
   npm install --legacy-peer-deps
   cd api-agent && npm install --legacy-peer-deps && cd ..

   # Setup environment
   npm run setup-env

   # Setup database
   npm run setup-db
   ```

Remember: Most issues are related to dependencies, database connections, or LMStudio setup. The setup scripts should handle most of these automatically.
