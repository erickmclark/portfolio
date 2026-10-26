import { CAPABILITIES } from "@/lib/home-copy";
import type { View } from "@/lib/home-view";
import CapabilityIcon from "./capability-icon";

/**
 * Priority configuration (Figma 99:359): priority 1 is the large block, 2-3 the
 * medium blocks, and the governance/security capability the full-height band.
 * Labels carry the full capability titles (spec 16.8). Decorative: the same
 * text is in the capabilities list, so the figure is hidden from assistive tech.
 */
const SLOTS = [
  { area: "1 / 1 / 14 / 13", tone: "bg-brand-blue text-white", big: true },
  { area: "1 / 13 / 8 / 21", tone: "bg-brand-orange text-ink" },
  { area: "8 / 13 / 14 / 21", tone: "bg-brand-cream text-ink", quarter: true },
  { area: "14 / 1 / 21 / 9", tone: "bg-brand-green text-white" },
  { area: "14 / 9 / 17 / 21", tone: "bg-brand-pink text-ink" },
  { area: "17 / 9 / 21 / 21", tone: "bg-brand-navy text-white", sky: true },
] as const;

export default function Configuration({ view, className = "", labels = true }: { view: View; className?: string; labels?: boolean }) {
  const caps = CAPABILITIES[view];
  const band = caps.find((c) => c.band)!;
  const rest = caps.filter((c) => !c.band);
  // Figma 99:359 / 126:2276: in the Consultant view the pink and ink parts swap roles.
  const swap = view === "consultant";
  return (
    <div
      aria-hidden
      className={`grid aspect-square w-full sm:aspect-[6/5] gap-[2px] bg-paper ${className}`}
      style={{ gridTemplateColumns: "repeat(24, 1fr)", gridTemplateRows: "repeat(20, 1fr)" }}
    >
      {SLOTS.map((slot, i) => {
        const cap = rest[i];
        const tone = swap && slot.tone.startsWith("bg-brand-pink") ? "bg-ink text-white" : slot.tone;
        return (
          <div
            key={cap.title}
            className={`relative isolate overflow-hidden p-2 sm:p-3 ${tone}`}
            style={{ gridArea: slot.area }}
          >
            {"quarter" in slot && <span className="absolute inset-0 rounded-tl-[100%] bg-brand-yellow" />}
            <span className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
              <CapabilityIcon name={cap.icon} size={22} />
            </span>
            {labels && (
              <span
                className={`absolute z-10 bottom-2 left-2 font-mono font-bold uppercase leading-[1.12] tracking-[0.06em] sm:bottom-3 sm:left-3 sm:leading-tight ${
                  "big" in slot ? "right-2 text-[13px] sm:right-3 sm:text-xl" : "right-9 text-[11px] sm:right-11 sm:text-xs"
                }`}
              >
                {cap.title}
              </span>
            )}
          </div>
        );
      })}
      <div className={`relative ${swap ? "bg-brand-pink text-ink" : "bg-ink text-white"}`} style={{ gridArea: "1 / 21 / 21 / 25" }}>
        <span className="absolute left-1/2 top-2 -translate-x-1/2 sm:top-3">
          <CapabilityIcon name={band.icon} size={20} />
        </span>
        {labels && (
          <span
            className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold uppercase tracking-[0.06em] sm:bottom-3 sm:text-xs"
            style={{ writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)" }}
          >
            {band.title}
          </span>
        )}
      </div>
    </div>
  );
}
