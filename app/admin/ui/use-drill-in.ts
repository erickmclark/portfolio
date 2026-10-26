"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

/**
 * Mobile drill-in between an index and an editor sheet. Below md they are separate screens:
 * entering focuses the editor heading and resets scroll; going back focuses the row that was open.
 * On desktop both show side by side, so focus is left alone.
 */
export function useDrillIn() {
  const [open, setOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rows = useRef(new Map<string, HTMLElement>());
  const lastId = useRef<string | null>(null);
  const pending = useRef<'heading' | 'row' | null>(null);

  useEffect(() => {
    const what = pending.current;
    pending.current = null;
    if (!what || isDesktop()) return;
    if (what === 'heading') {
      window.scrollTo(0, 0);
      headingRef.current?.focus();
    } else {
      const el = lastId.current ? rows.current.get(lastId.current) : undefined;
      el?.focus();
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [open]);

  const enter = useCallback((id: string) => {
    lastId.current = id;
    pending.current = 'heading';
    setOpen(true);
  }, []);
  const back = useCallback(() => {
    pending.current = 'row';
    setOpen(false);
  }, []);
  /** Leave without restoring row focus (for example after a delete). */
  const close = useCallback(() => setOpen(false), []);
  const rowRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) rows.current.set(id, el);
      else rows.current.delete(id);
    },
    [],
  );

  return { open, enter, back, close, headingRef, rowRef };
}
