import { z } from "zod";

const optionalSecret = z.string().trim().min(1).optional().transform((value) => value?.startsWith("[") ? undefined : value);
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().trim().min(1).default("Beauty Haïr by Nao"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  PRINCESSE_NAME: optionalSecret,
  PRINCESSE_EMAIL: z.email().optional(),
  PRINCESSE_PHONE: optionalSecret,
  PRINCESSE_WHATSAPP: optionalSecret,
  PRINCESSE_ADDRESS: optionalSecret,
  PRINCESSE_TIMEZONE: z.string().default("Europe/Paris"),
  DATABASE_URL: optionalSecret,
  DIRECT_URL: optionalSecret,
  AUTH_SECRET: optionalSecret,
  ADMIN_PASSWORD_HASH: optionalSecret,
  RESEND_API_KEY: optionalSecret,
  EMAIL_FROM: optionalSecret,
  EMAIL_REPLY_TO: z.email().optional(),
  WHATSAPP_PHONE_NUMBER_ID: optionalSecret,
  WHATSAPP_ACCESS_TOKEN: optionalSecret,
  WHATSAPP_BUSINESS_ACCOUNT_ID: optionalSecret,
  WHATSAPP_TEMPLATE_NAME: optionalSecret,
  TURNSTILE_SECRET_KEY: optionalSecret,
  SENTRY_DSN: optionalSecret,
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function readServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const result = serverSchema.safeParse(source);
  if (!result.success) throw new Error(`Configuration serveur invalide (${result.error.issues.map((issue) => issue.path.join(".")).join(", ")})`);
  const env = result.data;
  const production = env.VERCEL_ENV === "production" || (env.NODE_ENV === "production" && source.NEXT_PHASE !== "phase-production-build");
  if (production) {
    const missing = (["DATABASE_URL", "AUTH_SECRET", "ADMIN_PASSWORD_HASH"] as const).filter((key) => !env[key]);
    if (missing.length) throw new Error(`Configuration de production incomplète (${missing.join(", ")})`);
  }
  return env;
}

export const publicEnv = z.object({
  NEXT_PUBLIC_SITE_NAME: z.string().default("Beauty Haïr by Nao"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_PRINCESSE_WHATSAPP: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
}).parse({
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PRINCESSE_WHATSAPP: process.env.NEXT_PUBLIC_PRINCESSE_WHATSAPP,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
