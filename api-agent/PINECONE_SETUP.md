# 🧠 Pinecone Memory Setup Guide

## Quick Start

### Step 1: Get Pinecone API Key

1. Go to [https://www.pinecone.io/](https://www.pinecone.io/)
2. Sign up for a free account (no credit card required)
3. Create a new project
4. Copy your API key from the dashboard

### Step 2: Create Index

In Pinecone Console:

1. Click **"Create Index"**
2. Fill in the details:
   ```
   Name: sitemind-agent-memory
   Dimensions: 1536
   Metric: cosine
   Region: Choose any available (e.g., us-east-1)
   ```
3. Click **"Create Index"**
4. Wait for index to be ready (~30 seconds)

### Step 3: Configure Agent

Edit `api-agent/.env`:

```bash
# Pinecone Configuration
PINECONE_API_KEY=pcsk_xxxxxx_your_actual_key_here
PINECONE_INDEX_NAME=sitemind-agent-memory
PINECONE_NAMESPACE=agent-memory
PINECONE_DIMENSIONS=1536
PINECONE_METRIC=cosine
```

### Step 4: Test Integration

```bash
cd api-agent
npm run test:memory
```

Expected output:
```
🧪 Testing Pinecone Memory Integration
✅ Pinecone is configured
📡 Initializing Pinecone...
✅ Pinecone initialized
📊 Memory Statistics:
   Index: sitemind-agent-memory
   Namespace: agent-memory
   Total Vectors: 0
💾 Storing test memories...
   ✅ Stored: "List all pending orders"
   ✅ Stored: "Close ticket #45"
   ✅ Stored: "Update order #ABC123 to delivered"
🔍 Testing memory retrieval...
✅ All tests completed successfully!
```

### Step 5: Start Agent

```bash
npm run dev
```

You should see:
```
🧠 Initializing Pinecone memory...
✅ Pinecone initialized
   Index: sitemind-agent-memory
   Namespace: agent-memory
   Vectors: 3
```

---

## ✅ Verification Checklist

- [ ] Pinecone account created
- [ ] API key obtained
- [ ] Index created (name: `sitemind-agent-memory`, dimensions: `1536`, metric: `cosine`)
- [ ] `.env` file updated with `PINECONE_API_KEY`
- [ ] Test passed: `npm run test:memory`
- [ ] Agent starts with "Pinecone initialized" message

---

## 🔧 Configuration Reference

### Required Settings

```bash
# Minimum required configuration
PINECONE_API_KEY=your_key_here        # REQUIRED
PINECONE_INDEX_NAME=sitemind-agent-memory  # Must match your index name
```

### Optional Settings

```bash
PINECONE_NAMESPACE=agent-memory       # Default: agent-memory
PINECONE_DIMENSIONS=1536              # Default: 1536 (must match index)
PINECONE_METRIC=cosine                # Default: cosine
```

---

## 🎯 How It Works

### 1. When User Sends Request

```
User: "List all pending orders"
    ↓
Agent searches Pinecone for similar past interactions
    ↓
Found: "Show me pending orders" (2 hours ago)
    ↓
Agent uses this context to understand intent better
```

### 2. After Agent Responds

```
Agent: "I found 3 pending orders..."
    ↓
Agent stores this interaction in Pinecone:
   - User prompt
   - Agent response
   - Actions performed (e.g., list_orders)
    ↓
Memory available for future requests
```

### 3. Cross-Session Memory

```
Session 1 (Today):
User: "Update order #ABC123 to delivered"
Agent: "Marked as DELIVERED"
[Stored in Pinecone]

Session 2 (Tomorrow):
User: "What happened with order ABC123?"
Agent: "I updated it to DELIVERED yesterday"
[Retrieved from Pinecone]
```

---

## 📊 Free Tier Limits

Pinecone free tier includes:
- ✅ 1 index
- ✅ 1 million vectors
- ✅ 100 queries per second
- ✅ No credit card required

**This is sufficient for:**
- ~1 million conversations
- Years of typical usage
- Full development and testing

---

## 🐛 Troubleshooting

### Problem: "Pinecone not configured"

**Solution:**
- Check `.env` file has `PINECONE_API_KEY`
- Verify no typos in variable name
- Restart agent after changing `.env`

### Problem: "Failed to initialize Pinecone"

**Solutions:**
1. Verify API key is valid
2. Check internet connection
3. Ensure Pinecone service is accessible

### Problem: "Index not found"

**Solution:**
- Create index in Pinecone console
- Ensure index name matches `PINECONE_INDEX_NAME` in `.env`
- Wait 30 seconds after creating index

### Problem: "Dimension mismatch"

**Solution:**
- Index dimensions must be `1536`
- Check `PINECONE_DIMENSIONS` in `.env` is `1536`
- Recreate index if needed

---

## 📚 Additional Resources

- **Full Documentation:** `docs/PINECONE_MEMORY.md`
- **Pinecone Docs:** https://docs.pinecone.io/
- **API Reference:** https://docs.pinecone.io/reference/api/introduction
- **Support:** https://support.pinecone.io/

---

## 🎉 Success Indicators

When everything is working:

1. ✅ Agent startup shows "Memory: ENABLED (Pinecone)"
2. ✅ Test suite passes without errors
3. ✅ Agent logs show "Retrieving relevant memories"
4. ✅ Agent logs show "Memory stored" after responses
5. ✅ Agent provides context-aware responses

---

**Need Help?** Check the troubleshooting section or full documentation in `docs/PINECONE_MEMORY.md`
