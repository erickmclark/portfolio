"use client";

import { useMemo, useState } from 'react';
import type { SeoCopy, SiteContent, SiteCopy } from '@/lib/types';
import { validateSiteContent } from '@/lib/validate';
import { Button, Eyebrow, GroupHead } from '../ui';
import { ErrorSummary, ItemControls, ListTextField, TextField, useItemKeys } from '../ui/edit';
import { errorFor, errorsUnder, moveItem, nextSectionId, parseParagraphs, readable, removeAt, replaceAt } from './content-edit';

type SectionId = 'footer' | 'privacy' | 'seo' | 'notfound';

const SECTIONS: { id: SectionId; label: string; path: string }[] = [
  { id: 'footer', label: 'Footer', path: 'site.footer' },
  { id: 'privacy', label: 'Privacy policy', path: 'site.privacy' },
  { id: 'seo', label: 'Search and sharing', path: 'site.seo' },
  { id: 'notfound', label: 'Not found page', path: 'site.notFound' },
];

function Footer({ site, errors, setSite }: { site: SiteCopy; errors: string[]; setSite: (s: SiteCopy) => void }) {
  const f = site.footer;
  const field = (key: keyof SiteCopy['footer'], label: string, multiline = false) => (
    <TextField label={label} multiline={multiline} rows={2} value={f[key]} onChange={(v) => setSite({ ...site, footer: { ...f, [key]: v } })} error={errorFor(errors, `site.footer.${key}`)} />
  );
  return (
    <div className="space-y-4">
      <GroupHead title="Footer" />
      <div className="grid gap-4 md:grid-cols-2">
        {field('name', 'Name')}
        {field('descriptor', 'Descriptor')}
      </div>
      {field('line', 'Line', true)}
      <div className="grid gap-4 md:grid-cols-2">
        {field('location', 'Location')}
        {field('availability', 'Availability')}
      </div>
      {field('copyright', 'Copyright')}
    </div>
  );
}

function Privacy({ site, errors, setSite }: { site: SiteCopy; errors: string[]; setSite: (s: SiteCopy) => void }) {
  const p = site.privacy;
  const keys = useItemKeys(p.sections.length);
  const setP = (next: Partial<SiteCopy['privacy']>) => setSite({ ...site, privacy: { ...p, ...next } });
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <GroupHead title="Privacy policy" />
        <TextField label="Eyebrow" value={p.eyebrow} onChange={(v) => setP({ eyebrow: v })} error={errorFor(errors, 'site.privacy.eyebrow')} />
        <TextField label="Title" value={p.title} onChange={(v) => setP({ title: v })} error={errorFor(errors, 'site.privacy.title')} />
        <TextField label="Intro" multiline value={p.intro} onChange={(v) => setP({ intro: v })} error={errorFor(errors, 'site.privacy.intro')} />
      </div>
      <GroupHead title="Sections" note={`${p.sections.length}`} />
      <p className="text-sm text-ink-muted">
        Write <code className="font-mono">{'{email}'}</code> in a paragraph to show it as the contact email link. Separate paragraphs with a blank line.
      </p>
      <ErrorSummary messages={errors.filter((m) => m.startsWith('site.privacy.sections ')).map(readable)} />
      <ol className="space-y-4">
        {p.sections.map((s, i) => (
          <li key={keys.keyAt(i)} className="space-y-3 border border-ink p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Section {i + 1}</span>
              <ItemControls
                name={s.title || `section ${i + 1}`}
                index={i}
                count={p.sections.length}
                onMove={(d) => { keys.move(i, d); setP({ sections: moveItem(p.sections, i, d) }); }}
                onRemove={() => { keys.remove(i); setP({ sections: removeAt(p.sections, i) }); }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label={`Section ${i + 1} title`} value={s.title} onChange={(v) => setP({ sections: replaceAt(p.sections, i, { ...s, title: v }) })} error={errorFor(errors, `site.privacy.sections[${i}].title`)} />
              <TextField label={`Section ${i + 1} id`} mono value={s.id} onChange={(v) => setP({ sections: replaceAt(p.sections, i, { ...s, id: v }) })} error={errorFor(errors, `site.privacy.sections[${i}].id`)} hint="Lowercase letters, numbers and hyphens. Used in the page anchor." />
            </div>
            <ListTextField
              label={`Section ${i + 1} paragraphs`}
              items={s.paragraphs}
              join={'\n\n'}
              parse={parseParagraphs}
              rows={6}
              error={errorsUnder(errors, `site.privacy.sections[${i}].paragraphs`).map(readable)[0]}
              onChange={(paragraphs) => setP({ sections: replaceAt(p.sections, i, { ...s, paragraphs }) })}
            />
          </li>
        ))}
      </ol>
      <Button type="button" variant="ghost" onClick={() => { keys.add(); setP({ sections: [...p.sections, { id: nextSectionId(p.sections.map((s) => s.id)), title: '', paragraphs: [] }] }); }}>Add section</Button>
    </div>
  );
}

