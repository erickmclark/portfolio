import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { getSiteContent } from "@/lib/content";

export default async function NotFound() {
  // Render per request so admin edits to the copy appear without a redeploy.
  await connection();
  const { site } = await getSiteContent();
  const nf = site.notFound;
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-site mx-auto text-center">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          {nf.eyebrow}
        </p>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-4">
          {nf.heading}
        </h1>
        <p className="text-muted text-lg mb-10 max-w-md mx-auto leading-relaxed">
          {nf.body}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={18} />
          {nf.cta}
        </Link>
      </div>
    </main>
  );
}
