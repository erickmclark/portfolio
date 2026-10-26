'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import PrivacyParagraph from '@/components/privacy-paragraph';
import type { SiteContent } from '@/lib/types';

export type PrivacyContent = NonNullable<SiteContent['site']>['privacy'];

type Props = {
  open: boolean;
  onClose: () => void;
  content: PrivacyContent;
  email: string;
};

export default function PrivacyDialog({ open, onClose, content, email }: Props) {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const downOutside = useRef(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && open && !d.open) d.showModal();
  }, [open]);

  const closeTimer = useRef<number | undefined>(undefined);

  // Own scroll lock: remember whatever was set (the contact dialog's 'hidden' when nested) and restore it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function finishClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    const d = dialogRef.current;
    if (d?.open) d.close();
  }

  // Play the exit animation (data-closing), then close. Instant under reduced motion.
  function close() {
    const d = dialogRef.current;
    if (!d || !d.open) return;
    if (closeTimer.current !== undefined) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      d.close();
      return;
    }
    d.setAttribute('data-closing', '');
    closeTimer.current = window.setTimeout(finishClose, 400);
  }

  function isOutside(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target !== e.currentTarget) return false;
    const r = e.currentTarget.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${uid}-title`}
      onClose={(e) => {
        e.stopPropagation();
        window.clearTimeout(closeTimer.current);
        closeTimer.current = undefined;
        dialogRef.current?.removeAttribute('data-closing');
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
      }}
      onCancel={(e) => {
        e.stopPropagation();
        e.preventDefault();
        close();
      }}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && !e.pseudoElement && e.animationName.endsWith('-out')) finishClose();
      }}
      onPointerDown={(e) => {
        downOutside.current = isOutside(e);
      }}
      onClick={(e) => {
        if (downOutside.current && isOutside(e)) close();
        downOutside.current = false;
      }}
      className="contact-dialog privacy-dialog public-shell m-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-3xl border-2 border-ink bg-paper p-0 text-ink backdrop:bg-ink/55 sm:mb-auto sm:max-h-[calc(100dvh-48px)] sm:w-[min(680px,calc(100vw-32px))] sm:rounded-3xl"
    >
      {open && (
        <>
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-ink bg-paper px-4 pb-3 pt-4 sm:px-7 sm:pb-4 sm:pt-6">
            <h2 id={`${uid}-title`} className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[30px]">
              {content.title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close privacy policy"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink hover:bg-white"
            >
              <X size={20} aria-hidden />
            </button>
          </div>
          <div className="px-4 pb-8 pt-4 sm:px-7 sm:pt-5">
            <p className="text-[17px] font-medium leading-[1.4]">{content.intro}</p>
            {content.sections.map((sec) => (
              <section key={sec.id} aria-labelledby={`${uid}-${sec.id}`} className="mt-6 border-t border-ink pt-5">
                <h3 id={`${uid}-${sec.id}`} className="font-display text-lg font-bold leading-[1.2]">
                  {sec.title}
                </h3>
                <div className="mt-2 space-y-3 text-[15px] leading-[1.55]">
                  {sec.paragraphs.map((para, i) => (
                    <PrivacyParagraph key={i} text={para} email={email} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </dialog>
  );
}
