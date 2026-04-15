"use client";

import type { ContactContent } from '@/lib/types';

export default function ContactTab({
  contact,
  onChange,
}: {
  contact: ContactContent;
  onChange: (contact: ContactContent) => void;
}) {
  function update<K extends keyof ContactContent>(key: K, value: string) {
    onChange({ ...contact, [key]: value });
  }

  const fields: { key: keyof ContactContent; label: string; placeholder: string; type: string }[] = [
    { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' },
    { key: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/yourusername', type: 'url' },
    { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourhandle', type: 'url' },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-bold">Contact</h2>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-muted uppercase tracking-widest mb-1 block">{f.label}</label>
          <input
            type={f.type}
            value={contact[f.key]}
            onChange={(e) => update(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      ))}
    </div>
  );
}
