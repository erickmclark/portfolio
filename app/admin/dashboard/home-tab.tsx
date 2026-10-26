"use client";

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ICON_KEYS, VIEWS, type Capability, type Cta, type HeroCopy, type HomeContent, type Project, type SiteContent, type View } from '@/lib/types';
import { validateSiteContent } from '@/lib/validate';
import CapabilityIcon from '@/components/capability-icon';
import { Button, GroupHead, Select, Stamp } from '../ui';
import {
  Checkbox, ErrorSummary, ItemControls, LedgerLayout, ListTextField, PillSwitch, SheetHead, TextField, useItemKeys, type LedgerRow,
} from '../ui/edit';
import {
  addUnique, errorFor, errorsUnder, moveItem, parseLines, readable, removeAt, replaceAt, setBand, unorderedProjects,
  withTertiary, withTertiaryExternal,
} from './content-edit';

type BlockId = 'profile' | 'views' | 'capshead' | 'approach' | 'work' | 'pov' | 'about';

const BLOCKS: { id: BlockId; title: string; note: string; paths: string[] }[] = [
  { id: 'profile', title: 'Profile line and view names', note: 'Profile line, selector label, the three view names', paths: ['home.profileLine', 'home.selectorLabel', 'home.viewLabels'] },
  { id: 'views', title: 'Per-view content', note: 'Hero, capabilities, work order', paths: ['home.hero', 'home.capabilities', 'home.workOrder'] },
  { id: 'capshead', title: 'Capabilities heading', note: 'Section head shared by all views', paths: ['home.capabilitiesHead'] },
  { id: 'approach', title: 'How I work', note: 'Heading, intro, steps, button', paths: ['home.approach'] },
  { id: 'work', title: 'Selected work and Experience', note: 'Section headings and the experience button', paths: ['home.work', 'home.experience'] },
  { id: 'pov', title: 'Point of view', note: 'Heading and exactly 3 principles', paths: ['home.pointOfView'] },
  { id: 'about', title: 'About and toolkit', note: 'Heading, closing label, toolkit groups', paths: ['home.about', 'home.toolkit'] },
];

const HREF_HINT = 'A #section, a /path or an https:// address.';

function CtaFields({ label, cta, base, errors, onChange, hint = HREF_HINT }: {
  label: string; cta: Cta; base: string; errors: string[]; onChange: (c: Cta) => void; hint?: string;
}) {
  return (
    <fieldset className="space-y-4 border-0 p-0">
      <legend className="mb-3 text-sm font-semibold">{label}</legend>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label={`${label} label`} value={cta.label} onChange={(v) => onChange({ ...cta, label: v })} error={errorFor(errors, `${base}.label`)} />
        <TextField label={`${label} goes to`} value={cta.href} onChange={(v) => onChange({ ...cta, href: v })} error={errorFor(errors, `${base}.href`)} hint={hint} mono />
      </div>
    </fieldset>
  );
}

function HeroEditor({ view, hero, errors, onChange }: { view: View; hero: HeroCopy; errors: string[]; onChange: (h: HeroCopy) => void }) {
  const base = `home.hero.${view}`;
  return (
    <div className="space-y-4">
      <GroupHead title="Hero" />
      <TextField label="Headline" multiline rows={2} value={hero.h1} onChange={(v) => onChange({ ...hero, h1: v })} error={errorFor(errors, `${base}.h1`)} />
      <TextField label="Body" multiline rows={5} value={hero.body} onChange={(v) => onChange({ ...hero, body: v })} error={errorFor(errors, `${base}.body`)} />
      <CtaFields label="Primary button" cta={hero.primary} base={`${base}.primary`} errors={errors} onChange={(primary) => onChange({ ...hero, primary })} hint={`${HREF_HINT} Use "resume" for the résumé download.`} />
      <CtaFields label="Secondary button" cta={hero.secondary} base={`${base}.secondary`} errors={errors} onChange={(secondary) => onChange({ ...hero, secondary })} hint={`${HREF_HINT} Use "resume" for the résumé download.`} />
      {hero.tertiary ? (
        <div className="space-y-2">
          <CtaFields label="Third button (optional)" cta={hero.tertiary} base={`${base}.tertiary`} errors={errors} onChange={(t) => onChange(withTertiary(hero, t))} />
          <Checkbox label="Opens another site" checked={!!hero.tertiaryExternal} onChange={(v) => onChange(withTertiaryExternal(hero, v))} />
          <Button type="button" variant="ghost" onClick={() => onChange(withTertiary(hero, undefined))}>Remove third button</Button>
        </div>
      ) : (
        <Button type="button" variant="ghost" onClick={() => onChange(withTertiary(hero, { label: '', href: '' }))}>Add a third button</Button>
      )}
    </div>
  );
}

