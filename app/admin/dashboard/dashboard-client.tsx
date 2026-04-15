"use client";

import { useEffect, useState } from 'react';
import type { SiteContent } from '@/lib/types';
import AboutTab from './about-tab';
import ContactTab from './contact-tab';
import ProjectsTab from './projects-tab';

type Tab = 'projects' | 'about' | 'contact';

export default function DashboardClient() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [sha, setSha] = useState('');
  const [tab, setTab] = useState<Tab>('projects');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then(({ content, sha }: { content: SiteContent; sha: string }) => {
        setContent(content);
        setSha(sha);
      })
      .catch(() => setSaveError('Failed to load content.'));
  }, []);

  function update(updated: SiteContent) {
    setContent(updated);
    setDirty(true);
    setSaved(false);
    setSaveError('');
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sha }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { sha: newSha } = await res.json() as { sha: string };
      setSha(newSha);
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setSaveError(`Save failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {saveError ? (
          <p className="text-red-400">{saveError}</p>
        ) : (
          <p className="text-muted animate-pulse">Loading content…</p>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Sticky header */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-40">
        <div className="max-w-4xl mx-auto px-6 h-[60px] flex items-center gap-6">
          <span className="font-bold text-sm shrink-0">Admin</span>
          <div className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  tab === t.id ? 'bg-surface text-white' : 'text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <a href="/" className="ml-auto text-xs text-muted hover:text-white transition-colors">
            ← View site
          </a>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === 'projects' && (
          <ProjectsTab
            projects={content.projects}
            onChange={(projects) => update({ ...content, projects })}
          />
        )}
        {tab === 'about' && (
          <AboutTab
            about={content.about}
            onChange={(about) => update({ ...content, about })}
          />
        )}
        {tab === 'contact' && (
          <ContactTab
            contact={content.contact}
            onChange={(contact) => update({ ...content, contact })}
          />
        )}
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-md p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm">
            {saved && !dirty && <span className="text-green-400">✓ Saved — Netlify is rebuilding (~60s)</span>}
            {dirty && !saveError && <span className="text-muted">Unsaved changes</span>}
            {saveError && <span className="text-red-400 text-xs">{saveError}</span>}
          </div>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-lg transition-colors duration-200 text-sm"
          >
            {saving ? 'Saving…' : `Save & Deploy${dirty ? ' ●' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
