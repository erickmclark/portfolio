import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Funnel_Display, Funnel_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import { HOME_SEO } from "@/lib/home-copy";
import { getSiteContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  viewportFit: "cover",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel-display",
  weight: ["700"],
  display: "swap",
});

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-funnel-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getSiteContent();
  const title = HOME_SEO.title;
  const description = HOME_SEO.description;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${about.name}`,
    },
    description,
    alternates: {
      canonical: "/",
    },
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
  const { about, contact } = await getSiteContent();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.name,
    jobTitle: about.title,
    description: HOME_SEO.description,
    url: SITE_URL,
    email: `mailto:${contact.email}`,
    ...(about.photo ? { image: `${SITE_URL}${about.photo}` } : {}),
    sameAs: [contact.githubUrl, contact.linkedinUrl].filter(Boolean),
  };

  return (
    <html lang="en" className={`${geist.variable} ${funnelDisplay.variable} ${funnelSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body className="bg-background text-foreground antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <SiteHeader name={about.name} resumeUrl={about.resumeUrl} />
        {children}
        <SiteFooter />
        <MobileBottomNav resumeUrl={about.resumeUrl} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
