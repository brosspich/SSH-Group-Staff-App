export class Logger {
  static info(message: string, context?: unknown): void {
    console.log(`[${new Date().toISOString()}] [INFO]: ${message}`, context ?? '');
  }

  static warn(message: string, context?: unknown): void {
    console.warn(`[${new Date().toISOString()}] [WARN]: ${message}`, context ?? '');
  }

  static error(message: string, error?: unknown): void {
    console.error(`[${new Date().toISOString()}] [ERROR]: ${message}`, error ?? '');
  }
}
