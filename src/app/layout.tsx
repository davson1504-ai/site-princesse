import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import "./globals.css";
import { SITE_NAME, site } from "@/data/site";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = { metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"), title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` }, description: "Coiffures personnalisées et produits capillaires sur demande.",openGraph:{title:SITE_NAME,description:"Coiffures personnalisées sur rendez-vous.",type:"website",locale:"fr_FR",url:"/"}, robots: { index: true, follow: true } };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Header/><main className="flex-1"><PageTransition>{children}</PageTransition></main><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness",name:SITE_NAME,email:site.email,telephone:site.phone,url:process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}).replaceAll("<","\\u003c")}}/></body>
    </html>
  );
}
