import type { Metadata, Viewport } from "next";
import {
  Inter,
  Instrument_Serif,
  JetBrains_Mono,
  Heebo,
  Frank_Ruhl_Libre,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AbortErrorSilencer } from "@/components/providers/abort-error-silencer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Hebrew UI font. Heebo is the Hebrew sibling of Inter — same proportions
 * and feel, so mixed Hebrew/Latin text reads cleanly. Loaded with the hebrew
 * subset only; the browser falls through to Heebo for chars not in Inter via
 * the font stack + Google's unicode-range metadata.
 */
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/**
 * Hebrew display serif. Frank Ruhl Libre is the modern revival of the
 * classic Hebrew newspaper face — pairs naturally with Instrument Serif.
 */
const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl-libre",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diet",
  description: "A quiet calorie & weight journal.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Diet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1a1a1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${heebo.variable} ${frankRuhl.variable} h-full antialiased`}
    >
      <head>
        <AbortErrorSilencer />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
