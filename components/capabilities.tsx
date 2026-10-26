import { getSiteContent } from "@/lib/content";
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

export default async function Capabilities({ view }: { view: View }) {
  const { home } = await getSiteContent();
  const caps = home.capabilities[view];
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
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-10 sm:py-24">
        <SectionHead
          eyebrow={home.capabilitiesHead.eyebrow}
          heading={home.capabilitiesHead.heading}
          lede={home.capabilitiesHead.lede}
          headingId="cap-title"
        />
        <ol className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:mt-12 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4">
          {toned.map(({ c, i, cls, shape }) => (
            <li key={c.title} className="flex flex-col">
              <div className="flex h-14 items-end sm:h-28">
                <div className={`flex origin-bottom-left scale-[0.5] items-center justify-center sm:scale-100 ${cls} ${shape}`}>
                  <CapabilityIcon name={c.icon} />
                </div>
              </div>
              <div className="mt-3 border-t border-ink pt-3 sm:mt-4 sm:pt-4">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1.5 font-display text-base leading-tight sm:mt-3 sm:text-[22px] sm:leading-[1.15] font-bold tracking-[-0.03em]">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-muted sm:mt-2 sm:text-[15px] sm:leading-normal">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