function Seo({ site, errors, setSite }: { site: SiteCopy; errors: string[]; setSite: (s: SiteCopy) => void }) {
  const pages: { key: keyof SiteCopy['seo']; label: string }[] = [
    { key: 'home', label: 'Home page' },
    { key: 'contact', label: 'Contact page' },
    { key: 'privacy', label: 'Privacy page' },
  ];
  return (
    <div className="space-y-8">
      {pages.map(({ key, label }) => {
        const e: SeoCopy = site.seo[key];
        const set = (next: Partial<SeoCopy>) => setSite({ ...site, seo: { ...site.seo, [key]: { ...e, ...next } } });
        return (
          <div key={key} className="space-y-4">
            <GroupHead title={label} />
            <TextField label={`${label} title`} value={e.title} onChange={(v) => set({ title: v })} error={errorFor(errors, `site.seo.${key}.title`)} />
            <TextField label={`${label} description`} multiline value={e.description} onChange={(v) => set({ description: v })} error={errorFor(errors, `site.seo.${key}.description`)} hint="Shown in search results and link previews." />
          </div>
        );
      })}
    </div>
  );
}

function NotFound({ site, errors, setSite }: { site: SiteCopy; errors: string[]; setSite: (s: SiteCopy) => void }) {
  const n = site.notFound;
  const field = (key: keyof SiteCopy['notFound'], label: string, multiline = false) => (
    <TextField label={label} multiline={multiline} value={n[key]} onChange={(v) => setSite({ ...site, notFound: { ...n, [key]: v } })} error={errorFor(errors, `site.notFound.${key}`)} />
  );
  return (
    <div className="space-y-4">
      <GroupHead title="Not found page" />
      {field('eyebrow', 'Eyebrow')}
      {field('heading', 'Heading')}
      {field('body', 'Body', true)}
      {field('cta', 'Button label')}
    </div>
  );
}

export default function SiteTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const [section, setSection] = useState<SectionId>('footer');
  const site = content.site;
  const errors = useMemo(() => {
    const r = validateSiteContent(content);
    return r.ok ? [] : r.errors.filter((m) => m.startsWith('site'));
  }, [content]);
  if (!site) {
    return <div role="alert" className="border border-error px-4 py-3">The site content did not load. Reload the page; nothing was changed.</div>;
  }
  const setSite = (s: SiteCopy) => onChange({ ...content, site: s });
  const props = { site, errors, setSite };
  return (
    <div className="md:grid md:grid-cols-[400px_minmax(0,1fr)] md:items-start md:gap-10">
      <nav aria-label="On this page" className="md:sticky md:top-[88px]">
        <Eyebrow>Site · on this page</Eyebrow>
        <h2 className="font-display mt-1 text-[40px] font-bold leading-tight tracking-tight">Site</h2>
        <p className="mb-4 mt-2 text-sm text-ink-muted">Footer, privacy policy, search and sharing, and the not-found page.</p>
        <ul className="mt-4 border-t border-ink">
          {SECTIONS.map((s, i) => {
            const current = s.id === section;
            const bad = errorsUnder(errors, s.path).length > 0;
            return (
              <li key={s.id} className={`border-b border-ink border-l-4 ${current ? 'border-l-ink bg-white' : 'border-l-transparent'}`}>
                <button type="button" aria-current={current ? 'true' : undefined} onClick={() => setSection(s.id)} className="flex min-h-[56px] w-full items-center gap-3 px-3 text-left">
                  <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 font-display font-semibold">{s.label}</span>
                  {bad && <span className="border border-ink px-1.5 py-0.5 font-mono text-[11px] uppercase leading-none tracking-wider">Fix</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-8 min-w-0 border border-ink bg-white p-4 pb-10 md:mt-0 md:p-8">
        {section === 'footer' && <Footer {...props} />}
        {section === 'privacy' && <Privacy {...props} />}
        {section === 'seo' && <Seo {...props} />}
        {section === 'notfound' && <NotFound {...props} />}
      </div>
    </div>
  );
}
