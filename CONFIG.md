# SiteMind Configuration Guide

This guide explains how to configure SiteMind using the centralized configuration system.

## Configuration Files

### 1. `config.json` (Primary Configuration)

The main configuration file located in the project root. Contains all default settings.

### 2. `.env` (Environment Overrides)

Environment variables that override `config.json` settings. Copy from `env.example`.

## Configuration Structure

### Application Settings

```json
{
  "app": {
    "name": "SiteMind",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

### Server Configuration

```json
{
  "server": {
    "main": {
      "port": 3000,
      "host": "localhost",
      "url": "http://localhost:3000"
    },
    "agent": {
      "port": 3001,
      "host": "localhost",
      "url": "http://localhost:3001",
      "websocket": {
        "path": "/ws",
        "reconnectAttempts": 5,
        "reconnectDelay": 1000
      }
    }
  }
}
```

### LLM Configuration

```json
{
  "llm": {
    "provider": "lmstudio",
    "model": {
      "name": "llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b",
      "temperature": {
        "main": 0.1,
        "blog": 0.7,
        "creative": 0.9
      },
      "maxTokens": {
        "default": 2048,
        "blog": 4000,
        "short": 100
      }
    },
    "lmstudio": {
      "baseUrl": "http://localhost:1234",
      "apiKey": "lm-studio",
      "endpoints": {
        "models": "/v1/models",
        "chat": "/v1/chat/completions",
        "load": "/api/v0/models/load"
      },
      "timeout": 30000,
      "autoLoad": true,
      "fallbackModels": ["llama-3.2-8x3b-moe", "dark-champion"]
    }
  }
}
```

## Environment Variables

All settings can be overridden using environment variables:

### Server Settings

- `PORT` - Main application port (default: 3000)
- `AGENT_PORT` - AI agent port (default: 3001)
- `HOST` - Server host (default: localhost)
- `NEXTAUTH_URL` - Main application URL

### LLM Settings

- `LLM_PROVIDER` - LLM provider ("lmstudio" or "openai")
- `LLM_MODEL_NAME` - Model name to use
- `LLM_TEMP_MAIN` - Temperature for main agent (default: 0.1)
- `LLM_TEMP_BLOG` - Temperature for blog generation (default: 0.7)
- `LLM_TEMP_CREATIVE` - Temperature for creative tasks (default: 0.9)
- `OPENAI_API_BASE` - API base URL
- `OPENAI_API_KEY` - API key
- `LLM_AUTO_LOAD` - Auto-load model in LMStudio (default: true)

### Database Settings

- `DATABASE_URL` - PostgreSQL connection string
- `DB_POOL_MIN` - Minimum connection pool size
- `DB_POOL_MAX` - Maximum connection pool size

### WebSocket Settings

- `WS_PATH` - WebSocket path (default: "/ws")
- `WS_RECONNECT_ATTEMPTS` - Max reconnection attempts
- `WS_RECONNECT_DELAY` - Delay between reconnection attempts

### Feature Flags

- `AUTO_MODEL_LOADING` - Enable automatic model loading
- `WS_RECONNECTION` - Enable WebSocket reconnection
- `CACHING_ENABLED` - Enable caching
- `RATE_LIMIT_ENABLED` - Enable rate limiting

## Quick Setup

### 1. Copy Environment File

```bash
cp env.example .env
```

### 2. Edit Configuration

Edit `config.json` or `.env` to match your setup:

```json
{
  "llm": {
    "model": {
      "name": "your-model-name-here"
    },
    "lmstudio": {
      "baseUrl": "http://your-lmstudio-host:1234"
    }
  }
}
```

### 3. Update Database URL

```bash
# In .env
DATABASE_URL="postgresql://username:password@localhost:5432/sitemind"
```

## Configuration Priority

1. **Environment Variables** (highest priority)
2. **config.json** (default values)
3. **Hardcoded defaults** (fallback)

## Common Configurations

### Local Development

```json
{
  "llm": {
    "provider": "lmstudio",
    "lmstudio": {
      "baseUrl": "http://localhost:1234",
      "autoLoad": true
    }
  }
}
```

### Production with OpenAI

```json
{
  "llm": {
    "provider": "openai",
    "openai": {
      "baseUrl": "https://api.openai.com/v1",
      "apiKey": "sk-..."
    }
  }
}
```

### Custom LMStudio Setup

```json
{
  "llm": {
    "model": {
      "name": "your-custom-model-name"
    },
    "lmstudio": {
      "baseUrl": "http://192.168.1.100:1234",
      "endpoints": {
        "models": "/v1/models",
        "chat": "/v1/chat/completions",
        "load": "/api/v0/models/load"
      }
    }
  }
}
```

## Testing Configuration

Test your LMStudio configuration:

```bash
cd api-agent
npm run test-lmstudio
```

## Troubleshooting

### Configuration Not Loading

- Check file permissions on `config.json`
- Verify JSON syntax is valid
- Check environment variable names match exactly

### Model Not Loading

- Verify `LLM_MODEL_NAME` matches your model exactly
- Check `LLM_AUTO_LOAD` is set to `true`
- Ensure LMStudio is running and accessible

### WebSocket Connection Issues

- Verify `NEXT_PUBLIC_WS_URL` matches agent server URL
- Check `WS_PATH` matches server configuration
- Ensure ports are not blocked by firewall

## Advanced Configuration

### Custom Endpoints

If your LMStudio instance uses different endpoints:

```json
{
  "llm": {
    "lmstudio": {
      "endpoints": {
        "models": "/custom/models",
        "chat": "/custom/chat",
        "load": "/custom/load"
      }
    }
  }
}
```

### Multiple Fallback Models

```json
{
  "llm": {
    "lmstudio": {
      "fallbackModels": [
        "llama-3.2-8x3b-moe",
        "dark-champion",
        "your-backup-model"
      ]
    }
  }
}
```

### Custom Timeouts

```json
{
  "llm": {
    "lmstudio": {
      "timeout": 60000
    }
  }
}
```

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for sensitive data in production
- Regularly rotate API keys and secrets
- Use strong passwords for database connections
