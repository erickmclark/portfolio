import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import { getSiteContent } from "@/lib/content";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Your Name — Software Engineer",
    template: "%s | Your Name",
  },
  description:
    "Software engineer specializing in TypeScript, React, and Node.js. Building fast, reliable web products.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    siteName: "Your Name",
    title: "Your Name — Software Engineer",
    description:
      "Software engineer specializing in TypeScript, React, and Node.js.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Name — Software Engineer",
    description:
      "Software engineer specializing in TypeScript, React, and Node.js.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { about } = getSiteContent();
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        <Nav name={about.name} />
        {children}
      </body>
    </html>
  );
}