function CapabilitiesEditor({ view, caps, errors, onChange }: { view: View; caps: Capability[]; errors: string[]; onChange: (c: Capability[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = `home.capabilities.${view}`;
  const groupErrors = errors.filter((m) => m.startsWith(`${base} `)).map(readable);
  return (
    <div className="space-y-4">
      <GroupHead title="Capabilities" note={`${caps.length} of 7`} />
      <p className="text-sm text-ink-muted">Seven capabilities per view, with one shown as the full-height band.</p>
      <ErrorSummary messages={groupErrors} />
      <ol className="border-t border-ink">
        {caps.map((c, i) => {
          const panel = `${base}-${i}-panel`;
          const expanded = open === i;
          const rowErrors = errorsUnder(errors, `${base}[${i}]`);
          return (
            <li key={i} className="border-b border-ink">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panel}
                onClick={() => setOpen(expanded ? null : i)}
                className="flex min-h-[72px] w-full items-center gap-3 py-3 text-left"
              >
                <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                <span aria-hidden="true"><CapabilityIcon name={c.icon} size={20} /></span>
                <span className="min-w-0 flex-1 truncate font-display font-semibold">{c.title || 'Untitled capability'}</span>
                {c.band && <Stamp solid>Band</Stamp>}
                {rowErrors.length > 0 && <Stamp>Fix</Stamp>}
                {expanded ? <ChevronUp aria-hidden="true" className="size-4 shrink-0" /> : <ChevronDown aria-hidden="true" className="size-4 shrink-0" />}
              </button>
              {expanded && (
                <div id={panel} className="space-y-4 pb-5 pl-0 md:pl-9">
                  <TextField label="Title" value={c.title} onChange={(v) => onChange(replaceAt(caps, i, { ...c, title: v }))} error={errorFor(errors, `${base}[${i}].title`)} />
                  <div className="flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <IconSelect value={c.icon} id={`${panel}-icon`} error={errorFor(errors, `${base}[${i}].icon`)} onChange={(icon) => onChange(replaceAt(caps, i, { ...c, icon }))} />
                    </div>
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center border border-ink"><CapabilityIcon name={c.icon} size={22} /></span>
                  </div>
                  <TextField label="Body" multiline rows={4} value={c.body} onChange={(v) => onChange(replaceAt(caps, i, { ...c, body: v }))} error={errorFor(errors, `${base}[${i}].body`)} />
                  <Checkbox
                    label="Show as the full-height band (one per view)"
                    checked={!!c.band}
                    onChange={(v) => { if (v) onChange(setBand(caps, i)); }}
                    hint={c.band ? 'Choose another capability to move the band.' : undefined}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function IconSelect({ value, id, error, onChange }: { value: string; id: string; error?: string; onChange: (v: Capability['icon']) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">Icon</label>
      <Select id={id} value={value} aria-invalid={error ? true : undefined} onChange={(e) => onChange(e.target.value as Capability['icon'])}>
        {ICON_KEYS.map((k) => (<option key={k} value={k}>{k}</option>))}
      </Select>
      {error && <p role="alert" className="mt-1.5 text-sm text-error">{error}</p>}
    </div>
  );
}

function WorkOrderEditor({ view, order, projects, errors, onChange }: { view: View; order: string[]; projects: Project[]; errors: string[]; onChange: (o: string[]) => void }) {
  const [pick, setPick] = useState('');
  const base = `home.workOrder.${view}`;
  const available = unorderedProjects(projects, order);
  const chosen = available.some((p) => p.id === pick) ? pick : (available[0]?.id ?? '');
  return (
    <div className="space-y-4">
      <GroupHead title="Work order" note={`${order.length} lead project${order.length === 1 ? '' : 's'}`} />
      <p className="text-sm text-ink-muted">Lead projects show first for this view; the rest follow in the Projects order.</p>
      <ErrorSummary messages={errorsUnder(errors, base).map(readable)} />
      {order.length === 0 ? (
        <p className="border border-ink px-4 py-3 text-sm">No lead projects. Projects follow the Projects order.</p>
      ) : (
        <ol aria-label={`Work order, ${view}`} className="border-t border-ink">
          {order.map((id, i) => {
            const p = projects.find((x) => x.id === id);
            const name = p?.title || (p ? 'Untitled project' : 'Missing project');
            return (
              <li key={id} className="flex items-center gap-3 border-b border-ink py-2">
                <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-semibold">{name}</span>
                  {!p && <span className="block text-sm text-error">This project no longer exists. Remove it.</span>}
                </span>
                <ItemControls name={name} index={i} count={order.length} onMove={(d) => onChange(moveItem(order, i, d))} onRemove={() => onChange(removeAt(order, i))} />
              </li>
            );
          })}
        </ol>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${base}-add`} className="mb-1.5 block text-sm font-semibold">Add a lead project</label>
          <Select id={`${base}-add`} value={chosen} disabled={available.length === 0} onChange={(e) => setPick(e.target.value)}>
            {available.length === 0 && <option value="">All projects are listed</option>}
            {available.map((p) => (<option key={p.id} value={p.id}>{p.title || 'Untitled project'}</option>))}
          </Select>
        </div>
        <Button type="button" variant="ghost" disabled={!chosen} onClick={() => { onChange(addUnique(order, chosen)); setPick(''); }}>Add</Button>
      </div>
    </div>
  );
}

function PerView({ home, projects, errors, setHome }: { home: HomeContent; projects: Project[]; errors: string[]; setHome: (h: HomeContent) => void }) {
  const [view, setView] = useState<View>('it');
  const setIn = <K extends 'hero' | 'capabilities' | 'workOrder'>(key: K, value: HomeContent[K][View]) =>
    setHome({ ...home, [key]: { ...home[key], [view]: value } });
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <PillSwitch label="View" value={view} onChange={setView} options={VIEWS.map((v) => ({ value: v, label: home.viewLabels[v] }))} />
        <p className="text-sm text-ink-muted">Switching views keeps your unsaved edits. Save publishes all three views at once.</p>
      </div>
      <HeroEditor key={`hero-${view}`} view={view} hero={home.hero[view]} errors={errors} onChange={(h) => setIn('hero', h)} />
      <CapabilitiesEditor key={`caps-${view}`} view={view} caps={home.capabilities[view]} errors={errors} onChange={(c) => setIn('capabilities', c)} />
      <WorkOrderEditor key={`order-${view}`} view={view} order={home.workOrder[view]} projects={projects} errors={errors} onChange={(o) => setIn('workOrder', o)} />
    </div>
  );
}

function ApproachSteps({ steps, errors, onChange }: { steps: HomeContent['approach']['steps']; errors: string[]; onChange: (s: HomeContent['approach']['steps']) => void }) {
  const keys = useItemKeys(steps.length);
  const base = 'home.approach.steps';
  return (
    <div className="space-y-4">
      <GroupHead title="Steps" note={`${steps.length}`} />
      <ErrorSummary messages={errors.filter((m) => m.startsWith(`${base} `)).map(readable)} />
      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={keys.keyAt(i)} className="space-y-3 border border-ink p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Step {i + 1}</span>
              <ItemControls
                name={`step ${i + 1}`}
                index={i}
                count={steps.length}
                onMove={(d) => { keys.move(i, d); onChange(moveItem(steps, i, d)); }}
                onRemove={() => { keys.remove(i); onChange(removeAt(steps, i)); }}
                removeDisabled={steps.length <= 1}
              />
            </div>
            <TextField label={`Step ${i + 1} title`} value={s.title} onChange={(v) => onChange(replaceAt(steps, i, { ...s, title: v }))} error={errorFor(errors, `${base}[${i}].title`)} />
            <TextField label={`Step ${i + 1} body`} multiline value={s.body} onChange={(v) => onChange(replaceAt(steps, i, { ...s, body: v }))} error={errorFor(errors, `${base}[${i}].body`)} />
          </li>
        ))}
      </ol>
      <Button type="button" variant="ghost" onClick={() => { keys.add(); onChange([...steps, { title: '', body: '' }]); }}>Add step</Button>
    </div>
  );
}

function Toolkit({ groups, errors, onChange }: { groups: HomeContent['toolkit']; errors: string[]; onChange: (g: HomeContent['toolkit']) => void }) {
  const keys = useItemKeys(groups.length);
  return (
    <div className="space-y-4">
      <GroupHead title="Toolkit" note={`${groups.length} group${groups.length === 1 ? '' : 's'}`} />
      <ol className="space-y-4">
        {groups.map((g, i) => (
          <li key={keys.keyAt(i)} className="space-y-3 border border-ink p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Group {i + 1}</span>
              <ItemControls
                name={g.group || `group ${i + 1}`}
                index={i}
                count={groups.length}
                onMove={(d) => { keys.move(i, d); onChange(moveItem(groups, i, d)); }}
                onRemove={() => { keys.remove(i); onChange(removeAt(groups, i)); }}
              />
            </div>
            <TextField label={`Group ${i + 1} name`} value={g.group} onChange={(v) => onChange(replaceAt(groups, i, { ...g, group: v }))} error={errorFor(errors, `home.toolkit[${i}].group`)} />
            <ListTextField label={`Group ${i + 1} items`} items={g.items} join={'\n'} parse={parseLines} rows={4} hint="One item per line." error={errorFor(errors, `home.toolkit[${i}].items`)} onChange={(items) => onChange(replaceAt(groups, i, { ...g, items }))} />
          </li>
        ))}
      </ol>
      <Button type="button" variant="ghost" onClick={() => { keys.add(); onChange([...groups, { group: '', items: [] }]); }}>Add group</Button>
    </div>
  );
}

function Sheet({ block, home, projects, errors, setHome }: { block: BlockId; home: HomeContent; projects: Project[]; errors: string[]; setHome: (h: HomeContent) => void }) {
  const e = (p: string) => errorFor(errors, p);
  switch (block) {
    case 'profile':
      return (
        <div className="space-y-4">
          <TextField label="Profile line" value={home.profileLine} onChange={(v) => setHome({ ...home, profileLine: v })} error={e('home.profileLine')} />
          <TextField label="Selector label" value={home.selectorLabel} onChange={(v) => setHome({ ...home, selectorLabel: v })} error={e('home.selectorLabel')} />
          <GroupHead title="View names" />
          <div className="grid gap-4 md:grid-cols-3">
            {VIEWS.map((v) => (
              <TextField key={v} label={`View name: ${v === 'it' ? 'IT professional' : v === 'consultant' ? 'Consultant' : 'Builder'}`} value={home.viewLabels[v]} onChange={(t) => setHome({ ...home, viewLabels: { ...home.viewLabels, [v]: t } })} error={e(`home.viewLabels.${v}`)} />
            ))}
          </div>
        </div>
      );
    case 'views':
      return <PerView home={home} projects={projects} errors={errors} setHome={setHome} />;
    case 'capshead': {
      const h = home.capabilitiesHead;
      return (
        <div className="space-y-4">
          <TextField label="Eyebrow" value={h.eyebrow} onChange={(v) => setHome({ ...home, capabilitiesHead: { ...h, eyebrow: v } })} error={e('home.capabilitiesHead.eyebrow')} />
          <TextField label="Heading" value={h.heading} onChange={(v) => setHome({ ...home, capabilitiesHead: { ...h, heading: v } })} error={e('home.capabilitiesHead.heading')} />
          <TextField label="Lede" multiline value={h.lede} onChange={(v) => setHome({ ...home, capabilitiesHead: { ...h, lede: v } })} error={e('home.capabilitiesHead.lede')} />
        </div>
      );
    }
    case 'approach': {
      const a = home.approach;
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <TextField label="Eyebrow" value={a.eyebrow} onChange={(v) => setHome({ ...home, approach: { ...a, eyebrow: v } })} error={e('home.approach.eyebrow')} />
            <TextField label="Heading" value={a.heading} onChange={(v) => setHome({ ...home, approach: { ...a, heading: v } })} error={e('home.approach.heading')} />
            <TextField label="Intro" multiline value={a.intro} onChange={(v) => setHome({ ...home, approach: { ...a, intro: v } })} error={e('home.approach.intro')} />
            <TextField label="Button label" value={a.cta} onChange={(v) => setHome({ ...home, approach: { ...a, cta: v } })} error={e('home.approach.cta')} />
          </div>
          <ApproachSteps steps={a.steps} errors={errors} onChange={(steps) => setHome({ ...home, approach: { ...a, steps } })} />
        </div>
      );
    }
    case 'work': {
      const w = home.work;
      const x = home.experience;
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <GroupHead title="Selected work" />
            <TextField label="Selected work eyebrow" value={w.eyebrow} onChange={(v) => setHome({ ...home, work: { ...w, eyebrow: v } })} error={e('home.work.eyebrow')} />
            <TextField label="Selected work heading" value={w.heading} onChange={(v) => setHome({ ...home, work: { ...w, heading: v } })} error={e('home.work.heading')} />
            <TextField label="Selected work intro" multiline value={w.intro} onChange={(v) => setHome({ ...home, work: { ...w, intro: v } })} error={e('home.work.intro')} />
          </div>
          <div className="space-y-4">
            <GroupHead title="Experience" />
            <TextField label="Experience eyebrow" value={x.eyebrow} onChange={(v) => setHome({ ...home, experience: { ...x, eyebrow: v } })} error={e('home.experience.eyebrow')} />
            <TextField label="Experience heading" value={x.heading} onChange={(v) => setHome({ ...home, experience: { ...x, heading: v } })} error={e('home.experience.heading')} />
            <TextField label="Experience button label" value={x.cta} onChange={(v) => setHome({ ...home, experience: { ...x, cta: v } })} error={e('home.experience.cta')} />
          </div>
        </div>
      );
    }
    case 'pov': {
      const p = home.pointOfView;
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <TextField label="Eyebrow" value={p.eyebrow} onChange={(v) => setHome({ ...home, pointOfView: { ...p, eyebrow: v } })} error={e('home.pointOfView.eyebrow')} />
            <TextField label="Heading" value={p.heading} onChange={(v) => setHome({ ...home, pointOfView: { ...p, heading: v } })} error={e('home.pointOfView.heading')} />
          </div>
          <GroupHead title="Principles" note="Exactly 3" />
          <ErrorSummary messages={errors.filter((m) => m.startsWith('home.pointOfView.principles ')).map(readable)} />
          {p.principles.map((pr, i) => (
            <div key={i} className="space-y-3 border border-ink p-4">
              <TextField label={`Principle ${i + 1} title`} value={pr.title} onChange={(v) => setHome({ ...home, pointOfView: { ...p, principles: replaceAt(p.principles, i, { ...pr, title: v }) } })} error={e(`home.pointOfView.principles[${i}].title`)} />
              <TextField label={`Principle ${i + 1} body`} multiline value={pr.body} onChange={(v) => setHome({ ...home, pointOfView: { ...p, principles: replaceAt(p.principles, i, { ...pr, body: v }) } })} error={e(`home.pointOfView.principles[${i}].body`)} />
            </div>
          ))}
        </div>
      );
    }
    case 'about': {
      const a = home.about;
      return (
        <div className="space-y-8">
          <div className="space-y-4">
            <GroupHead title="About heading" />
            <TextField label="Eyebrow" value={a.eyebrow} onChange={(v) => setHome({ ...home, about: { ...a, eyebrow: v } })} error={e('home.about.eyebrow')} />
            <TextField label="Heading" value={a.heading} onChange={(v) => setHome({ ...home, about: { ...a, heading: v } })} error={e('home.about.heading')} />
            <TextField label="Closing label" value={a.closingLabel} onChange={(v) => setHome({ ...home, about: { ...a, closingLabel: v } })} error={e('home.about.closingLabel')} />
          </div>
          <Toolkit groups={home.toolkit} errors={errors} onChange={(toolkit) => setHome({ ...home, toolkit })} />
        </div>
      );
    }
  }
}

export default function HomeTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const [selected, setSelected] = useState<BlockId>('views');
  const home = content.home;
  const errors = useMemo(() => {
    const r = validateSiteContent(content);
    return r.ok ? [] : r.errors.filter((m) => m.startsWith('home'));
  }, [content]);
  if (!home) {
    return <div role="alert" className="border border-error px-4 py-3">The home page content did not load. Reload the page; nothing was changed.</div>;
  }
  const rows: LedgerRow[] = BLOCKS.map((b) => ({
    id: b.id,
    title: b.title,
    note: b.note,
    stamp: b.paths.some((p) => errorsUnder(errors, p).length > 0) ? 'Fix' : undefined,
  }));
  const block = BLOCKS.find((b) => b.id === selected) ?? BLOCKS[1];
  const position = BLOCKS.indexOf(block) + 1;
  return (
    <LedgerLayout
      eyebrow={`Home page · ${BLOCKS.length} blocks`}
      title="Home page"
      intro="Text on the home page. Hero, capabilities and work order are set per view; everything else is shared."
      listLabel="Home page blocks"
      rows={rows}
      selectedId={block.id}
      onSelect={(id) => setSelected(id as BlockId)}
      sheet={({ headingRef, onBack }) => (
        <div className="border border-ink bg-white p-4 pb-10 md:p-8">
          <SheetHead eyebrow={`Block ${position} of ${BLOCKS.length}`} title={block.title} headingRef={headingRef} onBack={onBack} backLabel="All blocks" />
          <div className="mt-8">
            <Sheet block={block.id} home={home} projects={content.projects} errors={errors} setHome={(h) => onChange({ ...content, home: h })} />
          </div>
        </div>
      )}
    />
  );
}
