import type { NextConfig } from "next";
import {withSentryConfig} from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV!=="production"?" 'unsafe-eval'":""} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://graph.facebook.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "X-Frame-Options", value: "DENY" },
    ];
    if (process.env.VERCEL_ENV === "production") headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" });
    return [
      { source: "/:path*", headers },
      { source: "/admin/:path*", headers: [{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"}] },
      { source: "/api/admin/:path*", headers: [{key:"Cache-Control",value:"no-store"},{key:"X-Robots-Tag",value:"noindex, nofollow"}] },
    ];
  },
};

export default withSentryConfig(nextConfig,{silent:true});
