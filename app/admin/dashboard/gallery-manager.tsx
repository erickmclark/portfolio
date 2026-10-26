"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { IMAGE_KINDS, type ProjectImage, type ProjectImageKind } from '@/lib/types';
import { coverUrls, moveUrls } from './gallery-utils';
import { buttonClass, errorTextClass, fieldClass, IconButton, Square, Stamp } from '../ui';


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
      <p className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
        <span className="inline-flex items-center gap-1.5"><Square color="navy" size={8} />Applies now · upload, order, cover, delete</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="inline-block size-2 border border-ink" />On save · alt text, caption, kind</span>
      </p>

      {images.length > 0 && (
        <ul ref={listRef} className="mb-4 border-t border-ink">
          {images.map((img, i) => {
            const altMissing = img.alt.trim() === '';
            return (
              <li key={img.url} className="flex flex-col gap-4 border-b border-ink py-4 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="aspect-[8/5] w-full shrink-0 border border-ink object-cover sm:h-[100px] sm:w-[160px]" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <label htmlFor={`${uid}-alt-${i}`} className="mb-1.5 block text-sm font-semibold">Alt text (required)</label>
                    <input
                      id={`${uid}-alt-${i}`}
                      value={img.alt}
                      onChange={(e) => edit(i, { alt: e.target.value })}
                      data-ctl="alt"
                      aria-label={`Alt text for image ${i + 1}`}
                      aria-invalid={altMissing ? true : undefined}
                      aria-describedby={altMissing ? `${uid}-alt-err-${i}` : undefined}
                      className={fieldClass}
                    />
                    {altMissing && <p id={`${uid}-alt-err-${i}`} className={errorTextClass}>Alt text is required.</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                    <div>
                      <label htmlFor={`${uid}-cap-${i}`} className="mb-1.5 block text-sm font-semibold">Caption (optional)</label>
                      <input
                        id={`${uid}-cap-${i}`}
                        value={img.caption ?? ''}
                        onChange={(e) => edit(i, { caption: e.target.value || undefined })}
                        aria-label={`Caption for image ${i + 1}`}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-kind-${i}`} className="mb-1.5 block text-sm font-semibold">Kind</label>
                      <select
                        id={`${uid}-kind-${i}`}
                        value={img.kind}
                        onChange={(e) => edit(i, { kind: e.target.value as ProjectImageKind })}
                        aria-label={`Kind for image ${i + 1}`}
                        className={fieldClass}
                      >
                        {IMAGE_KINDS.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {i === 0 ? (
                      <Stamp solid>Cover</Stamp>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reorder(coverUrls(images, i), { kind: 'cover', url: img.url })}
                        disabled={disabled}
                        aria-label={`Make image ${i + 1} cover`}
                        className={buttonClass('ghost')}
                      >
                        Make cover
                      </button>
                    )}
                    <span className="ml-auto flex gap-2">
                      <IconButton
                        label={`Move image ${i + 1} up`}
                        type="button"
                        onClick={() => reorder(moveUrls(images, i, -1), { kind: 'move', url: img.url, dir: -1 })}
                        disabled={disabled || i === 0}
                        data-ctl="up"
                      >
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Move image ${i + 1} down`}
                        type="button"
                        onClick={() => reorder(moveUrls(images, i, 1), { kind: 'move', url: img.url, dir: 1 })}
                        disabled={disabled || i === images.length - 1}
                        data-ctl="down"
                      >
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Delete image ${i + 1}`}
                        type="button"
                        onClick={() => remove(img, i)}
                        disabled={disabled}
                        className="!border-error text-error"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </IconButton>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled) pick(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center gap-3 border border-dashed border-ink p-6 text-center"
      >
        <p className="text-sm text-ink-muted">Drop an image here, or choose one. It is added to the project immediately.</p>
        <button type="button" ref={dropRef} disabled={disabled} onClick={() => fileInputRef.current?.click()} className={buttonClass('primary')}>
          Upload image
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Choose an image to upload"
        tabIndex={-1}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = '';
        }}
      />
      <p role="status" className={`mt-2 text-sm text-ink-muted empty:mt-0 ${busy ? 'animate-pulse' : ''}`}>{busy}</p>
      <p role="alert" className={`${errorTextClass} empty:hidden`}>{error}</p>
    </div>
  );
}
