import { config as loadEnv } from "dotenv";
import path from "path";
import { z } from "zod";

loadEnv({ path: path.resolve(process.cwd(), "../.env"), override: true });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_COOKIE_NAME: z.string().default("aura_token"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_CALLBACK_URL: z
    .string()
    .default("http://localhost:4000/api/auth/google/callback"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  BACKEND_URL: z.string().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  MARKET_DATA_PROVIDER: z
    .enum(["development", "external", "broker", "angelone"])
    .default("development"),
  MARKET_DATA_API_KEY: z.string().optional().default(""),
  MARKET_DATA_API_URL: z.string().optional().default(""),
  BROKER_PROVIDER: z.enum(["paper", "configured", "angelone"]).default("paper"),
  BROKER_API_KEY: z.string().optional().default(""),
  BROKER_API_SECRET: z.string().optional().default(""),
  BROKER_REDIRECT_URI: z.string().optional().default(""),
  ANGEL_ONE_CLIENT_CODE: z.string().optional().default(""),
  ANGEL_ONE_PASSWORD: z.string().optional().default(""),
  ANGEL_ONE_API_KEY: z.string().optional().default(""),
  ANGEL_ONE_TOTP_SECRET: z.string().optional().default(""),
  STATIC_BACKEND_IP: z.string().default("65.1.222.7"),
  WEBSOCKET_URL: z.string().default("http://localhost:4000"),
  ENABLE_TEST_AUTH: z
    .string()
    .optional()
    .transform((v) => v === "true")
    .default("false"),
  TEST_AUTH_SECRET: z.string().optional().default("dev-test-auth-secret"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true")
    .default("false"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten());
  if (process.env.NODE_ENV !== "test") {
    // Allow test bootstrap with defaults
  }
}

const fallback = {
  NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://sahilvvit_db_user:LfMhDxRHUNkMHxLZ@cluster0.p8ovrze.mongodb.net/aura_trading?retryWrites=true&w=majority",
  JWT_SECRET: process.env.JWT_SECRET || "dev-only-change-me-secret-is-non",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || "aura_token",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "37581356529-08v3ra4l6h0maoha4dne2bee5dho9ig4.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "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",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:4000/api/auth/google/callback",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:4000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  MARKET_DATA_PROVIDER: (process.env.MARKET_DATA_PROVIDER as "development" | "external" | "broker" | "angelone") || "development",
  MARKET_DATA_API_KEY: process.env.MARKET_DATA_API_KEY || "",
  MARKET_DATA_API_URL: process.env.MARKET_DATA_API_URL || "",
  BROKER_PROVIDER: (process.env.BROKER_PROVIDER as "paper" | "configured" | "angelone") || "paper",
  BROKER_API_KEY: process.env.BROKER_API_KEY || "",
  BROKER_API_SECRET: process.env.BROKER_API_SECRET || "",
  BROKER_REDIRECT_URI: process.env.BROKER_REDIRECT_URI || "",
  ANGEL_ONE_CLIENT_CODE: process.env.ANGEL_ONE_CLIENT_CODE || "M59370775",
  ANGEL_ONE_PASSWORD: process.env.ANGEL_ONE_PASSWORD || "7673",
  ANGEL_ONE_API_KEY: process.env.ANGEL_ONE_API_KEY || "JEhSAPpb",
  ANGEL_ONE_TOTP_SECRET: process.env.ANGEL_ONE_TOTP_SECRET || "WI2RYWLG4B3JD7SOD4NGSGYXXY",
  STATIC_BACKEND_IP: process.env.STATIC_BACKEND_IP || "65.1.222.7",
  WEBSOCKET_URL: process.env.WEBSOCKET_URL || "http://localhost:4000",
  ENABLE_TEST_AUTH: process.env.ENABLE_TEST_AUTH !== undefined ? process.env.ENABLE_TEST_AUTH === "true" : true,
  TEST_AUTH_SECRET: process.env.TEST_AUTH_SECRET || "dev-test-auth-secret",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none") || "lax",
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 900_000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 200),
};

export const env = parsed.success ? parsed.data : fallback;

export const isGoogleAuthConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
);

export const isLiveMarketDataConfigured = Boolean(
  (env.MARKET_DATA_PROVIDER === "angelone" && (env.ANGEL_ONE_API_KEY || env.BROKER_API_KEY)) ||
    (env.MARKET_DATA_PROVIDER !== "development" && env.MARKET_DATA_API_KEY && env.MARKET_DATA_API_URL)
);

export const isLiveBrokerConfigured = Boolean(
  (env.BROKER_PROVIDER === "angelone" && env.ANGEL_ONE_CLIENT_CODE && env.ANGEL_ONE_API_KEY) ||
    (env.BROKER_PROVIDER === "configured" && env.BROKER_API_KEY && env.BROKER_API_SECRET)
);

export const isAngelOneConfigured = Boolean(
  env.ANGEL_ONE_CLIENT_CODE &&
    env.ANGEL_ONE_PASSWORD &&
    env.ANGEL_ONE_API_KEY
);

