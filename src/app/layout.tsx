import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import "./globals.css";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = { metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"), title: { default: "Princesse Coiffure", template: "%s | Princesse Coiffure" }, description: "Coiffure élégante, soins personnalisés et réservation en ligne.", openGraph:{title:"Princesse Coiffure",description:"Votre coiffure, votre couronne.",type:"website",locale:"fr_FR"}, robots: { index: true, follow: true } };

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
      <body className="min-h-full flex flex-col"><Header/><main className="flex-1"><PageTransition>{children}</PageTransition></main><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"HairSalon",name:"Princesse Coiffure",email:process.env.PRINCESSE_EMAIL,address:process.env.PRINCESSE_ADDRESS,url:process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}).replaceAll("<","\\u003c")}}/></body>
    </html>
  );
}
