import { Mail, GitBranch, Globe } from "lucide-react";

const EMAIL = "you@example.com";
const GITHUB_URL = "https://github.com/yourusername";
const LINKEDIN_URL = "https://linkedin.com/in/yourhandle";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Contact
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">
          Let&apos;s Work Together
        </h2>
        <p className="text-muted text-lg max-w-lg mb-12 leading-relaxed">
          Whether you have a project in mind, a role to fill, or just want to
          connect — my inbox is open.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-3 text-lg font-semibold hover:text-accent transition-colors duration-200"
          >
            <Mail size={20} className="text-accent" />
            {EMAIL}
          </a>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 text-muted hover:text-white transition-colors duration-200"
            >
              <GitBranch size={22} />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 text-muted hover:text-white transition-colors duration-200"
            >
              <Globe size={22} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
