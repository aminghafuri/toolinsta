import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import { InstallPrompt } from "@/components/InstallPrompt";
import { CacheBuster } from "@/components/CacheBuster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "ToolInsta - Instagram Data Analyzer",
  description: "Analyze your Instagram data export with privacy-focused tools",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/icons/icon-192x192.png?v=2",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/icons/icon-192x192.png?v=2",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ToolInsta",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CacheBuster />
          <InstallPrompt />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
