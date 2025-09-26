import fs from "fs";
import path from "path";

export interface AgentConfig {
  app: {
    name: string;
    version: string;
    environment: string;
  };
  server: {
    port: number;
    host: string;
    url: string;
    websocket: {
      path: string;
      reconnectAttempts: number;
      reconnectDelay: number;
    };
  };
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
    };
  };
  llm: {
    provider: string;
    model: {
      name: string;
      temperature: {
        main: number;
        blog: number;
        creative: number;
      };
      maxTokens: {
        default: number;
        blog: number;
        short: number;
      };
    };
    lmstudio: {
      baseUrl: string;
      apiKey: string;
      endpoints: {
        models: string;
        chat: string;
        load: string;
      };
      timeout: number;
      autoLoad: boolean;
      fallbackModels: string[];
    };
    openai: {
      baseUrl: string;
      apiKey: string;
      timeout: number;
    };
  };
  features: {
    autoModelLoading: boolean;
    websocketReconnection: boolean;
    logging: {
      level: string;
      maxLogs: number;
    };
    caching: {
      enabled: boolean;
      ttl: number;
    };
  };
  security: {
    cors: {
      origin: string[];
      credentials: boolean;
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
  };
  external: {
    pinecone: {
      apiKey: string;
      environment: string;
      indexName: string;
    };
  };
}

