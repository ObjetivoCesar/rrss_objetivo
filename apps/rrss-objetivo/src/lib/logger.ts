type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data }),
    };
  }

  info(message: string, data?: any) {
    console.log(JSON.stringify(this.formatMessage('info', message, data)));
  }

  warn(message: string, data?: any) {
    console.warn(JSON.stringify(this.formatMessage('warn', message, data)));
  }

  error(message: string, error?: any) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(JSON.stringify(this.formatMessage('error', message, errorData)));
  }
}

export const logger = new Logger();
