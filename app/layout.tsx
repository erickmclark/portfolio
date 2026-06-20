import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { getSiteContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

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
    metadataBase: new URL(SITE_URL),
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
  const { about, contact } = await getSiteContent();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.name,
    jobTitle: about.title,
    description: about.heroTagline,
    url: SITE_URL,
    sameAs: [contact.githubUrl, contact.linkedinUrl].filter(Boolean),
  };

  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Nav name={about.name} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
