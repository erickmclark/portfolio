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

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getSiteContent();
  const title = `${about.name} — ${about.title}`;
  const description = about.heroTagline;
  return {
    title: {
      default: title,
      template: `%s | ${about.name}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: about.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { about } = await getSiteContent();
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        <Nav name={about.name} />
        {children}
      </body>
    </html>
  );
}
