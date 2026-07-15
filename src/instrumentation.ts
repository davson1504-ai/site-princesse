import { readServerEnv } from "@/lib/env";
import * as Sentry from "@sentry/nextjs";
import type {Instrumentation} from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") { readServerEnv(); await import("../sentry.server.config"); }
  if (process.env.NEXT_RUNTIME === "edge") await import("../sentry.edge.config");
}

export const onRequestError:Instrumentation.onRequestError=async(error,request,context)=>{
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : "unavailable";
  console.error("server.request.failed", { method: request.method, route: context.routePath, digest });
  if(process.env.SENTRY_DSN)await Sentry.captureRequestError(error,request,context);
};
