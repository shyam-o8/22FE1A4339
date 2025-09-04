import { store } from '../store/store';
import { addLog } from '../store/slices/logsSlice';

class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, data?: any) {
    store.dispatch(addLog({
      level: 'info',
      message,
      data,
    }));
  }

  success(message: string, data?: any) {
    store.dispatch(addLog({
      level: 'success',
      message,
      data,
    }));
  }

  warning(message: string, data?: any) {
    store.dispatch(addLog({
      level: 'warning',
      message,
      data,
    }));
  }

  error(message: string, data?: any) {
    store.dispatch(addLog({
      level: 'error',
      message,
      data,
    }));
  }
}

export const logger = Logger.getInstance();