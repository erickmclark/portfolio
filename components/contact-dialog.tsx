'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import ContactForm from '@/components/contact-form';
import { CONTACT_INTENTS, CONTACT_INTENT_COPY, type ContactIntent } from '@/lib/contact';

type Props = {
  sourcePage: string;
  email: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  initialIntent?: ContactIntent | null;
  initialValues?: Record<string, string>;
};

export default function ContactDialog({ sourcePage, email, linkedinUrl, resumeUrl, initialIntent = null, initialValues = {} }: Props) {
  const uid = useId();
  const [intent, setIntent] = useState<ContactIntent | null>(initialIntent);
  const [drafts, setDrafts] = useState<Partial<Record<ContactIntent, Record<string, string>>>>(
    initialIntent ? { [initialIntent]: initialValues } : {},
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const downOutside = useRef(false);
  const open = intent !== null;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d || !open) return;
    if (!d.open) d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    dialogRef.current?.close();
  }

  // The dialog itself is the target for backdrop clicks and for its own border/scrollbar, so test geometry too.
  function isOutside(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target !== e.currentTarget) return false;
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  }

  // Fires for Escape, the close button and backdrop clicks alike.
  function onClosed() {
    setIntent(null);
    selectRef.current?.focus();
  }

  const copy = intent ? CONTACT_INTENT_COPY[intent] : null;

  return (
    <div>
      <label htmlFor={`${uid}-intent`} className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
        What brings you here?
      </label>
      <div className="relative mt-3 max-w-[420px]">
        <select
          ref={selectRef}
          id={`${uid}-intent`}
          value={intent ?? ''}
          aria-describedby={`${uid}-hint`}
          onChange={(e) => {
            if (!e.target.value) return;
            setIntent(e.target.value as ContactIntent);
          }}
          className="block min-h-12 w-full appearance-none rounded-full border-2 border-ink bg-white py-2 pl-5 pr-12 text-base font-semibold text-ink"
        >
          <option value="">Choose a topic…</option>
          {CONTACT_INTENTS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
        <ChevronDown size={18} aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
      </div>

      <p id={`${uid}-hint`} className="mt-2 text-[13px] text-ink-muted">
        Choosing a topic opens its form.
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-title`}
        onClose={onClosed}
        onPointerDown={(e) => {
          downOutside.current = isOutside(e);
        }}
        onClick={(e) => {
          if (downOutside.current && isOutside(e)) close();
          downOutside.current = false;
        }}
        className="contact-dialog public-shell m-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-3xl border-2 border-ink bg-paper p-0 text-ink backdrop:bg-ink/55 sm:mb-auto sm:max-h-[calc(100dvh-48px)] sm:w-[min(760px,calc(100vw-32px))] sm:rounded-3xl"
      >
        {intent && copy && (
          <>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink bg-paper px-4 pb-3 pt-4 sm:px-7 sm:pb-4 sm:pt-6">
              <div>
                <h2
                  id={`${uid}-title`}
                  className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[30px]"
                >
                  {copy.heading}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink hover:bg-white"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <div className="px-4 pb-8 pt-4 sm:px-7 sm:pt-5">
              {copy.supporting && <p className="mb-5 text-[15px] leading-[1.45] text-ink-muted">{copy.supporting}</p>}
              <ContactForm
                key={intent}
                intent={intent}
                initialValues={drafts[intent] ?? {}}
                onValuesChange={(v) => setDrafts((d) => ({ ...d, [intent]: v }))}
                onSent={() =>
                  setDrafts((d) => {
                    const rest = { ...d };
                    delete rest[intent];
                    return rest;
                  })
                }
                sourcePage={sourcePage}
                email={email}
                linkedinUrl={linkedinUrl}
                resumeUrl={resumeUrl}
              />
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
