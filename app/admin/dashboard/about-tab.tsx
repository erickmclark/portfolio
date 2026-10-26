"use client";

import { useRef, useState } from 'react';
import { credentialsError } from '@/lib/credentials';
import type { AboutContent } from '@/lib/types';
import { Button, buttonClass, GroupHead, Stamp } from '../ui';
import { Checkbox, ItemControls, LedgerLayout, SheetHead, TextField, type LedgerRow } from '../ui/edit';
import { moveItem, removeAt, replaceAt } from './content-edit';

// Matches MAX_IMAGE_BYTES and MAX_RESUME_BYTES in lib/project-images.ts (server-only module).
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

type BlockId = 'identity' | 'photo' | 'resume' | 'text' | 'hidden';

const BLOCKS: { id: BlockId; title: string; note: string }[] = [
  { id: 'identity', title: 'Identity', note: 'Name and professional title' },
  { id: 'photo', title: 'Photo and quote', note: 'Profile photo and the quote under it' },
  { id: 'resume', title: 'Résumé file', note: 'PDF for the Resume button' },
  { id: 'text', title: 'About text', note: 'The bio paragraphs' },
  { id: 'hidden', title: 'Not shown on the site', note: 'Stored, but not displayed' },
];

function fileName(url: string) {
  const last = url.split('/').pop() || 'resume.pdf';
  try { return decodeURIComponent(last); } catch { return last; }
}

const firstLine = (s: string) => s.split('\n').find((l) => l.trim())?.trim() || 'Empty paragraph';

type Upload = { busy: boolean; message: string; failed: boolean };
const idle: Upload = { busy: false, message: '', failed: false };

