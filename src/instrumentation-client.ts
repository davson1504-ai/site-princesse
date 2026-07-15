import * as Sentry from "@sentry/nextjs";
if(process.env.NEXT_PUBLIC_SENTRY_DSN)Sentry.init({dsn:process.env.NEXT_PUBLIC_SENTRY_DSN,sendDefaultPii:false,tracesSampleRate:0.05,enabled:process.env.NODE_ENV==="production"});
export const onRouterTransitionStart=Sentry.captureRouterTransitionStart;
