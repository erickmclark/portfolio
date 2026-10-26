import { CAPABILITIES, CAPABILITIES_HEAD } from "@/lib/home-copy";
import type { View } from "@/lib/home-view";
import CapabilityIcon from "./capability-icon";
import SectionHead from "./section-head";

const TONES = [
  "bg-brand-blue text-white",
  "bg-brand-orange text-ink",
  "bg-brand-yellow text-ink",
  "bg-brand-green text-white",
  "bg-brand-pink text-ink",
  "bg-brand-navy text-white",
  "bg-brand-sky text-ink",
];
const TILE = ["h-24 w-24", "h-16 w-36", "h-24 w-24 rounded-tl-[100%]", "h-28 w-14", "h-20 w-32", "h-14 w-32", "h-24 w-24"];

export default function Capabilities({ view }: { view: View }) {
  const caps = CAPABILITIES[view];
  // Governance/security is the band: it takes the black tile; the rest follow priority order.
  const order = caps.map((c, i) => ({ c, i }));
  let tone = 0;
  const toned = order.map(({ c, i }) => {
    if (c.band) return { c, i, cls: "bg-ink text-white", shape: "h-14 w-32" };
    const k = tone++;
    return { c, i, cls: TONES[k], shape: TILE[k] };
  });
  return (
    <section id="capabilities" aria-labelledby="cap-title" className="public-shell border-t border-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-10 sm:py-24">
        <SectionHead
          eyebrow={CAPABILITIES_HEAD.eyebrow}
          heading={CAPABILITIES_HEAD.heading}
          lede={CAPABILITIES_HEAD.lede}
          headingId="cap-title"
        />
        <ol className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {toned.map(({ c, i, cls, shape }) => (
            <li key={c.title} className="flex flex-col">
              <div className="flex h-28 items-end">
                <div className={`flex items-center justify-center ${cls} ${shape}`}>
                  <CapabilityIcon name={c.icon} />
                </div>
              </div>
              <div className="mt-4 border-t border-ink pt-4">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-display text-[22px] font-bold leading-[1.15] tracking-[-0.03em]">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-normal text-ink-muted">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
