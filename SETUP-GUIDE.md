# SiteMind Complete Setup Guide

This guide will walk you through setting up all the required services and configuration for SiteMind.

## 📋 Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- PostgreSQL installed and running
- LMStudio installed (for local LLM)
- Git installed

## 🗄️ Database Setup (PostgreSQL)

### 1. Install PostgreSQL

**Windows:**

- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Install with default settings
- Remember the password you set for the `postgres` user

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

Connect to PostgreSQL:

```bash
# Windows (if added to PATH)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Create database and user:

```sql
-- Create database
CREATE DATABASE sitemind;

-- Create user (optional - you can use postgres user)
CREATE USER sitemind_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sitemind TO sitemind_user;

-- Exit
\q
```

### 3. Test Connection

```bash
# Test connection
psql -h localhost -U postgres -d sitemind
# or with custom user
psql -h localhost -U sitemind_user -d sitemind
```

## 🤖 LMStudio Setup

### 1. Download and Install LMStudio

- Download from [lmstudio.ai](https://lmstudio.ai/)
- Install and launch the application

### 2. Download Your Model

1. Open LMStudio
2. Go to "Models" tab
3. Search for: `llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b`
4. Download the model (this may take a while - it's ~18GB)

### 3. Start Local Server

1. Go to "Local Server" tab in LMStudio
2. Click "Start Server"
3. Note the port (default: 1234)
4. Load your model in the server

## ⚙️ Environment Configuration

### 1. Create .env File

Copy the example file:

```bash
cp env.example .env
```

### 2. Update Database Configuration

Edit your `.env` file and update the database URL:

```env
# Option 1: Using postgres user (simpler)
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/sitemind"

# Option 2: Using custom user
DATABASE_URL="postgresql://sitemind_user:your_secure_password@localhost:5432/sitemind"
```

**Replace:**

- `your_postgres_password` with your actual PostgreSQL password
- `your_secure_password` with your custom user password

### 3. Update LMStudio Configuration

```env
# If LMStudio is running on different port
OPENAI_API_BASE="http://localhost:1234/v1"

# If your model has a different name
LLM_MODEL_NAME="your-actual-model-name"
```

### 4. Generate Secret Key

Generate a secure secret for NextAuth:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator
# https://generate-secret.vercel.app/32
```

Update in `.env`:

```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

## 🚀 Complete Setup Commands

### 1. Install Dependencies

```bash
# Install main dependencies
npm install --legacy-peer-deps

# Install AI agent dependencies
cd api-agent
npm install --legacy-peer-deps
cd ..
```

### 2. Setup Database Schema

```bash
# Push Prisma schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. Test LMStudio Connection

```bash
cd api-agent
npm run test-lmstudio
```

### 4. Start Development Servers

**Terminal 1 - Main Application:**

```bash
npm run dev
```

**Terminal 2 - AI Agent:**

```bash
cd api-agent
npm run dev
```

## 🔧 Configuration Examples

### Local Development Setup

```env
# Database
DATABASE_URL="postgresql://postgres:password123@localhost:5432/sitemind"

# LMStudio
OPENAI_API_BASE="http://localhost:1234/v1"
LLM_MODEL_NAME="llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b"

# Security
NEXTAUTH_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
```

### Production Setup

```env
# Database (use environment-specific values)
DATABASE_URL="postgresql://prod_user:secure_prod_password@prod-db-host:5432/sitemind_prod"

# OpenAI (for production)
LLM_PROVIDER="openai"
OPENAI_API_BASE="https://api.openai.com/v1"
OPENAI_API_KEY="sk-your-openai-api-key"

# Security
NEXTAUTH_SECRET="production-secret-key"
NODE_ENV="production"
```

### Custom LMStudio Setup

```env
# Custom LMStudio host/port
OPENAI_API_BASE="http://192.168.1.100:1234/v1"

# Custom model name
LLM_MODEL_NAME="your-custom-model-name"

# Custom endpoints (if needed)
LLM_FALLBACK_MODELS="your-model,backup-model"
```

