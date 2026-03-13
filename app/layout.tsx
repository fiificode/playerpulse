import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayerPulse – Player of the Week",
  description:
    "Vote for the Premier League Player of the Week with a gamified, animated leaderboard experience.",
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
