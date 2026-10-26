export function mergeDescribedBy(...ids: (string | false | null | undefined)[]): string | undefined {
  const out = ids.flatMap((v) => (v ? v.split(/\s+/) : [])).filter(Boolean);
  return out.length ? Array.from(new Set(out)).join(' ') : undefined;
}
