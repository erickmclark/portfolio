"use client";

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { SiteContent } from '@/lib/types';
import { validateSiteContent } from '@/lib/validate';
import AboutTab from './about-tab';
import ContactTab from './contact-tab';
import ProjectsTab from './projects-tab';
import { applyRouteImages } from './gallery-utils';
import { applyGitHubFill, applySlugImageMove, removeProject, type DeleteNotice } from './project-updates';
import ExperienceTab from './experience-tab';
import { Button, Eyebrow, SaveStatus, SectionChip, type BrandColor } from '../ui';
import { countBlockedSlugs, deriveSaveState, saveDisabled, saveSentence } from '../ui/save-state';

type Tab = 'home' | 'projects' | 'experience' | 'about' | 'contact' | 'site';

export default function DashboardClient() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>('projects')
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pending, setPending] = useState(0);
  const [deleteNotice, setDeleteNotice] = useState<DeleteNotice>(null);
  const pendingId = useId();

  useEffect(() => {
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then(({ content }: { content: SiteContent }) => {
        // Backfill stable ids for any legacy project saved before the id field
        // existed, and the experience list for data saved before it existed.
        setContent({
          ...content,
          projects: content.projects.map((p) =>
            p.id ? p : { ...p, id: crypto.randomUUID() }
          ),
          experience: content.experience ?? [],
        });
      })
      .catch(() => setLoadFailed(true));
  }, []);

  function update(updated: SiteContent) {
    setContent(updated);
    setDirty(true);
    setSaved(false);
    setSaveError('');
  }

  function updateFromLatest(fn: (latest: SiteContent) => SiteContent) {
    setContent((prev) => (prev ? fn(prev) : prev));
    setDirty(true);
    setSaved(false);
    setSaveError('');
  }

  function trackPending(delta: 1 | -1) {
    setPending((n) => Math.max(0, n + delta));
  }

  async function save() {
    if (!content || pending > 0 || countBlockedSlugs(content.projects) > 0) return;
    const check = validateSiteContent(content);
    if (!check.ok) {
      setSaveError(check.errors[0]);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(await res.text());
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setSaveError(`Save failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; color: BrandColor; count?: number }[] = [
    { id: 'home', label: 'Home page', color: 'navy' },
    { id: 'projects', label: 'Projects', color: 'blue', count: content?.projects.length },
    { id: 'experience', label: 'Experience', color: 'green', count: content?.experience.length },
    { id: 'about', label: 'About', color: 'pink' },
    { id: 'contact', label: 'Contact', color: 'sky' },
    { id: 'site', label: 'Site', color: 'cream' },
  ];

  const inputs = { saving, saveError, pending, dirty, saved, blockedSlugs: content ? countBlockedSlugs(content.projects) : 0 };
  const state = deriveSaveState(inputs);
  const sentence = saveSentence(state, inputs);
  const tone = state === 'failed' || state === 'blocked' ? 'error' : 'default';
  const disabled = !content || saveDisabled(inputs);
  const label = saving ? 'Saving…' : 'Save';

  return (
    <div className="public-shell min-h-screen pb-28 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-ink bg-paper">
        <div className="flex min-h-[72px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-10">
          <div className="shrink-0">
            <p className="font-display font-bold leading-tight">Erick Clark</p>
            <Eyebrow>Admin</Eyebrow>
          </div>
          <nav aria-label="Sections" className="order-last flex w-full gap-2 overflow-x-auto py-1 md:order-none md:w-auto md:flex-1 md:overflow-visible">
            {tabs.map((t) => (
              <SectionChip key={t.id} label={t.label} color={t.color} count={t.count} current={tab === t.id} onClick={() => setTab(t.id)} />
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <SaveStatus id={pendingId} sentence={sentence} tone={tone} />
              <Button onClick={save} disabled={disabled} aria-describedby={pendingId}>{label}</Button>
            </div>
            <Link href="/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
              View site<ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </div>
        </div>
      </header>

      {!content ? (
        <div className="px-4 py-16 md:px-10">
          <Eyebrow>Admin</Eyebrow>
          {loadFailed ? (
            <div role="alert" className="mt-4 max-w-[500px] border border-red-700 px-4 py-3">
              <p className="font-display text-xl font-semibold text-red-700">Failed to load content.</p>
              <p className="text-[15px]">Reload the page to try again. Nothing was changed.</p>
            </div>
          ) : (
            <p role="status" className="font-display mt-4 text-[40px] font-bold leading-tight tracking-tight">Loading content…</p>
          )}
        </div>
      ) : (
      <div className="px-4 py-8 md:px-10">
        {(tab === 'home' || tab === 'site') && (
          <section aria-labelledby="placeholder-title" className="border border-ink p-6">
            <h1 id="placeholder-title" className="font-display text-2xl font-bold">{tab === 'home' ? 'Home page' : 'Site'}</h1>
            <p className="mt-2 text-ink-muted">This editor arrives with T-6.</p>
          </section>
        )}
        {/* Legacy tabs are still styled for a dark surface until their own redesign tasks land. */}
        {tab !== 'home' && tab !== 'site' && (
          <div className="rounded-2xl bg-background p-4 text-foreground md:p-6">
            {tab === 'projects' && (
              <ProjectsTab
                projects={content.projects}
                onChange={(projects) => update({ ...content, projects })}
                onRouteImages={(id, images) => updateFromLatest((latest) => applyRouteImages(latest, id, images))}
                onDeleteProject={(id) => updateFromLatest((latest) => removeProject(latest, id))}
                onSlugImageMoved={(id, from, imagePath) =>
                  updateFromLatest((latest) => applySlugImageMove(latest, id, from, imagePath))
                }
                onGitHubFill={(id, fill) => updateFromLatest((latest) => applyGitHubFill(latest, id, fill))}
                onPendingChange={trackPending}
                notice={deleteNotice}
                setNotice={setDeleteNotice}
              />
            )}
            {tab === 'experience' && (
              <ExperienceTab
                experience={content.experience}
                onChange={(experience) => update({ ...content, experience })}
              />
            )}
            {tab === 'about' && (
              <AboutTab
                about={content.about}
                onChange={(about) => update({ ...content, about })}
                onAssetUploaded={(about) => updateFromLatest((latest) => ({ ...latest, about: { ...latest.about, photo: about.photo, resumeUrl: about.resumeUrl } }))}
                onPendingChange={trackPending}
              />
            )}
            {tab === 'contact' && (
              <ContactTab contact={content.contact} onChange={(contact) => update({ ...content, contact })} />
            )}
          </div>
        )}
      </div>
      )}

      {/* Mobile save bar: fixed ink pill inset 12px. */}
      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 md:hidden">
        <SaveStatus id={`${pendingId}-m`} sentence={sentence} tone={tone} onDark />
        <button
          onClick={save}
          disabled={disabled}
          aria-describedby={`${pendingId}-m`}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-paper px-6 text-[15px] font-semibold text-ink focus-visible:!outline-brand-sky disabled:cursor-not-allowed disabled:opacity-50"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