class AgentConfigManager {
  private static instance: AgentConfigManager;
  private config: AgentConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): AgentConfigManager {
    if (!AgentConfigManager.instance) {
      AgentConfigManager.instance = new AgentConfigManager();
    }
    return AgentConfigManager.instance;
  }

  private loadConfig(): AgentConfig {
    // Try to load from main config.json first
    const mainConfigPath = path.join(process.cwd(), "..", "config.json");
    const localConfigPath = path.join(process.cwd(), "config.json");

    try {
      let configFile;
      if (fs.existsSync(mainConfigPath)) {
        configFile = fs.readFileSync(mainConfigPath, "utf8");
      } else if (fs.existsSync(localConfigPath)) {
        configFile = fs.readFileSync(localConfigPath, "utf8");
      }

      if (configFile) {
        const mainConfig = JSON.parse(configFile);

        // Transform main config to agent config format
        const agentConfig: AgentConfig = {
          app: mainConfig.app,
          server: {
            port: mainConfig.server.agent.port,
            host: mainConfig.server.agent.host,
            url: mainConfig.server.agent.url,
            websocket: mainConfig.server.agent.websocket,
          },
          database: mainConfig.database,
          llm: mainConfig.llm,
          features: mainConfig.features,
          security: mainConfig.security,
          external: mainConfig.external,
        };

        // Override with environment variables if they exist
        return this.mergeWithEnv(agentConfig);
      }
    } catch (error) {
      console.warn(
        "Failed to load config.json, using environment variables only:",
        error
      );
    }

    // Fallback to environment variables only
    return this.getConfigFromEnv();
  }

  private mergeWithEnv(config: AgentConfig): AgentConfig {
    return {
      ...config,
      server: {
        ...config.server,
        port: parseInt(process.env.PORT || config.server.port.toString()),
        host: process.env.HOST || config.server.host,
        url: process.env.AGENT_URL || config.server.url,
      },
      database: {
        ...config.database,
        url: process.env.DATABASE_URL || config.database.url,
      },
      llm: {
        ...config.llm,
        model: {
          ...config.llm.model,
          name: process.env.LLM_MODEL_NAME || config.llm.model.name,
        },
        lmstudio: {
          ...config.llm.lmstudio,
          baseUrl:
            process.env.OPENAI_API_BASE?.replace("/v1", "") ||
            config.llm.lmstudio.baseUrl,
          apiKey: process.env.OPENAI_API_KEY || config.llm.lmstudio.apiKey,
        },
        openai: {
          ...config.llm.openai,
          baseUrl: process.env.OPENAI_API_BASE || config.llm.openai.baseUrl,
          apiKey: process.env.OPENAI_API_KEY || config.llm.openai.apiKey,
        },
      },
      external: {
        ...config.external,
        pinecone: {
          ...config.external.pinecone,
          apiKey:
            process.env.PINECONE_API_KEY || config.external.pinecone.apiKey,
          environment:
            process.env.PINECONE_ENVIRONMENT ||
            config.external.pinecone.environment,
        },
      },
    };
  }

  private getConfigFromEnv(): AgentConfig {
    return {
      app: {
        name: process.env.APP_NAME || "SiteMind Agent",
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      server: {
        port: parseInt(process.env.PORT || "3001"),
        host: process.env.HOST || "localhost",
        url: process.env.AGENT_URL || "http://localhost:3001",
        websocket: {
          path: process.env.WS_PATH || "/ws",
          reconnectAttempts: parseInt(process.env.WS_RECONNECT_ATTEMPTS || "5"),
          reconnectDelay: parseInt(process.env.WS_RECONNECT_DELAY || "1000"),
        },
      },
      database: {
        url:
          process.env.DATABASE_URL ||
          "postgresql://username:password@localhost:5432/sitemind",
        pool: {
          min: parseInt(process.env.DB_POOL_MIN || "2"),
          max: parseInt(process.env.DB_POOL_MAX || "10"),
        },
      },
      llm: {
        provider: process.env.LLM_PROVIDER || "lmstudio",
        model: {
          name:
            process.env.LLM_MODEL_NAME ||
            "llama-3.2-8x3b-moe-dark-champion-instruct-uncensored-abliterated-18.4b",
          temperature: {
            main: parseFloat(process.env.LLM_TEMP_MAIN || "0.1"),
            blog: parseFloat(process.env.LLM_TEMP_BLOG || "0.7"),
            creative: parseFloat(process.env.LLM_TEMP_CREATIVE || "0.9"),
          },
          maxTokens: {
            default: parseInt(process.env.LLM_MAX_TOKENS_DEFAULT || "2048"),
            blog: parseInt(process.env.LLM_MAX_TOKENS_BLOG || "4000"),
            short: parseInt(process.env.LLM_MAX_TOKENS_SHORT || "100"),
          },
        },
        lmstudio: {
          baseUrl:
            process.env.OPENAI_API_BASE?.replace("/v1", "") ||
            "http://localhost:1234",
          apiKey: process.env.OPENAI_API_KEY || "lm-studio",
          endpoints: {
            models: "/v1/models",
            chat: "/v1/chat/completions",
            load: "/api/v0/models/load",
          },
          timeout: parseInt(process.env.LLM_TIMEOUT || "30000"),
          autoLoad: process.env.LLM_AUTO_LOAD !== "false",
          fallbackModels: (
            process.env.LLM_FALLBACK_MODELS ||
            "llama-3.2-8x3b-moe,dark-champion"
          ).split(","),
        },
        openai: {
          baseUrl: process.env.OPENAI_API_BASE || "https://api.openai.com/v1",
          apiKey: process.env.OPENAI_API_KEY || "",
          timeout: parseInt(process.env.LLM_TIMEOUT || "30000"),
        },
      },
      features: {
        autoModelLoading: process.env.AUTO_MODEL_LOADING !== "false",
        websocketReconnection: process.env.WS_RECONNECTION !== "false",
        logging: {
          level: process.env.LOG_LEVEL || "info",
          maxLogs: parseInt(process.env.MAX_LOGS || "1000"),
        },
        caching: {
          enabled: process.env.CACHING_ENABLED !== "false",
          ttl: parseInt(process.env.CACHE_TTL || "3600"),
        },
      },
      security: {
        cors: {
          origin: (
            process.env.CORS_ORIGIN ||
            "http://localhost:3000,http://localhost:3001"
          ).split(","),
          credentials: process.env.CORS_CREDENTIALS !== "false",
        },
        rateLimit: {
          enabled: process.env.RATE_LIMIT_ENABLED !== "false",
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"),
          max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
        },
      },
      external: {
        pinecone: {
          apiKey: process.env.PINECONE_API_KEY || "",
          environment: process.env.PINECONE_ENVIRONMENT || "",
          indexName: process.env.PINECONE_INDEX_NAME || "sitemind-agent-memory",
        },
      },
    };
  }

  public getConfig(): AgentConfig {
    return this.config;
  }

  public reload(): void {
    this.config = this.loadConfig();
  }

  // Convenience getters
  public get llm() {
    return this.config.llm;
  }

  public get server() {
    return this.config.server;
  }

  public get database() {
    return this.config.database;
  }

  public get features() {
    return this.config.features;
  }

  public get security() {
    return this.config.security;
  }

  public get external() {
    return this.config.external;
  }
}

export const config = AgentConfigManager.getInstance();
export default config;
