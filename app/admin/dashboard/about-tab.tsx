"use client";

import { useState, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { AboutContent } from '@/lib/types';

export default function AboutTab({
  about,
  onChange,
}: {
  about: AboutContent;
  onChange: (about: AboutContent) => void;
}) {
  const [skillInput, setSkillInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localPhotoPreview, setLocalPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    onChange({ ...about, [key]: value });
  }

  function addSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!about.skills.includes(skillInput.trim())) {
        update('skills', [...about.skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  }

  function updateBioPara(index: number, value: string) {
    const newBio = [...about.bio];
    newBio[index] = value;
    update('bio', newBio);
  }

  function addBioPara() {
    update('bio', [...about.bio, '']);
  }

  function removeBioPara(index: number) {
    update('bio', about.bio.filter((_, i) => i !== index));
  }

  async function handlePhotoFile(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setLocalPhotoPreview(base64);
      try {
        const res = await fetch('/api/admin/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: 'about-profile', imageBase64: base64 }),
        });
        if (res.ok) {
          const { imagePath } = (await res.json()) as { imagePath: string };
          update('photo', imagePath);
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const photoSrc = localPhotoPreview ?? (about.photo || null);

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-xl font-bold">About</h2>

      {/* ── Identity ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Your Name</label>
          <input
            value={about.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Jane Doe"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Title / Role</label>
          <input
            value={about.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Software Engineer"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* ── Available for work toggle ─────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => update('availableForWork', !about.availableForWork)}
          className={`relative w-10 h-6 rounded-full transition-colors ${about.availableForWork ? 'bg-accent' : 'bg-border'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${about.availableForWork ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
        <span className="text-sm">Available for work <span className="text-muted">(shows pulsing badge in hero)</span></span>
      </div>

      {/* ── Hero tagline ──────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Hero Tagline</label>
        <textarea
          value={about.heroTagline}
          onChange={(e) => update('heroTagline', e.target.value)}
          rows={3}
          placeholder="The short pitch shown beneath your name on the homepage."
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-y transition-colors"
        />
        <p className="text-xs text-muted mt-1">Shown below your name and title on the homepage.</p>
      </div>

      {/* ── Résumé ────────────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1 block">
          Résumé URL <span className="text-muted normal-case tracking-normal">(optional)</span>
        </label>
        <input
          value={about.resumeUrl ?? ''}
          onChange={(e) => update('resumeUrl', e.target.value)}
          placeholder="/resume.pdf"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
        />
        <p className="text-xs text-muted mt-1">
          Place the PDF in the <code>/public</code> folder (e.g. <code>/resume.pdf</code>) and enter its path here. Shows a Resume button in the hero — leave blank to hide.
        </p>
      </div>

      {/* ── Profile photo ─────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Profile Photo</label>
        <div
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handlePhotoFile(file);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-border hover:border-accent rounded-xl overflow-hidden cursor-pointer transition-colors group"
        >
          {photoSrc ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc}
                alt="Profile preview"
                className="w-full h-48 object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-sm text-white font-medium">
                  {uploading ? 'Uploading…' : 'Click or drop to replace'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              {uploading ? (
                <p className="text-sm text-muted animate-pulse">Uploading…</p>
              ) : (
                <p className="text-sm text-muted">Drop a photo here or click to upload</p>
              )}
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePhotoFile(file);
          }}
        />
      </div>

      {/* ── Bio paragraphs ────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
          Bio Paragraphs <span className="text-muted normal-case tracking-normal">(shown in About section)</span>
        </label>
        <div className="space-y-3">
          {about.bio.map((para, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                value={para}
                onChange={(e) => updateBioPara(i, e.target.value)}
                rows={3}
                placeholder={`Paragraph ${i + 1}`}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-y transition-colors"
              />
              <button
                type="button"
                onClick={() => removeBioPara(i)}
                className="shrink-0 mt-1 p-2 text-muted hover:text-red-400 transition-colors"
                aria-label="Remove paragraph"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addBioPara}
          className="mt-3 flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
        >
          <Plus size={14} />
          Add paragraph
        </button>
      </div>

      {/* ── Skills ───────────────────────────────────────────────────── */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Skills / Technologies</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
          {about.skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 text-sm px-3 py-1 border border-border rounded-full bg-background">
              {skill}
              <button
                type="button"
                onClick={() => update('skills', about.skills.filter((s) => s !== skill))}
                className="text-muted hover:text-white ml-1 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Type a skill and press Enter to add"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>
  );
}
