import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://playerpulse-nu.vercel.app/"),
  title: "PlayerPulse – Player of the Week",
  description:
    "Vote for the Premier League Player of the Week with a gamified, animated leaderboard experience.",
  applicationName: "PlayerPulse",
  keywords: [
    "PlayerPulse",
    "Premier League",
    "Player of the Week",
    "football",
    "soccer",
    "leaderboard",
    "fan voting",
  ],
  authors: [{ name: "PlayerPulse" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    title: "PlayerPulse – Player of the Week",
    description:
      "Vote for the Premier League Player of the Week with a gamified, animated leaderboard experience.",
    siteName: "PlayerPulse",
    images: [
      {
        url: "/playerpulselogo.png",
        width: 1200,
        height: 630,
        alt: "PlayerPulse logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayerPulse – Player of the Week",
    description:
      "Vote for the Premier League Player of the Week with a gamified, animated leaderboard experience.",
    images: ["/playerpulselogo.png"],
  },
  icons: {
    icon: "/playerpulselogo.png",
    shortcut: "/playerpulselogo.png",
    apple: "/playerpulselogo.png",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-slate-950 text-slate-50"
      >
        {children}
      </body>
    </html>
  );
}