## 🧪 Testing Your Setup

### 1. Test Database Connection

```bash
# Test with Prisma
npx prisma db pull
```

### 2. Test LMStudio

```bash
cd api-agent
npm run test-lmstudio
```

Expected output:

```
🧪 Testing LMStudio Integration...

1. Checking if LMStudio is running...
✅ LMStudio is running and accessible

2. Listing available models...
Available models:
   1. llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b

3. Checking if target model is loaded...
✅ Target model is already loaded

4. Testing API call...
✅ API call successful
   Response: LMStudio integration working!
```

### 3. Test Application

1. Open http://localhost:3000
2. Navigate to http://localhost:3000/admin/dashboard
3. Go to AI Agent Console
4. Try sending a command: "List all orders"

## 🐛 Troubleshooting

### Database Issues

**Connection Refused:**

```bash
# Check if PostgreSQL is running
# Windows
net start postgresql-x64-14

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

**Authentication Failed:**

- Verify username/password in DATABASE_URL
- Check if user has proper permissions

**Database Doesn't Exist:**

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE sitemind;
```

### LMStudio Issues

**Connection Refused:**

- Ensure LMStudio is running
- Check if server is started on correct port
- Verify firewall settings

**Model Not Found:**

- Check model name in LLM_MODEL_NAME
- Ensure model is downloaded in LMStudio
- Try using fallback model names

**API Calls Failing:**

- Verify OPENAI_API_BASE URL
- Check if model is loaded in LMStudio server
- Test with curl:

```bash
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 50
  }'
```

### Application Issues

**Build Errors:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**WebSocket Connection Issues:**

- Verify NEXT_PUBLIC_WS_URL matches agent server
- Check if agent server is running on correct port
- Ensure CORS settings allow the connection

## 📝 Environment Variables Reference

### Required Variables

| Variable          | Description                   | Example                                          |
| ----------------- | ----------------------------- | ------------------------------------------------ |
| `DATABASE_URL`    | PostgreSQL connection string  | `postgresql://user:pass@localhost:5432/sitemind` |
| `NEXTAUTH_SECRET` | Secret key for authentication | `random-32-char-string`                          |
| `LLM_MODEL_NAME`  | Name of your LMStudio model   | `llama-3.2-8x3b-moe-...`                         |

### Optional Variables

| Variable             | Description                 | Default                    |
| -------------------- | --------------------------- | -------------------------- |
| `PORT`               | Main app port               | `3000`                     |
| `AGENT_PORT`         | AI agent port               | `3001`                     |
| `OPENAI_API_BASE`    | LMStudio API URL            | `http://localhost:1234/v1` |
| `LLM_TEMP_MAIN`      | Main agent temperature      | `0.1`                      |
| `LLM_TEMP_BLOG`      | Blog generation temperature | `0.7`                      |
| `AUTO_MODEL_LOADING` | Auto-load model in LMStudio | `true`                     |

## 🎯 Quick Start Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `sitemind` created
- [ ] LMStudio installed and model downloaded
- [ ] LMStudio server running on port 1234
- [ ] `.env` file created with correct values
- [ ] Dependencies installed (`npm install`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] LMStudio test passing (`npm run test-lmstudio`)
- [ ] Both servers running (main app + agent)
- [ ] Application accessible at http://localhost:3000

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all services are running
3. Check logs in both terminals
4. Ensure all environment variables are set correctly
5. Test each component individually (database, LMStudio, application)

## 🔄 Updating Configuration

To change settings:

1. **Via config.json**: Edit the main config file
2. **Via .env**: Override specific settings with environment variables
3. **Restart services**: After changing configuration, restart both servers

```bash
# Restart main app
npm run dev

# Restart agent (in separate terminal)
cd api-agent && npm run dev
```
