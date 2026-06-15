"use client";

import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Plus, GitBranch } from 'lucide-react';
import type { Project } from '@/lib/types';

// ── Tech tag chip editor ───────────────────────────────────────────────────
function TechTagsEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  }

  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Tech Stack</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 bg-background border border-border rounded-md">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-muted hover:text-white ml-1 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a technology and press Enter"
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

// ── Single sortable project row ────────────────────────────────────────────
function SortableProject({
  project,
  onUpdate,
  onDelete,
  slugError,
}: {
  project: Project;
  onUpdate: (updated: Project) => void;
  onDelete: () => void;
  slugError?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  });
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [movingImage, setMovingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slugAtFocus = useRef<string | null>(null);

  const style = { transform: CSS.Transform.toString(transform), transition };

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    onUpdate({ ...project, [key]: value });
  }

  async function fetchFromGitHub() {
    if (!project.githubUrl) return;
    setFetching(true);
    try {
      const res = await fetch(
        `/api/github/repo?url=${encodeURIComponent(project.githubUrl)}`
      );
      if (res.ok) {
        const { title, tagline, tech } = (await res.json()) as {
          title: string;
          tagline: string;
          tech: string[];
        };
        onUpdate({ ...project, title, tagline, tech });
      }
    } finally {
      setFetching(false);
    }
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setLocalPreview(base64);
      try {
        const res = await fetch('/api/admin/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: project.slug, imageBase64: base64 }),
        });
        if (res.ok) {
          const { imagePath } = (await res.json()) as { imagePath: string };
          set('image', imagePath);
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  // When the slug changes, move the project image so its repo filename keeps
  // following the slug — otherwise the old file is orphaned and re-uploads pile up.
  async function handleSlugBlur() {
    const from = slugAtFocus.current;
    const to = project.slug.trim();
    slugAtFocus.current = null;
    if (!from || !to || from === to) return;
    // Only move images we own by convention (named after the previous slug).
    if (project.image !== `/projects/${from}.png`) return;
    setMovingImage(true);
    try {
      const res = await fetch('/api/admin/image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromSlug: from, toSlug: to }),
      });
      if (res.ok) {
        const { imagePath } = (await res.json()) as { imagePath: string };
        set('image', imagePath);
      }
    } finally {
      setMovingImage(false);
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-muted hover:text-white cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <p className="flex-1 font-medium truncate min-w-0">
          {project.title || <span className="text-muted italic">Untitled Project</span>}
        </p>
        {slugError && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-red-400/20 text-red-400 border border-red-400/30">
            Slug issue
          </span>
        )}
        {project.featured && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
            Featured
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-muted hover:text-white"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* GitHub URL + Auto-fill */}
          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">GitHub URL</label>
            <div className="flex gap-2">
              <input
                value={project.githubUrl ?? ''}
                onChange={(e) => set('githubUrl', e.target.value || undefined)}
                placeholder="https://github.com/you/repo"
                className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={fetchFromGitHub}
                disabled={fetching || !project.githubUrl}
                className="shrink-0 px-3 py-2 border border-border hover:border-accent rounded-lg text-sm text-muted hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <GitBranch size={14} />
                {fetching ? 'Fetching…' : 'Auto-fill'}
              </button>
            </div>
            <p className="text-xs text-muted mt-1">Paste a GitHub URL then click Auto-fill to populate title, tagline, and tech stack.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Title</label>
              <input
                value={project.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Slug (URL path)</label>
              <input
                value={project.slug}
                onFocus={() => { slugAtFocus.current = project.slug; }}
                onBlur={handleSlugBlur}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none transition-colors font-mono ${
                  slugError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-accent'
                }`}
              />
              {slugError && <p className="text-xs text-red-400 mt-1">{slugError}</p>}
              {movingImage && <p className="text-xs text-muted mt-1 animate-pulse">Moving image to match new slug…</p>}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Tagline</label>
            <input
              value={project.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="One-liner shown on project card"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Description (Markdown)</label>
            <textarea
              value={project.description}
              onChange={(e) => set('description', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent font-mono resize-y transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Live URL (optional)</label>
            <input
              value={project.liveUrl ?? ''}
              onChange={(e) => set('liveUrl', e.target.value || undefined)}
              placeholder="https://myproject.vercel.app"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <TechTagsEditor tags={project.tech} onChange={(tech) => set('tech', tech)} />

          {/* Featured toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('featured', !project.featured)}
              className={`relative w-10 h-6 rounded-full transition-colors ${project.featured ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${project.featured ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm">Featured <span className="text-muted">(shown first on the site)</span></span>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Project Image</label>
            <div
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageFile(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-border hover:border-accent rounded-lg overflow-hidden cursor-pointer transition-colors group"
            >
              {localPreview || project.image ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localPreview ?? project.image}
                    alt="Project preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-sm text-white font-medium">
                      {uploading ? 'Uploading…' : 'Click or drop to replace'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  {uploading ? (
                    <p className="text-sm text-muted animate-pulse">Uploading…</p>
                  ) : (
                    <p className="text-sm text-muted">Drop an image here or click to upload</p>
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
                if (file) handleImageFile(file);
              }}
            />
            {(localPreview || project.image) && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
                className="mt-2 text-xs text-muted hover:text-white transition-colors"
              >
                Full preview ↗
              </button>
            )}
          </div>

          {/* Lightbox */}
          {lightbox && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
              onClick={() => setLightbox(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={localPreview ?? project.image}
                alt="Full preview"
                className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                onClick={() => setLightbox(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
          )}

          {/* Delete — kept at bottom */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${project.title || 'this project'}"?`)) onDelete();
            }}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
            Delete project
          </button>
        </div>
      )}
    </div>
  );
}

// ── Projects tab root ──────────────────────────────────────────────────────
export default function ProjectsTab({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      onChange(
        arrayMove(projects, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }))
      );
    }
  }

  // ── Slug validation: flag empty slugs and any slug used more than once ──────
  const slugCounts = projects.reduce<Record<string, number>>((acc, p) => {
    const key = p.slug.trim();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  function slugErrorFor(project: Project): string | undefined {
    if (project.slug.trim() === '') return 'Slug is required.';
    if (slugCounts[project.slug.trim()] > 1) return 'Duplicate slug — each project needs a unique URL path.';
    return undefined;
  }

  const hasSlugErrors = projects.some((p) => slugErrorFor(p));

  function addProject() {
    const slug = `project-${Date.now()}`;
    const newProject: Project = {
      id: crypto.randomUUID(),
      slug,
      title: '',
      tagline: '',
      description: '',
      tech: [],
      featured: false,
      order: projects.length,
    };
    onChange([...projects, newProject]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Projects</h2>
        <p className="text-sm text-muted">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {hasSlugErrors && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          Some projects have a missing or duplicate slug. Saving is blocked until each project has a unique URL path.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {projects.map((project) => (
              <SortableProject
                key={project.id}
                project={project}
                slugError={slugErrorFor(project)}
                onUpdate={(updated) =>
                  onChange(projects.map((p) => (p.id === updated.id ? updated : p)))
                }
                onDelete={() => onChange(projects.filter((p) => p.id !== project.id))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addProject}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border hover:border-accent text-muted hover:text-white rounded-xl transition-colors text-sm"
      >
        <Plus size={16} />
        Add Project
      </button>
    </div>
  );
}