export default function AboutTab({
  about,
  onChange,
  onAssetUploaded,
  onPendingChange,
}: {
  about: AboutContent;
  onChange: (about: AboutContent) => void;
  onAssetUploaded?: (about: AboutContent) => void;
  onPendingChange?: (delta: 1 | -1) => void;
}) {
  const [selected, setSelected] = useState<BlockId>('identity');
  const [photo, setPhoto] = useState<Upload>(idle);
  const [resume, setResume] = useState<Upload>(idle);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);
  const [openPara, setOpenPara] = useState<number | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    onChange({ ...about, [key]: value });
  }

  async function uploadAsset(kind: 'photo' | 'resume', file: File) {
    const state = kind === 'photo' ? photo : resume;
    const set = kind === 'photo' ? setPhoto : setResume;
    if (state.busy) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      set({ busy: false, failed: true, message: `${kind === 'photo' ? 'Photo' : 'PDF'} is too large (4 MB maximum). Choose a smaller file.` });
      return;
    }
    let preview: string | null = null;
    if (kind === 'photo') {
      preview = URL.createObjectURL(file);
      setLocalPhotoPreview(preview);
    }
    set({ busy: true, failed: false, message: 'Uploading…' });
    onPendingChange?.(1);
    try {
      const form = new FormData();
      form.append('kind', kind);
      form.append('file', file);
      const res = await fetch('/api/admin/about/assets', { method: 'POST', body: form });
      const data = (await res.json().catch(() => ({}))) as { about?: AboutContent; error?: string };
      if (!res.ok || !data.about) {
        set({ busy: false, failed: true, message: data.error || 'Upload failed.' });
        return;
      }
      onAssetUploaded?.(data.about);
      set({ busy: false, failed: false, message: 'Uploaded' });
    } catch {
      set({ busy: false, failed: true, message: 'Upload failed. Check your connection and try again.' });
    } finally {
      if (preview) {
        URL.revokeObjectURL(preview);
        setLocalPhotoPreview(null);
      }
      onPendingChange?.(-1);
    }
  }

  const photoSrc = localPhotoPreview ?? (about.photo || null);
  const rows: LedgerRow[] = BLOCKS.map((b) => ({ id: b.id, title: b.title, note: b.note }));
  const block = BLOCKS.find((b) => b.id === selected) ?? BLOCKS[0];
  const position = BLOCKS.indexOf(block) + 1;

  const uploadStatus = (u: Upload) => (
    <p role="status" aria-live="polite" className={`mt-2 text-sm ${u.failed ? 'text-error' : 'text-ink-muted'} empty:hidden`}>{u.message}</p>
  );

  return (
    <LedgerLayout
      eyebrow={`About · ${BLOCKS.length} groups`}
      title="About"
      intro="Who you are on the About section, plus your photo and résumé file."
      listLabel="About groups"
      rows={rows}
      selectedId={block.id}
      onSelect={(id) => setSelected(id as BlockId)}
      sheet={({ headingRef, onBack }) => (
        <div className="border border-ink bg-white p-4 pb-10 md:p-8">
          <SheetHead eyebrow={`Group ${position} of ${BLOCKS.length}`} title={block.title} headingRef={headingRef} onBack={onBack} backLabel="All groups" />
          <div className="mt-8 space-y-4">
            {block.id === 'identity' && (
              <>
                <GroupHead title="Identity" />
                <TextField label="Name" value={about.name} onChange={(v) => update('name', v)} placeholder="Jane Doe" error={about.name.trim() === '' ? 'Name is required.' : undefined} />
                <TextField label="Credentials" value={about.credentials ?? ''} onChange={(v) => update('credentials', v)} placeholder="MBA, MS, PMP" hint="Shown once, under your name at the top of the home page. Keep Name to just your name." error={credentialsError(about.credentials)} />
                <TextField label="Professional title" value={about.title} onChange={(v) => update('title', v)} placeholder="Technology Strategy Executive" hint="Also used in search results." />
              </>
            )}

            {block.id === 'photo' && (
              <>
                <GroupHead title="Photo" note="Applies now" />
                <div className="flex flex-wrap items-center gap-5">
                  <div
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void uploadAsset('photo', f); }}
                    onDragOver={(e) => e.preventDefault()}
                    className="size-[120px] shrink-0 overflow-hidden rounded-full border border-ink bg-paper"
                  >
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoSrc} alt="Current profile photo" className="size-full object-cover object-top" />
                    ) : (
                      <span className="flex size-full items-center justify-center px-3 text-center text-xs text-ink-muted">No photo</span>
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      aria-disabled={photo.busy ? 'true' : undefined}
                      onClick={() => { if (!photo.busy) photoInputRef.current?.click(); }}
                      className={`${buttonClass('ghost')} ${photo.busy ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {photo.busy ? 'Uploading…' : 'Upload new photo'}
                    </button>
                    <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted"><Stamp>Applies now</Stamp> Goes live immediately. PNG, JPEG, GIF, WebP or AVIF, 4 MB maximum.</p>
                  </div>
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) void uploadAsset('photo', file);
                  }}
                />
                {uploadStatus(photo)}
                <GroupHead title="Quote" />
                <TextField label="Quote" multiline rows={3} value={about.quote ?? ''} onChange={(v) => update('quote', v)} hint="Shown in italics under your photo on the About page. Quotation marks are added automatically. Leave empty to hide it." />
              </>
            )}

            {block.id === 'resume' && (
              <>
                <GroupHead title="Résumé file" note="Applies now" />
                <div className="flex flex-wrap items-center gap-3 border border-ink px-4 py-3">
                  {about.resumeUrl ? (
                    <a href={about.resumeUrl} target="_blank" rel="noopener noreferrer" className="min-h-11 min-w-0 flex-1 break-all py-2.5 text-[15px] font-semibold underline underline-offset-4">
                      {fileName(about.resumeUrl)}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="min-h-11 flex-1 py-2.5 text-[15px] text-ink-muted">No résumé uploaded</span>
                  )}
                  <button
                    type="button"
                    aria-disabled={resume.busy ? 'true' : undefined}
                    onClick={() => { if (!resume.busy) resumeInputRef.current?.click(); }}
                    className={`${buttonClass('ghost')} ${resume.busy ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {resume.busy ? 'Uploading…' : 'Replace PDF'}
                  </button>
                  {about.resumeUrl && (
                    <Button type="button" variant="danger" onClick={() => update('resumeUrl', '')}>Remove résumé</Button>
                  )}
                </div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept="application/pdf"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) void uploadAsset('resume', file);
                  }}
                />
                {uploadStatus(resume)}
                <p className="text-sm text-ink-muted">
                  A new PDF goes live immediately and shows a Resume button on the site. Remove takes effect when you Save. 4 MB maximum.
                </p>
              </>
            )}

            {block.id === 'text' && (
              <>
                <GroupHead title="About text" note={`${about.bio.length}`} />
                <p className="text-sm text-ink-muted">One row per paragraph, in the order shown in the About section.</p>
                <ol aria-label="About paragraphs" className="border-t border-ink">
                  {about.bio.map((para, i) => {
                    const open = openPara === i;
                    return (
                      <li key={i} className={`border-b border-ink border-l-4 ${open ? 'border-l-ink' : 'border-l-transparent'}`}>
                        <div className="flex items-center gap-2 pr-2">
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpenPara(open ? null : i)}
                            className="flex min-h-[56px] min-w-0 flex-1 items-center gap-3 px-3 text-left"
                          >
                            <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                            <span className="min-w-0 flex-1 truncate font-display font-semibold">{firstLine(para)}</span>
                          </button>
                          <ItemControls
                            name={`paragraph ${i + 1}`}
                            index={i}
                            count={about.bio.length}
                            onMove={(d) => { update('bio', moveItem(about.bio, i, d)); if (open) setOpenPara(i + d); }}
                            onRemove={() => { update('bio', removeAt(about.bio, i)); setOpenPara(null); }}
                          />
                        </div>
                        {open && (
                          <div className="px-3 pb-4">
                            <TextField label={`Paragraph ${i + 1}`} multiline rows={6} value={para} onChange={(v) => update('bio', replaceAt(about.bio, i, v))} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
                <Button type="button" variant="ghost" onClick={() => { update('bio', [...about.bio, '']); setOpenPara(about.bio.length); }}>Add paragraph</Button>
              </>
            )}

            {block.id === 'hidden' && (
              <>
                <GroupHead title="Not shown on the site" />
                <div className="border border-ink bg-brand-cream px-4 py-3 text-sm">
                  These fields are still stored but no page displays them. Editing them changes nothing on the site, and nothing is deleted.
                </div>
                <details className="border border-ink">
                  <summary className="flex min-h-11 cursor-pointer items-center px-4 text-[15px] font-semibold">Show stored fields</summary>
                  <div className="space-y-4 px-4 pb-4 pt-2">
                    <TextField label="Hero tagline" multiline rows={3} value={about.heroTagline} onChange={(v) => update('heroTagline', v)} />
                    <Checkbox label="Available for work" checked={about.availableForWork} onChange={(v) => update('availableForWork', v)} />
                    <div>
                      <TextField
                        label="Add a skill"
                        value={skillInput}
                        onChange={setSkillInput}
                        hint="Type a skill, then choose Add skill."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => {
                          const s = skillInput.trim();
                          if (s && !about.skills.includes(s)) update('skills', [...about.skills, s]);
                          setSkillInput('');
                        }}
                      >
                        Add skill
                      </Button>
                      <ul aria-label="Skills" className="mt-3 flex flex-wrap gap-2">
                        {about.skills.map((skill) => (
                          <li key={skill} className="inline-flex items-center gap-1 border border-ink pl-3 text-sm">
                            {skill}
                            <button type="button" aria-label={`Remove skill ${skill}`} onClick={() => update('skills', about.skills.filter((s) => s !== skill))} className="inline-flex size-11 items-center justify-center">×</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        </div>
      )}
    />
  );
}
