import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Funnel_Display, Funnel_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import HideOnAdmin from "@/components/hide-on-admin";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import { getSiteContent } from "@/lib/content";
import { SITE_URL, absoluteImageUrl } from "@/lib/site";

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
  const { about, site } = await getSiteContent();
  const title = site.seo.home.title;
  const description = site.seo.home.description;
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
  const { about, contact, site } = await getSiteContent();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.name,
    ...(about.credentials ? { honorificSuffix: about.credentials } : {}),
    jobTitle: about.title,
    description: site.seo.home.description,
    url: SITE_URL,
    email: `mailto:${contact.email}`,
    ...(about.photo ? { image: absoluteImageUrl(about.photo) } : {}),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <SiteHeader name={about.name} resumeUrl={about.resumeUrl} />
        {children}
        <HideOnAdmin>
          <SiteFooter />
        </HideOnAdmin>
        <MobileBottomNav resumeUrl={about.resumeUrl} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
