/**
 * Logger utility for Agent Service
 */

import { getConfig } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = 'info';
    try {
      const config = getConfig();
      this.minLevel = config.logLevel;
    } catch (e) {
      // Config not loaded yet, use default
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelColor =
      level === 'error'
        ? COLORS.red
        : level === 'warn'
        ? COLORS.yellow
        : level === 'info'
        ? COLORS.green
        : COLORS.gray;

    let output = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${levelColor}[${level.toUpperCase()}]${COLORS.reset} ${message}`;

    if (data !== undefined) {
      output += `\n${COLORS.cyan}${JSON.stringify(data, null, 2)}${COLORS.reset}`;
    }

    return output;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
      console.error(this.formatMessage('error', message, errorData));
    }
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// Export singleton instance
export const logger = new Logger();
