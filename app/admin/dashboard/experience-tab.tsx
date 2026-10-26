"use client";

import { useId, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { VISIBILITIES, type ExperienceItem, type Visibility } from '@/lib/types';
import { Button, Eyebrow, IconButton, Select, Stamp } from '../ui';
import { SheetHead, TextField } from '../ui/edit';
import { useDrillIn } from '../ui/use-drill-in';

const VISIBILITY_LABEL: Record<Visibility, string> = { public: 'Public', hidden: 'Hidden', archived: 'Archived' };

const byOrder = (list: ExperienceItem[]) => [...list].sort((a, b) => a.order - b.order);
const renumber = (list: ExperienceItem[]) => list.map((x, i) => ({ ...x, order: i }));

export default function ExperienceTab({
  experience,
  onChange,
}: {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}) {
  const items = byOrder(experience);
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const drill = useDrillIn();
  const selectId = useId();

  const selectedIndex = Math.max(0, items.findIndex((x) => x.id === selectedId));
  const selected = items[selectedIndex];

  function updateItem(id: string, patch: Partial<ExperienceItem>) {
    onChange(experience.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function addItem() {
    const item: ExperienceItem = { id: crypto.randomUUID(), role: '', company: '', start: '', end: '', description: '', order: items.length };
    onChange([...items, item]);
    setSelectedId(item.id);
    drill.enter(item.id);
  }

  function removeItem(id: string) {
    const i = items.findIndex((x) => x.id === id);
    const rest = items.filter((x) => x.id !== id);
    setSelectedId((rest[i] ?? rest[i - 1])?.id ?? '');
    drill.close();
    onChange(renumber(rest));
  }

  function move(id: string, dir: -1 | 1) {
    const sorted = [...items];
    const i = sorted.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    onChange(renumber(sorted));
  }

  const nameOf = (x: ExperienceItem, i: number) => x.role || x.company || `entry ${i + 1}`;

  return (
    <div className="md:grid md:grid-cols-[400px_minmax(0,1fr)] md:items-start md:gap-10">
      <div className={`${drill.open ? 'hidden md:block' : 'block'} md:sticky md:top-[88px] md:max-h-[calc(100vh-104px)] md:overflow-y-auto md:p-1`}>
        <Eyebrow>Experience · {items.length}</Eyebrow>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="font-display text-[40px] font-bold leading-tight tracking-tight">Experience</h2>
          <Button type="button" variant="ghost" onClick={addItem}>Add entry</Button>
        </div>
        <p className="mb-4 mt-2 text-sm text-ink-muted">
          Work history shown on the homepage between About and Contact. The section stays hidden until at least one entry exists.
        </p>
        {items.length > 0 && (
          <ul aria-label="Experience entries" className="mt-4 border-t border-ink">
            {items.map((item, i) => {
              const current = item.id === selected?.id;
              const name = nameOf(item, i);
              const vis = item.visibility ?? 'public';
              return (
                <li key={item.id} className={`flex items-center border-b border-ink border-l-4 ${current ? 'border-l-ink bg-white' : 'border-l-transparent'}`}>
                  <button
                    type="button"
                    ref={drill.rowRef(item.id)}
                    aria-current={current ? 'true' : undefined}
                    onClick={() => { setSelectedId(item.id); drill.enter(item.id); }}
                    className="flex min-h-[72px] min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-semibold">{item.role || 'Untitled role'}</span>
                      <span className="block text-sm text-ink-muted">
                        {[item.company, `${item.start || '…'} – ${item.end || 'Present'}`].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {vis !== 'public' && <Stamp>{VISIBILITY_LABEL[vis]}</Stamp>}
                  </button>
                  <div className="flex shrink-0 items-center gap-1 pr-2">
                    <IconButton type="button" label={`Move ${name} up`} disabled={i === 0} onClick={() => move(item.id, -1)}><ArrowUp aria-hidden="true" className="size-4" /></IconButton>
                    <IconButton type="button" label={`Move ${name} down`} disabled={i === items.length - 1} onClick={() => move(item.id, 1)}><ArrowDown aria-hidden="true" className="size-4" /></IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className={`min-w-0 ${drill.open ? 'block' : 'hidden md:block'}`}>
        {selected ? (
          <div key={selected.id} className="border border-ink bg-white p-4 pb-10 md:p-8">
            <SheetHead
              eyebrow={`Entry ${selectedIndex + 1} of ${items.length}`}
              title={selected.role || 'New entry'}
              headingRef={drill.headingRef}
              onBack={drill.back}
              backLabel="All entries"
            />
            <div className="mt-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Role" value={selected.role} onChange={(v) => updateItem(selected.id, { role: v })} placeholder="Director of Operations" />
                <TextField label="Company" value={selected.company} onChange={(v) => updateItem(selected.id, { company: v })} placeholder="Company name" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Start" value={selected.start} onChange={(v) => updateItem(selected.id, { start: v })} placeholder="2019" />
                <TextField label="End" value={selected.end} onChange={(v) => updateItem(selected.id, { end: v })} placeholder="2024" hint="Leave blank to show Present." />
              </div>
              <TextField label="Description" multiline rows={5} value={selected.description} onChange={(v) => updateItem(selected.id, { description: v })} placeholder="What you did and delivered in this role." />
              <div>
                <label htmlFor={selectId} className="mb-1.5 block text-sm font-semibold">Visibility</label>
                <Select id={selectId} value={selected.visibility ?? 'public'} onChange={(e) => updateItem(selected.id, { visibility: e.target.value as Visibility })}>
                  {VISIBILITIES.map((v) => (<option key={v} value={v}>{VISIBILITY_LABEL[v]}</option>))}
                </Select>
              </div>
              <div className="border-t border-ink pt-6">
                <Button type="button" variant="danger" onClick={() => removeItem(selected.id)}>Remove entry</Button>
                <p className="mt-2 text-sm text-ink-muted">Removes this entry when you Save.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-ink bg-white p-8">
            <p className="font-display text-xl font-semibold">No entries yet.</p>
            <p className="mt-1 text-ink-muted">The Experience section stays hidden on the homepage until an entry exists. Use Add entry to create the first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
