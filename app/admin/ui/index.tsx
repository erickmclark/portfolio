import { mergeDescribedBy } from './describe';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Admin-scoped R9 primitives. Mirrors components/contact-form.tsx fields; fields stay square, buttons and chips are pills.

export type BrandColor = 'navy' | 'blue' | 'green' | 'pink' | 'sky' | 'cream' | 'orange' | 'yellow';

const SQUARE: Record<BrandColor, string> = {
  navy: 'bg-brand-navy',
  blue: 'bg-brand-blue',
  green: 'bg-brand-green',
  pink: 'bg-brand-pink',
  sky: 'bg-brand-sky',
  cream: 'bg-brand-cream outline outline-1 -outline-offset-1 outline-ink',
  orange: 'bg-brand-orange',
  yellow: 'bg-brand-yellow',
};

export function Square({ color }: { color: BrandColor }) {
  return <span aria-hidden="true" className={`inline-block size-2.5 shrink-0 ${SQUARE[color]}`} />;
}

export const fieldClass =
  'block min-h-11 w-full border border-ink bg-paper px-3.5 py-2 text-base text-ink aria-[invalid=true]:border-2 aria-[invalid=true]:border-red-700';
export const errorTextClass = 'mt-1.5 text-sm text-red-700';

export function Field({ label, id, error, hint, 'aria-describedby': extraDescribedBy, ...props }: { label: string; id: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = mergeDescribedBy(error && `${id}-error`, hint && `${id}-hint`, extraDescribedBy);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input id={id} className={fieldClass} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className={errorTextClass}>{error}</p>}
    </div>
  );
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldClass} ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}

const pill = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50';
const VARIANT = {
  primary: 'bg-ink text-paper border border-ink',
  ghost: 'border border-ink bg-transparent text-ink',
  danger: 'border border-red-700 bg-transparent text-red-700',
} as const;

export function buttonClass(variant: keyof typeof VARIANT = 'primary') {
  return `${pill} ${VARIANT[variant]}`;
}

export function Button({ variant = 'primary', className = '', ...props }: { variant?: keyof typeof VARIANT } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export function IconButton({ label, children, className = '', ...props }: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink text-ink disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionChip({ label, color, count, current, onClick }: { label: string; color: BrandColor; count?: number; current: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink px-4 text-sm font-semibold ${current ? 'bg-ink text-paper' : 'bg-transparent text-ink'}`}
    >
      <Square color={color} />
      {label}
      {count !== undefined && <span className="font-mono text-xs">{count}</span>}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">{children}</p>;
}

export function GroupHead({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-ink pb-2">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {note && <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{note}</span>}
    </div>
  );
}

// One sentence, never a glyph. The live region stays mounted so changes are announced; the text crossfades.
export function SaveStatus({ id, sentence, tone = 'default', onDark = false }: { id: string; sentence: string; tone?: 'default' | 'error'; onDark?: boolean }) {
  const color = tone === 'error' ? (onDark ? 'text-brand-pink' : 'text-red-700') : onDark ? 'text-paper' : 'text-ink-muted';
  return (
    <p id={id} role="status" className={`min-w-0 text-sm ${color}`}>
      <span key={sentence} className="admin-fade inline-block">{sentence}</span>
    </p>
  );
}
