import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction ? undefined : {
    target: "pino/file",
    options: { destination: 1 },
  },
  formatters: {
    level(label) { return { level: label }; },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "secret"],
    censor: "[REDACTED]",
  },
});

export function createAuditLog(action: string, details: Record<string, unknown>) {
  logger.info({ audit: true, action, ...details }, "AUDIT");
}
