import { Mail, GitBranch, Globe } from 'lucide-react';
import { getSiteContent } from '@/lib/content';

export default function Contact() {
  const { contact } = getSiteContent();

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-site mx-auto">
        <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
          Contact
        </p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">
          Let&apos;s Work Together
        </h2>
        <p className="text-muted text-lg max-w-lg mb-12 leading-relaxed">
          Whether you have a project in mind, a role to fill, or just want to
          connect — my inbox is open.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={`mailto:${contact.email}`}
            className="group inline-flex items-center gap-3 px-6 py-4 bg-surface border border-border hover:border-accent/60 hover:bg-accent/5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-200">
              <Mail size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Email me at</p>
              <p className="text-sm font-semibold text-foreground">{contact.email}</p>
            </div>
          </a>

          <a
            href={contact.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-4 bg-surface border border-border hover:border-accent/60 hover:bg-accent/5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-200">
              <GitBranch size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Find me on</p>
              <p className="text-sm font-semibold text-foreground">GitHub</p>
            </div>
          </a>

          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-4 bg-surface border border-border hover:border-accent/60 hover:bg-accent/5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors duration-200">
              <Globe size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Connect on</p>
              <p className="text-sm font-semibold text-foreground">LinkedIn</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
