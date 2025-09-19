import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SoundPreloader } from "@/components/quiz/SoundPreloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minicat 30",
  description: "Course d'orientation",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "192x192", type: "image/svg+xml" }
    ],
    apple: { url: "/icon.svg", sizes: "180x180" }
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quiz Orientation"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 min-h-screen relative`}
      >
        {/* Grille futuriste en arrière-plan - toujours présente */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:60px_60px] opacity-80 pointer-events-none z-0"></div>
        
        {/* Préchargement des sons */}
        <SoundPreloader />
        
        {/* Contenu de l'application */}
        <div className="relative z-10">
          {children}
        </div>
        
        <Toaster />
      </body>
    </html>
  );
}
