import Link from 'next/link';
import { GitBranch, Globe, Mail } from 'lucide-react';
import { getSiteContent } from '@/lib/content';

export default async function Footer() {
  const { about, contact } = await getSiteContent();
  const year = new Date().getFullYear();

  const socials = [
    { href: `mailto:${contact.email}`, label: 'Email', Icon: Mail, external: false },
    { href: contact.githubUrl, label: 'GitHub', Icon: GitBranch, external: true },
    { href: contact.linkedinUrl, label: 'LinkedIn', Icon: Globe, external: true },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-site mx-auto px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/#hero" className="text-lg font-black tracking-tighter">
              {about.name}.
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {about.title}
              {about.availableForWork ? ' · Available for work' : ''}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/#projects" className="transition-colors hover:text-foreground">Work</Link>
            <Link href="/#about" className="transition-colors hover:text-foreground">About</Link>
            <Link href="/#contact" className="transition-colors hover:text-foreground">Contact</Link>
          </nav>

          <div className="flex items-center gap-2">
            {socials.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent/60 hover:text-accent"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {about.name}. All rights reserved.</p>
          <p>Built with Next.js &amp; Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
