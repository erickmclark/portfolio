"use client";

import { useId, useState, type ReactNode, type RefObject } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { Eyebrow, fieldClass, errorTextClass, IconButton, Stamp } from './index';
import { mergeDescribedBy } from './describe';
import { useDrillIn } from './use-drill-in';

// Editing primitives shared by the Home page and Site editors. Errors come from validateSiteContent
// and show once the field is left, so a trailing space mid-word does not flash a message.

const labelClass = 'mb-1.5 block text-sm font-semibold';

export function TextField({
  label, value, onChange, error, hint, multiline = false, rows = 3, mono = false, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string;
  multiline?: boolean; rows?: number; mono?: boolean; placeholder?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const shown = focused ? undefined : error;
  const describedBy = mergeDescribedBy(shown && `${id}-error`, hint && `${id}-hint`);
  const common = {
    id,
    value,
    placeholder,
    'aria-invalid': shown ? true : undefined,
    'aria-describedby': describedBy,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      if (value !== value.trim()) onChange(value.trim());
    },
    className: `${fieldClass} ${mono ? 'font-mono' : ''} ${multiline ? 'resize-y' : ''}`,
  };
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {multiline ? (
        <textarea rows={rows} onChange={(e) => onChange(e.target.value)} {...common} />
      ) : (
        <input onChange={(e) => onChange(e.target.value)} {...common} />
      )}
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      {shown && <p id={`${id}-error`} role="alert" className={errorTextClass}>{shown}</p>}
    </div>
  );
}

/** One entry per paragraph or line. Keeps the raw text locally so blank lines can be typed; key it by the item's identity. */
export function ListTextField({
  label, items, onChange, parse, join, error, hint, rows = 5,
}: {
  label: string; items: string[]; onChange: (v: string[]) => void; parse: (text: string) => string[];
  join: string; error?: string; hint?: string; rows?: number;
}) {
  const [raw, setRaw] = useState(items.join(join));
  return (
    <TextField
      label={label}
      multiline
      rows={rows}
      value={raw}
      hint={hint}
      error={error}
      onChange={(v) => {
        setRaw(v);
        onChange(parse(v));
      }}
    />
  );
}

export function Checkbox({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-[15px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-ink" />
      <span><span className="font-semibold">{label}</span>{hint && <span className="text-ink-muted"> {hint}</span>}</span>
    </label>
  );
}

/** Inline list of validator messages for a group. */
export function ErrorSummary({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <ul role="alert" className="space-y-1 border border-error px-4 py-3 text-sm text-error">
      {messages.map((m) => (<li key={m}>{m}</li>))}
    </ul>
  );
}

/** Pill switch between a few options (the Segment component as pills). */
export function PillSwitch<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-[15px] font-semibold ${value === o.value ? 'bg-ink text-paper' : 'bg-transparent text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Move up, move down and (optionally) remove: 44px buttons named for the item. */
export function ItemControls({ name, index, count, onMove, onRemove, removeDisabled }: {
  name: string; index: number; count: number; onMove: (delta: -1 | 1) => void; onRemove?: () => void; removeDisabled?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <IconButton label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(-1)} type="button"><ArrowUp aria-hidden="true" className="size-4" /></IconButton>
      <IconButton label={`Move ${name} down`} disabled={index === count - 1} onClick={() => onMove(1)} type="button"><ArrowDown aria-hidden="true" className="size-4" /></IconButton>
      {onRemove && (
        <IconButton label={`Remove ${name}`} disabled={removeDisabled} onClick={onRemove} type="button"><X aria-hidden="true" className="size-4" /></IconButton>
      )}
    </div>
  );
}

export type LedgerRow = { id: string; title: string; note?: string; stamp?: string };

/**
 * Ledger index beside one white editor sheet, with the mobile drill-in used by Projects.
 * `sheet` renders the selected row's editor; it receives the heading ref and the back handler.
 */
export function LedgerLayout({ eyebrow, title, intro, rows, selectedId, onSelect, listLabel, sheet }: {
  eyebrow: string; title: string; intro?: string; rows: LedgerRow[]; selectedId: string; onSelect: (id: string) => void;
  listLabel: string;
  sheet: (ctx: { headingRef: RefObject<HTMLHeadingElement | null>; onBack: () => void }) => ReactNode;
}) {
  const drill = useDrillIn();
  return (
    <div className="md:grid md:grid-cols-[400px_minmax(0,1fr)] md:items-start md:gap-10">
      <div className={`${drill.open ? 'hidden md:block' : 'block'} md:sticky md:top-[88px] md:max-h-[calc(100vh-104px)] md:overflow-y-auto md:p-1`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display mt-1 text-[40px] font-bold leading-tight tracking-tight">{title}</h2>
        {intro && <p className="mb-4 mt-2 text-sm text-ink-muted">{intro}</p>}
        <ul aria-label={listLabel} className="mt-4 border-t border-ink">
          {rows.map((r, i) => {
            const selected = r.id === selectedId;
            return (
              <li key={r.id} className={`border-b border-ink border-l-4 ${selected ? 'border-l-ink bg-white' : 'border-l-transparent'}`}>
                <button
                  type="button"
                  ref={drill.rowRef(r.id)}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => { onSelect(r.id); drill.enter(r.id); }}
                  className="flex min-h-[72px] w-full items-center gap-3 px-3 py-3 text-left"
                >
                  <span aria-hidden="true" className="w-6 shrink-0 font-mono text-xs text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-semibold">{r.title}</span>
                    {r.note && <span className="block text-sm text-ink-muted">{r.note}</span>}
                  </span>
                  {r.stamp && <Stamp>{r.stamp}</Stamp>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className={`min-w-0 ${drill.open ? 'block' : 'hidden md:block'}`}>
        {sheet({ headingRef: drill.headingRef, onBack: drill.back })}
      </div>
    </div>
  );
}

export function SheetHead({ eyebrow, title, headingRef, onBack, backLabel }: {
  eyebrow: string; title: string; headingRef: RefObject<HTMLHeadingElement | null>; onBack: () => void; backLabel: string;
}) {
  return (
    <>
      <button type="button" onClick={onBack} className="-ml-2 mb-3 inline-flex min-h-11 items-center px-2 text-[15px] font-semibold md:hidden">
        ‹ {backLabel}
      </button>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 ref={headingRef} tabIndex={-1} className="font-display mt-1 text-3xl font-bold leading-tight tracking-tight focus:outline-none">{title}</h2>
    </>
  );
}

let keyCounter = 0;
const nextKey = () => `k${++keyCounter}`;

/** Stable React keys for a list that can be reordered, added to and removed from. Mirror each list edit. */
export function useItemKeys(count: number) {
  const [keys, setKeys] = useState<string[]>(() => Array.from({ length: count }, nextKey));
  return {
    keyAt: (i: number) => keys[i] ?? `i${i}`,
    add: () => setKeys((k) => [...k, nextKey()]),
    remove: (i: number) => setKeys((k) => k.filter((_, j) => j !== i)),
    move: (i: number, delta: -1 | 1) =>
      setKeys((k) => {
        const to = i + delta;
        if (to < 0 || to >= k.length) return k;
        const next = [...k];
        [next[i], next[to]] = [next[to], next[i]];
        return next;
      }),
  };
}
