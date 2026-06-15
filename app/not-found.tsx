import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-site mx-auto text-center">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          404
        </p>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter mb-4">
          Page not found
        </h1>
        <p className="text-muted text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={18} />
          Back home
        </Link>
      </div>
    </main>
  );
}
