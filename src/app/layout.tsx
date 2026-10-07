import type { Metadata, Viewport } from "next";
import { Google_Sans, Abel, Fragment_Mono } from "next/font/google";
import "./globals.css";
import { BRAND, SITE_URL } from "@/lib/brand";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Toast } from "@/components/ui/Copy";
import { Providers } from "@/components/Providers";

const googleSans = Google_Sans({ variable: "--font-google-sans", subsets: ["latin"], weight: "variable" });
const abel = Abel({ variable: "--font-abel", subsets: ["latin"], weight: "400" });
const fragmentMono = Fragment_Mono({ variable: "--font-fragment-mono", subsets: ["latin"], weight: "400" });

const description = `Tell Claude or ChatGPT the coin you want, approve it, and it's live on Robinhood Chain. Add your wallet to get 50% of the creator fees, or 75% if you hold $${BRAND.ticker}.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND.name} · Robinhood Chain, plugged into your AI`, template: `%s · ${BRAND.name}` },
  description,
  openGraph: { type: "website", siteName: BRAND.name, title: `${BRAND.name} · Robinhood Chain, plugged into your AI`, description },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${googleSans.variable} ${abel.variable} ${fragmentMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
        <Nav />
        <main id="main" className="relative flex-1">{children}</main>
        <Footer />
        <Toast />
        </Providers>
      </body>
    </html>
  );
}
