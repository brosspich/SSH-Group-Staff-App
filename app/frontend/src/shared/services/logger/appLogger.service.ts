import { ILoggerService } from './logger.interface';

export class AppLoggerService implements ILoggerService {
  info(message: string, context?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error || '', context || '');
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (__DEV__) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }
}

export const logger: ILoggerService = new AppLoggerService();
