/** "MBA, MS, PMP" -> "MBA · MS · PMP". Empty or comma-only input returns "". */
export function formatCredentials(raw: string | undefined): string {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");
}

export const CREDENTIALS_MAX = 120;

/** Error message for an invalid `about.credentials` value, or undefined when valid. Empty means "none". */
export function credentialsError(v: unknown): string | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string") return "about.credentials must be a string when present.";
  if (v !== v.trim()) return "about.credentials must not have leading or trailing spaces.";
  if (v.length > CREDENTIALS_MAX) return `about.credentials must be ${CREDENTIALS_MAX} characters or fewer.`;
  return undefined;
}
