"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Star, Upload } from 'lucide-react';
import { IMAGE_KINDS, type ProjectImage, type ProjectImageKind } from '@/lib/types';
import { coverUrls, moveUrls } from './gallery-utils';

const inputClass =
  'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors';
const iconBtnClass =
  'p-1.5 border border-border hover:border-accent rounded-md text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

type FocusTarget =
  | { kind: 'move'; url: string; dir: -1 | 1 }
  | { kind: 'cover'; url: string }
  | { kind: 'delete'; index: number };

type RouteResponse = { images?: ProjectImage[]; image?: string; error?: string };

export default function GalleryManager({
  projectId,
  projectTitle,
  images,
  onChange,
  onRouteImages,
  onPendingChange,
}: {
  projectId: string;
  projectTitle: string;
  images: ProjectImage[];
  onChange: (images: ProjectImage[], image: string) => void;
  /** Route responses go through here so the parent merges them into its latest state, never a render snapshot. */
  onRouteImages: (images: ProjectImage[]) => void;
  /** +1 when a server-side write starts, -1 when it settles, so the parent can lock Save. */
  onPendingChange: (delta: 1 | -1) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pendingFocus = useRef<FocusTarget | null>(null);
  const uid = useId();

  // Buttons are disabled while busy, so focus is restored once the operation settles.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target || busy !== null) return;
    pendingFocus.current = null;
    const rows = Array.from(listRef.current?.children ?? []) as HTMLElement[];
    const ctl = (row: HTMLElement | undefined, names: string[]) => {
      for (const n of names) {
        const el = row?.querySelector<HTMLElement>(`[data-ctl="${n}"]:not(:disabled)`);
        if (el) return el;
      }
      return null;
    };
    let el: HTMLElement | null = null;
    if (target.kind === 'delete') {
      el = ctl(rows[target.index], ['alt']) ?? ctl(rows[target.index - 1], ['alt']) ?? dropRef.current;
    } else {
      const row = rows[images.findIndex((i) => i.url === target.url)];
      el = ctl(row, target.kind === 'cover' ? ['down', 'up'] : target.dir === -1 ? ['up', 'down'] : ['down', 'up']);
    }
    el?.focus();
  }, [busy, images]);
  const dropRef = useRef<HTMLButtonElement>(null);

  const base = `/api/admin/projects/${projectId}/images`;

  function apply(res: RouteResponse) {
    onRouteImages(res.images ?? []);
  }

  async function run(label: string, request: () => Promise<Response>, failure: string) {
    if (busy) return;
    setBusy(label);
    setError(null);
    onPendingChange(1);
    try {
      const res = await request();
      const data = (await res.json().catch(() => ({}))) as RouteResponse;
      // A non-ok body can still carry the committed images (e.g. delete committed, blob cleanup failed).
      if (Array.isArray(data.images)) apply(data);
      if (!res.ok || !data.images) {
        setError(data.error ?? failure);
        return;
      }
    } catch {
      setError(failure);
    } finally {
      onPendingChange(-1);
      setBusy(null);
    }
  }

  function upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('alt', projectTitle || 'Project image');
    return run('Uploading…', () => fetch(base, { method: 'POST', body: form }), 'Image upload failed.');
  }

  function reorder(urls: string[] | null, focus: FocusTarget) {
    if (!urls) return;
    pendingFocus.current = focus;
    return run(
      'Working…',
      () =>
        fetch(base, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls }),
        }),
      'Reorder failed.'
    );
  }

  function remove(img: ProjectImage, index: number) {
    if (!confirm('Delete this image? It is removed from the project immediately.')) return;
    pendingFocus.current = { kind: 'delete', index };
    return run(
      'Working…',
      () =>
        fetch(base, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: img.url }),
        }),
      'Delete failed.'
    );
  }

  function edit(index: number, patch: Partial<ProjectImage>) {
    const next = images.map((img, i) => (i === index ? { ...img, ...patch } : img));
    onChange(next, next[0]?.url ?? '');
  }

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file) upload(file);
  }

  const disabled = busy !== null;

  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Gallery</label>
      <p className="text-xs text-muted mb-2">
        Upload, reorder, make cover and delete apply immediately. Alt text, caption and kind are saved with Save.
      </p>

      {images.length > 0 && (
        <ul ref={listRef} className="space-y-3 mb-3">
          {images.map((img, i) => (
            <li key={img.url} className="flex gap-3 p-3 bg-background border border-border rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} className="w-24 h-24 object-cover rounded-md shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <input
                    value={img.alt}
                    onChange={(e) => edit(i, { alt: e.target.value })}
                    placeholder="Alt text (required)"
                    data-ctl="alt"
                    aria-label={`Alt text for image ${i + 1}`}
                    aria-invalid={img.alt.trim() === ''}
                    aria-describedby={img.alt.trim() === '' ? `${uid}-alt-${i}` : undefined}
                    className={inputClass}
                  />
                  {img.alt.trim() === '' && (
                    <p id={`${uid}-alt-${i}`} className="text-xs text-red-400 mt-1">Alt text is required.</p>
                  )}
                </div>
                <input
                  value={img.caption ?? ''}
                  onChange={(e) => edit(i, { caption: e.target.value || undefined })}
                  placeholder="Caption (optional)"
                  aria-label={`Caption for image ${i + 1}`}
                  className={inputClass}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={img.kind}
                    onChange={(e) => edit(i, { kind: e.target.value as ProjectImageKind })}
                    aria-label={`Kind for image ${i + 1}`}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {IMAGE_KINDS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  {i === 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">Cover</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reorder(coverUrls(images, i), { kind: 'cover', url: img.url })}
                      disabled={disabled}
                      aria-label={`Make image ${i + 1} cover`}
                      className="flex items-center gap-1 px-2 py-1.5 border border-border hover:border-accent rounded-md text-xs text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Star size={12} />
                      Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => reorder(moveUrls(images, i, -1), { kind: 'move', url: img.url, dir: -1 })}
                    disabled={disabled || i === 0}
                    data-ctl="up"
                    aria-label={`Move image ${i + 1} up`}
                    className={iconBtnClass}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(moveUrls(images, i, 1), { kind: 'move', url: img.url, dir: 1 })}
                    disabled={disabled || i === images.length - 1}
                    data-ctl="down"
                    aria-label={`Move image ${i + 1} down`}
                    className={iconBtnClass}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(img, i)}
                    disabled={disabled}
                    aria-label={`Delete image ${i + 1}`}
                    className="p-1.5 border border-border hover:border-red-400 rounded-md text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        ref={dropRef}
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled) pick(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="w-full flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border hover:border-accent rounded-lg text-sm text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Upload size={14} />
        Drop an image here or click to add one
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
      <p role="status" className={`mt-2 text-xs text-muted empty:mt-0 ${busy ? 'animate-pulse' : ''}`}>{busy}</p>
      <p role="alert" className="mt-2 text-xs text-red-400 empty:mt-0">{error}</p>
    </div>
  );
}
