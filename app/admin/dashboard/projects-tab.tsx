"use client";

import { useState, useRef, useId } from 'react';
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
import {
  PROJECT_CATEGORIES,
  PROJECT_RELATIONSHIPS,
  VISIBILITIES,
  CASE_STUDY_SECTIONS,
  type Project,
  type ProjectImage,
  type ProjectCategory,
  type ProjectRelationship,
  type Visibility,
  type CaseStudySection,
} from '@/lib/types';
import GalleryManager from './gallery-manager';
import { galleryImages } from './gallery-utils';

// Human titles for case-study sections (content spec 6, required project page template).
const CASE_STUDY_LABELS: Record<CaseStudySection, string> = {
  role: 'Role',
  dates: 'Dates',
  intro: 'Detail intro',
  challenge: 'The challenge',
  responsibility: 'My responsibility',
  keyDecisions: 'Key decisions',
  delivered: 'What I delivered',
  howItWorks: 'How it works',
  riskAndControls: 'Risk and controls',
  outcome: 'Outcome and evidence',
  learned: 'What I learned / would improve',
};

const fieldClass =
  'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors';

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
  onRouteImages,
  onDelete,
  onDeletedWithWarning,
  onSlugImageMoved,
  onGitHubFill,
  onPendingChange,
  slugError,
}: {
  project: Project;
  onUpdate: (updated: Project) => void;
  onRouteImages: (images: ProjectImage[]) => void;
  onDelete: () => void;
  onDeletedWithWarning: (message: string) => void;
  onSlugImageMoved: (from: string, imagePath: string) => void;
  onGitHubFill: (fill: { title: string; tagline: string; tech: string[] }) => void;
  onPendingChange: (delta: 1 | -1) => void;
  slugError?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  });
  const uid = useId();
  const [expanded, setExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [movingImage, setMovingImage] = useState(false);
  const slugAtFocus = useRef<string | null>(null);

  const style = { transform: CSS.Transform.toString(transform), transition };

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    onUpdate({ ...project, [key]: value });
  }

  function setCaseStudySection(key: CaseStudySection, value: string) {
    const next = { ...project.caseStudy };
    if (value === '') delete next[key];
    else next[key] = value;
    set('caseStudy', Object.keys(next).length ? next : undefined);
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
        onGitHubFill({ title, tagline, tech });
      }
    } finally {
      setFetching(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.title || 'this project'}"? This removes the project and its uploaded images immediately.`)) return;
    setDeleting(true);
    setDeleteError(null);
    onPendingChange(1);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; deleted?: boolean };
        if (data.deleted === true) {
          // The project is gone from KV; drop it from dashboard state so a later Save cannot restore it.
          onDeletedWithWarning(data.error ?? 'The project was deleted, but some image files may remain in storage.');
          onDelete();
          return;
        }
        setDeleteError(data.error ?? 'Delete failed.');
        return;
      }
      onDelete();
    } catch {
      setDeleteError('Delete failed.');
    } finally {
      onPendingChange(-1);
      setDeleting(false);
    }
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
        onSlugImageMoved(from, imagePath);
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
        {project.visibility && project.visibility !== 'public' && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-border text-muted border border-border capitalize">
            {project.visibility}
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

          <div>
            <label htmlFor={`${uid}-ext`} className="text-xs text-muted uppercase tracking-widest mb-1 block">External URL (optional)</label>
            <input
              id={`${uid}-ext`}
              value={project.externalUrl ?? ''}
              onChange={(e) => set('externalUrl', e.target.value || undefined)}
              placeholder="https://"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${uid}-cat`} className="text-xs text-muted uppercase tracking-widest mb-1 block">Category</label>
              <select
                id={`${uid}-cat`}
                value={project.category ?? ''}
                onChange={(e) => set('category', (e.target.value || undefined) as ProjectCategory | undefined)}
                className={fieldClass}
              >
                <option value="">Not set</option>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-rel`} className="text-xs text-muted uppercase tracking-widest mb-1 block">Relationship</label>
              <select
                id={`${uid}-rel`}
                value={project.relationship ?? ''}
                onChange={(e) => set('relationship', (e.target.value || undefined) as ProjectRelationship | undefined)}
                className={fieldClass}
              >
                <option value="">Not set</option>
                {PROJECT_RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${uid}-status`} className="text-xs text-muted uppercase tracking-widest mb-1 block">Status</label>
              <input
                id={`${uid}-status`}
                value={project.status ?? ''}
                onChange={(e) => set('status', e.target.value || undefined)}
                placeholder="e.g. MVP, Live"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-vis`} className="text-xs text-muted uppercase tracking-widest mb-1 block">Visibility</label>
              <select
                id={`${uid}-vis`}
                aria-describedby={`${uid}-vis-hint`}
                value={project.visibility ?? 'public'}
                onChange={(e) => set('visibility', e.target.value as Visibility)}
                className={fieldClass}
              >
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <p id={`${uid}-vis-hint`} className="text-xs text-muted mt-1">Hidden and archived projects are kept in the admin but never shown publicly.</p>
            </div>
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

          <GalleryManager
            projectId={project.id}
            projectTitle={project.title}
            images={galleryImages(project)}
            onChange={(images, image) => onUpdate({ ...project, images, image })}
            onRouteImages={onRouteImages}
            onPendingChange={onPendingChange}
          />

          {/* Case study */}
          <div>
            <button
              type="button"
              onClick={() => setCaseStudyOpen((v) => !v)}
              aria-expanded={caseStudyOpen}
              className="flex items-center gap-2 text-xs text-muted hover:text-white uppercase tracking-widest transition-colors"
            >
              {caseStudyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Case study
            </button>
            {caseStudyOpen && (
              <div className="mt-3 space-y-4">
                {CASE_STUDY_SECTIONS.map((key) => (
                  <div key={key}>
                    <label htmlFor={`${uid}-cs-${key}`} className="text-xs text-muted uppercase tracking-widest mb-1 block">{CASE_STUDY_LABELS[key]}</label>
                    <textarea
                      id={`${uid}-cs-${key}`}
                      value={project.caseStudy?.[key] ?? ''}
                      onChange={(e) => setCaseStudySection(key, e.target.value)}
                      rows={4}
                      className={`${fieldClass} resize-y`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete — kept at bottom */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            {deleting ? 'Deleting…' : 'Delete project'}
          </button>
          {deleteError && <p role="alert" className="text-xs text-red-400">{deleteError}</p>}
        </div>
      )}
    </div>
  );
}

// ── Projects tab root ──────────────────────────────────────────────────────
export default function ProjectsTab({
  projects,
  onChange,
  onRouteImages,
  onDeleteProject,
  onSlugImageMoved,
  onGitHubFill,
  onPendingChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onRouteImages: (projectId: string, images: ProjectImage[]) => void;
  onDeleteProject: (projectId: string) => void;
  onSlugImageMoved: (projectId: string, from: string, imagePath: string) => void;
  onGitHubFill: (projectId: string, fill: { title: string; tagline: string; tech: string[] }) => void;
  onPendingChange: (delta: 1 | -1) => void;
}) {
  const [notice, setNotice] = useState('');
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

      <p role="alert" className="text-sm text-red-400 empty:hidden">{notice}</p>

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
                onRouteImages={(images) => onRouteImages(project.id, images)}
                onDelete={() => onDeleteProject(project.id)}
                onDeletedWithWarning={setNotice}
                onSlugImageMoved={(from, imagePath) => onSlugImageMoved(project.id, from, imagePath)}
                onGitHubFill={(fill) => onGitHubFill(project.id, fill)}
                onPendingChange={onPendingChange}
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
