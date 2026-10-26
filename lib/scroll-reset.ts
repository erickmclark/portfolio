export type ScrollResetInput = {
  /** Pathname of the page that just mounted. */
  pathname: string;
  /** Pathname of the previous public page seen in this document, or null on the first mount. */
  lastPathname: string | null;
  hash: string;
  /** Pathname of the most recent history.pushState since the last mount, or null. */
  pushedPath: string | null;
};

/** Whether a freshly mounted page should be returned to the top. Pure and client-safe. */
export function shouldResetScroll({ pathname, lastPathname, hash, pushedPath }: ScrollResetInput): boolean {
  if (lastPathname === null) return false; // initial document load or reload: the browser owns scroll
  if (pushedPath !== pathname) return false; // no push to this page (back/forward, or a stale push elsewhere): the browser restores position
  if (hash) return false; // hash targets are handled by native anchors / HashScroll
  return pathname !== lastPathname; // same-path query changes keep their scroll position
}

export const PIN_WINDOW_MS = 700;

/** Whether to keep re-pinning the page to the top after a reset. */
export function shouldKeepPinning(elapsedMs: number, userIntent: boolean): boolean {
  return !userIntent && elapsedMs < PIN_WINDOW_MS;
}
