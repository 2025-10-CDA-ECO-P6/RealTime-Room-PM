type LogLevel = "debug" | "info" | "warn" | "error";

const isDevelopment = () => import.meta.env.MODE === "development";

const getTimestamp = (): string => {
  return new Date().toISOString();
};

const formatMessage = (level: LogLevel, context: string, message: string): string => {
  return `[${getTimestamp()}] [${level.toUpperCase()}] [${context}] ${message}`;
};

export const loggerService = {
  debug: (context: string, message: string, data?: unknown): void => {
    if (isDevelopment()) {
      console.log(formatMessage("debug", context, message), data);
    }
  },

  info: (context: string, message: string, data?: unknown): void => {
    console.log(formatMessage("info", context, message), data);
  },

  warn: (context: string, message: string, data?: unknown): void => {
    console.warn(formatMessage("warn", context, message), data);
  },

  error: (context: string, message: string, error?: unknown): void => {
    console.error(formatMessage("error", context, message), error);
  },
};
