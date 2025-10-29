import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuthProvider } from "@/providers/auth-provider";
import { DemoDataProvider } from "@/providers/demo-data-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "DiveLog Studio",
  description:
    "Demo einer modernen Dive-Log-Plattform mit Dashboard, Community und Medienverwaltung.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.className}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <DemoDataProvider>
                <div className="flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
              </DemoDataProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
