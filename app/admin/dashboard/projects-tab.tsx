"use client";

import { useState, useRef, useId, useEffect } from 'react';
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
import { GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
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
import { deleteOutcome, nextNoticeAfterRetry, type DeleteNotice } from './project-updates';
import { galleryImages } from './gallery-utils';
import { caseStudyFilledCount, projectStamps, selectionAfterDelete } from './project-list';
import { Button, buttonClass, Eyebrow, Field, fieldClass, GroupHead, Select, Square, Stamp, Textarea } from '../ui';

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

const labelClass = 'mb-1.5 block text-sm font-semibold';
const hintClass = 'mt-1.5 text-sm text-ink-muted';

// ── Tech tag chip editor ───────────────────────────────────────────────────
function TechTagsEditor({ id, tags, onChange }: { id: string; tags: string[]; onChange: (tags: string[]) => void }) {
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
      <p id={`${id}-label`} className={labelClass}>Tech stack</p>
      <ul aria-labelledby={`${id}-label`} className="mb-3 flex min-h-11 flex-wrap gap-2 empty:hidden">
        {tags.map((tag) => (
          <li key={tag} className="inline-flex min-h-11 items-center rounded-full border border-ink pl-4 text-[15px]">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="inline-flex size-11 items-center justify-center rounded-full"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <label htmlFor={id} className="sr-only">Add a technology</label>
      <input
        id={id}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        aria-describedby={`${id}-hint`}
        placeholder="Add a technology"
        className={fieldClass}
      />
      <p id={`${id}-hint`} className={hintClass}>Press Enter to add.</p>
    </div>
  );
}

// ── One index row: a select button beside a separate drag handle ───────────
function IndexRow({ project, selected, slugBlocked, onSelect }: { project: Project; selected: boolean; slugBlocked: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const cover = galleryImages(project)[0]?.url;
  const stamps = projectStamps(project, slugBlocked);
  const name = project.title || 'Untitled project';

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch border-b border-ink border-l-4 ${selected ? 'border-l-ink bg-white' : 'border-l-transparent'} ${isDragging ? 'relative z-10 opacity-80' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${name}`}
        className="flex w-11 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? 'true' : undefined}
        className="flex min-h-[72px] min-w-0 flex-1 items-center gap-3 py-3 pr-3 text-left"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-10 w-16 shrink-0 border border-ink object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-10 w-16 shrink-0 items-center justify-center border border-ink font-mono text-[9px] uppercase tracking-wider text-ink-muted">No image</span>
        )}
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-display font-semibold ${project.title ? '' : 'italic text-ink-muted'}`}>{name}</span>
          <span className="block truncate text-sm text-ink-muted">{project.tagline || 'No tagline'}</span>
          {stamps.length > 0 && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {stamps.map((st) => (
                <Stamp key={st} featured={st === 'FEATURED'}>{st}</Stamp>
              ))}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

// ── The editor sheet for one project ───────────────────────────────────────
function ProjectEditor({
  project,
  position,
  total,
  onUpdate,
  onRouteImages,
  onDelete,
  onDeleteStart,
  onDeletedWithWarning,
  onSlugImageMoved,
  onGitHubFill,
  onPendingChange,
  onBack,
  retrying,
  slugError,
}: {
  project: Project;
  position: number;
  total: number;
  onUpdate: (updated: Project) => void;
  onRouteImages: (images: ProjectImage[]) => void;
  onDelete: () => void;
  onDeleteStart: () => void;
  onDeletedWithWarning: (projectId: string, message: string) => void;
  onSlugImageMoved: (from: string, imagePath: string) => void;
  onGitHubFill: (fill: { title: string; tagline: string; tech: string[] }) => void;
  onPendingChange: (delta: 1 | -1) => void;
  onBack: () => void;
  retrying: boolean;
  slugError?: string;
}) {
  const uid = useId();
  const [fetching, setFetching] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [movingImage, setMovingImage] = useState(false);
  const [moveError, setMoveError] = useState('');
  const slugAtFocus = useRef<string | null>(null);

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
    setGithubError('');
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
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setGithubError(data.error ?? 'Auto-fill failed. Check the URL and try again.');
      }
    } catch {
      setGithubError('Auto-fill failed. Check the URL and try again.');
    } finally {
      setFetching(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.title || 'this project'}"? This removes the project and its uploaded images immediately.`)) return;
    onDeleteStart();
    setDeleting(true);
    setDeleteError(null);
    onPendingChange(1);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; deleted?: boolean };
        if (deleteOutcome(false, data) === 'removed-with-warning') {
          // The project is gone from KV; drop it from dashboard state so a later Save cannot restore it.
          onDeletedWithWarning(project.id, data.error ?? 'The project was deleted, but some image files may remain in storage.');
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
    setMoveError('');
    try {
      const res = await fetch('/api/admin/image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromSlug: from, toSlug: to }),
      });
      if (res.ok) {
        const { imagePath } = (await res.json()) as { imagePath: string };
        onSlugImageMoved(from, imagePath);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMoveError(data.error ?? 'The image could not be moved to match the new slug.');
      }
    } catch {
      setMoveError('The image could not be moved to match the new slug.');
    } finally {
      setMovingImage(false);
    }
  }

  const filled = caseStudyFilledCount(project.caseStudy);

  return (
    <div className="border border-ink bg-white p-4 pb-10 md:p-8">
      <button type="button" onClick={onBack} className="-ml-2 mb-3 inline-flex min-h-11 items-center px-2 text-[15px] font-semibold md:hidden">
        ‹ All projects
      </button>
      <Eyebrow>Project {position} of {total} · /projects/{project.slug}</Eyebrow>
      <h2 className="font-display mt-1 text-3xl font-bold leading-tight tracking-tight">{project.title || 'Untitled project'}</h2>

      <div className="mt-8 space-y-4">
        <GroupHead title="Basics" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field id={`${uid}-title`} label="Title" value={project.title} onChange={(e) => set('title', e.target.value)} />
          <Field
            id={`${uid}-slug`}
            label="Slug (URL path)"
            value={project.slug}
            className={`${fieldClass} font-mono`}
            onFocus={() => { slugAtFocus.current = project.slug; setMoveError(''); }}
            onBlur={handleSlugBlur}
            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            error={slugError ?? (moveError || undefined)}
            hint={movingImage ? 'Moving image to match new slug…' : undefined}
          />
        </div>
        <Field id={`${uid}-tagline`} label="Tagline" value={project.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="One-liner shown on project card" />
        <div>
          <label htmlFor={`${uid}-desc`} className={labelClass}>Description (Markdown)</label>
          <Textarea id={`${uid}-desc`} value={project.description} onChange={(e) => set('description', e.target.value)} rows={6} className="resize-y font-mono" />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <GroupHead title="Source and links" />
        <div>
          <Field
            id={`${uid}-gh`}
            label="GitHub URL"
            value={project.githubUrl ?? ''}
            onChange={(e) => { set('githubUrl', e.target.value || undefined); setGithubError(''); }}
            placeholder="https://github.com/you/repo"
            error={githubError || undefined}
            hint="Paste a GitHub URL, then Auto-fill sets the title, tagline and tech stack."
          />
          <Button type="button" variant="ghost" onClick={fetchFromGitHub} disabled={fetching || !project.githubUrl} className="mt-3">
            {fetching ? 'Fetching…' : 'Auto-fill from GitHub'}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id={`${uid}-live`} label="Live URL (optional)" value={project.liveUrl ?? ''} onChange={(e) => set('liveUrl', e.target.value || undefined)} placeholder="https://myproject.vercel.app" />
          <Field id={`${uid}-ext`} label="External URL (optional)" value={project.externalUrl ?? ''} onChange={(e) => set('externalUrl', e.target.value || undefined)} placeholder="https://" />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <GroupHead title="Classification" />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-cat`} className={labelClass}>Category</label>
            <Select id={`${uid}-cat`} value={project.category ?? ''} onChange={(e) => set('category', (e.target.value || undefined) as ProjectCategory | undefined)}>
              <option value="">Not set</option>
              {PROJECT_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </Select>
          </div>
          <div>
            <label htmlFor={`${uid}-rel`} className={labelClass}>Relationship</label>
            <Select id={`${uid}-rel`} value={project.relationship ?? ''} onChange={(e) => set('relationship', (e.target.value || undefined) as ProjectRelationship | undefined)}>
              <option value="">Not set</option>
              {PROJECT_RELATIONSHIPS.map((r) => (<option key={r} value={r}>{r}</option>))}
            </Select>
          </div>
          <Field id={`${uid}-status`} label="Status" value={project.status ?? ''} onChange={(e) => set('status', e.target.value || undefined)} placeholder="e.g. MVP, Live" />
          <div>
            <label htmlFor={`${uid}-vis`} className={labelClass}>Visibility</label>
            <Select id={`${uid}-vis`} aria-describedby={`${uid}-vis-hint`} value={project.visibility ?? 'public'} onChange={(e) => set('visibility', e.target.value as Visibility)}>
              {VISIBILITIES.map((v) => (<option key={v} value={v}>{v}</option>))}
            </Select>
            <p id={`${uid}-vis-hint`} className={hintClass}>Hidden and archived projects are kept in the admin but never shown publicly.</p>
          </div>
        </div>
        <label className="flex min-h-11 items-center gap-3 text-[15px]">
          <input type="checkbox" checked={project.featured} onChange={(e) => set('featured', e.target.checked)} className="size-5 shrink-0 accent-ink" />
          <span><span className="font-semibold">Featured</span> <span className="text-ink-muted">(shown first on the site)</span></span>
        </label>
        <TechTagsEditor id={`${uid}-tech`} tags={project.tech} onChange={(tech) => set('tech', tech)} />
      </div>

      <div className="mt-10 space-y-4">
        <GroupHead title="Gallery" />
        <GalleryManager
          projectId={project.id}
          projectTitle={project.title}
          images={galleryImages(project)}
          onChange={(images, image) => onUpdate({ ...project, images, image })}
          onRouteImages={onRouteImages}
          onPendingChange={onPendingChange}
        />
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={() => setCaseStudyOpen((v) => !v)}
          aria-expanded={caseStudyOpen}
          aria-controls={`${uid}-cs`}
          className="flex min-h-11 w-full items-center justify-between gap-3 border-y border-ink py-2 text-left"
        >
          <span className="font-display text-lg font-semibold">
            Case study <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">· {filled} of {CASE_STUDY_SECTIONS.length} sections filled</span>
          </span>
          {caseStudyOpen ? <ChevronUp aria-hidden="true" className="size-4 shrink-0" /> : <ChevronDown aria-hidden="true" className="size-4 shrink-0" />}
        </button>
        {caseStudyOpen && (
          <div id={`${uid}-cs`} className="mt-4 space-y-4">
            {CASE_STUDY_SECTIONS.map((key) => (
              <div key={key}>
                <label htmlFor={`${uid}-cs-${key}`} className={labelClass}>{CASE_STUDY_LABELS[key]}</label>
                <Textarea id={`${uid}-cs-${key}`} value={project.caseStudy?.[key] ?? ''} onChange={(e) => setCaseStudySection(key, e.target.value)} rows={4} className="resize-y" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete: last, ruled off in the error colour, with its consequence. */}
      <div className="mt-12 border-t-2 border-error pt-6">
        <p className="mb-3 text-[15px]">Deletes the project and its uploaded images now. Save cannot undo this.</p>
        <button type="button" onClick={handleDelete} disabled={deleting || retrying} className={buttonClass('danger')}>
          {deleting ? 'Deleting…' : 'Delete project'}
        </button>
        {deleteError && <p role="alert" className="mt-2 text-sm text-error">{deleteError}</p>}
      </div>
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
  notice,
  setNotice,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onRouteImages: (projectId: string, images: ProjectImage[]) => void;
  onDeleteProject: (projectId: string) => void;
  onSlugImageMoved: (projectId: string, from: string, imagePath: string) => void;
  onGitHubFill: (projectId: string, fill: { title: string; tagline: string; tech: string[] }) => void;
  onPendingChange: (delta: 1 | -1) => void;
  notice: DeleteNotice;
  setNotice: React.Dispatch<React.SetStateAction<DeleteNotice>>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Below md the index and the editor are separate screens; this says which one shows.
  const [mobileEditor, setMobileEditor] = useState(false);
  const indexRef = useRef<HTMLDivElement>(null);
  // Keep the selected row visible inside the sticky, internally scrolling index.
  useEffect(() => {
    indexRef.current?.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest' });
  }, [selectedId, projects.length]);
  const [retrying, setRetrying] = useState(false);
  const [status, setStatus] = useState('');
  const noticeRef = useRef(notice);
  useEffect(() => {
    noticeRef.current = notice;
  }, [notice]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const noticeId = useId();
  const retryRef = useRef<HTMLButtonElement>(null);
  const focusRetry = useRef(false);

  useEffect(() => {
    if (notice && focusRetry.current) {
      focusRetry.current = false;
      retryRef.current?.scrollIntoView({ block: 'nearest' });
      retryRef.current?.focus();
    }
  }, [notice]);

  async function retryCleanup() {
    if (!notice || retrying) return;
    const { projectId } = notice;
    setRetrying(true);
    setStatus('Retrying cleanup…');
    onPendingChange(1);
    let outcome: 'removed' | 'removed-with-warning' | 'error' = 'error';
    let message = 'Retry failed.';
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, { method: 'DELETE' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      outcome = deleteOutcome(res.ok, data);
      if (outcome === 'removed-with-warning')
        message = data.error ?? 'The project was deleted, but some image files may remain in storage.';
      else if (outcome === 'error') message = data.error ?? 'Retry failed.';
    } catch {
      // keep the default failure outcome
    } finally {
      // Apply only if the notice still names this project; a newer or cleared notice is left alone.
      const stillCurrent = noticeRef.current?.projectId === projectId;
      setNotice((prev) => nextNoticeAfterRetry(prev, projectId, outcome, message));
      if (!stillCurrent) {
        setStatus('');
      } else if (outcome === 'removed') {
        setStatus('Cleanup finished.');
        headingRef.current?.focus();
      } else {
        // Clear first so an identical repeat failure still changes the live-region text.
        setStatus('');
        setTimeout(() => setStatus('Cleanup failed again.'), 50);
      }
      onPendingChange(-1);
      setRetrying(false);
    }
  }
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
    setSelectedId(newProject.id);
    setMobileEditor(true);
  }

  const selectedIndex = Math.max(0, projects.findIndex((p) => p.id === selectedId));
  const selected = projects[selectedIndex];

  return (
    <div className="md:grid md:grid-cols-[400px_minmax(0,1fr)] md:items-start md:gap-10">
      <div ref={indexRef} className={`${mobileEditor ? 'hidden md:block' : 'block'} md:sticky md:top-[88px] md:max-h-[calc(100vh-104px)] md:overflow-y-auto md:p-1`}>
        <Eyebrow>Projects · {projects.length}</Eyebrow>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 ref={headingRef} tabIndex={-1} className="font-display text-[40px] font-bold leading-tight tracking-tight focus:outline-none">Projects</h2>
          <Button type="button" variant="ghost" onClick={addProject}>Add project</Button>
        </div>
        <p className="mb-4 mt-2 text-sm text-ink-muted">
          Drag the grip, or focus it and use the arrow keys, to reorder. This is content order; the homepage reorders by view.
        </p>

        <div className="space-y-3 empty:hidden">
          {hasSlugErrors && (
            <div className="flex items-start gap-3 border border-ink bg-brand-cream px-4 py-3 text-sm">
              <span className="mt-1"><Square color="yellow" /></span>
              <p>Some projects have a missing or duplicate slug. Saving is blocked until each project has a unique URL path.</p>
            </div>
          )}
          <div className={notice ? 'border border-error px-4 py-3' : 'hidden'}>
            <p id={noticeId} role="alert" className="text-sm text-error empty:hidden">{notice?.message ?? ''}</p>
            {notice && (
              <button
                ref={retryRef}
                type="button"
                onClick={retryCleanup}
                aria-disabled={retrying ? 'true' : undefined}
                aria-describedby={noticeId}
                className={`${buttonClass('ghost')} mt-3 ${retrying ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {retrying ? 'Retrying…' : 'Retry cleanup'}
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" className="sr-only">{status}</p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul aria-label="Projects" className="mt-4 border-t border-ink">
              {projects.map((project) => (
                <IndexRow
                  key={project.id}
                  project={project}
                  selected={project.id === selected?.id}
                  slugBlocked={!!slugErrorFor(project)}
                  onSelect={() => {
                    setSelectedId(project.id);
                    setMobileEditor(true);
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      <div className={`min-w-0 ${mobileEditor ? 'block' : 'hidden md:block'}`}>
        {selected ? (
          <ProjectEditor
            key={selected.id}
            project={selected}
            position={selectedIndex + 1}
            total={projects.length}
            slugError={slugErrorFor(selected)}
            onUpdate={(updated) => onChange(projects.map((p) => (p.id === updated.id ? updated : p)))}
            onRouteImages={(images) => onRouteImages(selected.id, images)}
            onDelete={() => {
              setSelectedId(selectionAfterDelete(projects.map((p) => p.id), selected.id));
              setMobileEditor(false);
              onDeleteProject(selected.id);
            }}
            onDeleteStart={() => setNotice(null)}
            onDeletedWithWarning={(projectId, message) => {
              focusRetry.current = true;
              setNotice({ projectId, message });
            }}
            onSlugImageMoved={(from, imagePath) => onSlugImageMoved(selected.id, from, imagePath)}
            onGitHubFill={(fill) => onGitHubFill(selected.id, fill)}
            onPendingChange={onPendingChange}
            onBack={() => setMobileEditor(false)}
            retrying={retrying}
          />
        ) : (
          <div className="border border-ink bg-white p-8">
            <p className="font-display text-xl font-semibold">No projects yet.</p>
            <p className="mt-1 text-ink-muted">Use Add project to create the first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
