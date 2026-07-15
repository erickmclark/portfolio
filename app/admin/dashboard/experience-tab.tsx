"use client";

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { ExperienceItem } from '@/lib/types';

export default function ExperienceTab({
  experience,
  onChange,
}: {
  experience: ExperienceItem[];
  onChange: (experience: ExperienceItem[]) => void;
}) {
  const items = [...experience].sort((a, b) => a.order - b.order);

  function updateItem(id: string, patch: Partial<ExperienceItem>) {
    onChange(experience.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function addItem() {
    onChange([
      ...experience,
      {
        id: crypto.randomUUID(),
        role: '',
        company: '',
        start: '',
        end: '',
        description: '',
        order: experience.length,
      },
    ]);
  }

  function removeItem(id: string) {
    onChange(
      experience
        .filter((x) => x.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((x, i) => ({ ...x, order: i }))
    );
  }

  function move(id: string, dir: -1 | 1) {
    const sorted = [...experience].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    onChange(sorted.map((x, idx) => ({ ...x, order: idx })));
  }

  const inputClass =
    'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors';

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold">Experience</h2>
        <p className="text-xs text-muted mt-1">
          Work history shown on the homepage between About and Contact. The section stays hidden
          until at least one entry exists.
        </p>
      </div>

      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={item.id} className="border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted uppercase tracking-widest">Entry {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(item.id, -1)}
                  disabled={i === 0}
                  className="p-2 text-muted hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(item.id, 1)}
                  disabled={i === items.length - 1}
                  className="p-2 text-muted hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-muted hover:text-red-400 transition-colors"
                  aria-label="Remove entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Role</label>
                <input
                  value={item.role}
                  onChange={(e) => updateItem(item.id, { role: e.target.value })}
                  placeholder="Full-Stack Engineer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Company</label>
                <input
                  value={item.company}
                  onChange={(e) => updateItem(item.id, { company: e.target.value })}
                  placeholder="NightPivot"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Start</label>
                <input
                  value={item.start}
                  onChange={(e) => updateItem(item.id, { start: e.target.value })}
                  placeholder="2023"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-1 block">
                  End <span className="text-muted normal-case tracking-normal">(blank = Present)</span>
                </label>
                <input
                  value={item.end}
                  onChange={(e) => updateItem(item.id, { end: e.target.value })}
                  placeholder="2025"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Description</label>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                rows={3}
                placeholder="What you did and shipped in this role."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
      >
        <Plus size={14} />
        Add experience
      </button>
    </div>
  );
}
