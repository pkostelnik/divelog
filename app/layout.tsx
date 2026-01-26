import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/providers/auth-provider";
import { DemoDataProvider } from "@/providers/demo-data-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { TeamsProvider } from "@/providers/teams-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://divelog-studio.example.com";
const siteName = "DiveLog Studio";
const siteDescription = "Moderne Dive-Log-Plattform mit Dashboard, Community und Medienverwaltung. Verwalten Sie Ihre Tauchgänge, Ausrüstung, Tauchplätze und teilen Sie Ihre Erlebnisse mit der Community.";
const siteKeywords = "Tauchen, Dive Log, Tauchlogbuch, Tauchplätze, Tauchausrüstung, Tauch-Community, Tauchgang verwalten, Dive Sites, Scuba Diving";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: "DiveLog Studio Team" }],
  creator: "DiveLog Studio",
  publisher: "DiveLog Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  manifest: '/manifest.json',
  
  // Open Graph Metadaten für Social Media (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["en_US"],
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    siteName: siteName,
    images: [
      {
        url: `${siteUrl}/assets/DiveLogStudio.png`,
        width: 1200,
        height: 630,
        alt: "DiveLog Studio - Moderne Dive-Log-Plattform",
      },
    ],
  },
  
  // Twitter Card Metadaten
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/assets/DiveLogStudio.png`],
    creator: "@divelogstudio",
  },
  
  // Robots & Indexierung
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification Tags (falls benötigt)
  verification: {
    // google: 'your-google-site-verification',
    // yandex: 'your-yandex-verification',
    // bing: 'your-bing-verification',
  },
  
  // Alternative Languages
  alternates: {
    canonical: siteUrl,
    languages: {
      'de-DE': `${siteUrl}/de`,
      'en-US': `${siteUrl}/en`,
    },
  },
  
  // App Links (für Mobile Apps)
  appLinks: {
    web: {
      url: siteUrl,
      should_fallback: true,
    },
  },
  
  // Kategorie
  category: "Sports & Recreation",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.className}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-ocean-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-ocean-400"
        >
          Skip to main content
        </a>
        <TeamsProvider>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <DemoDataProvider>
                  <div className="flex min-h-screen flex-col">
                    <SiteHeader />
                    <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
                    <SiteFooter />
                  </div>
                </DemoDataProvider>
              </AuthProvider>
            </ThemeProvider>
          </I18nProvider>
        </TeamsProvider>
      </body>
    </html>
  );
}
