import { getSiteContent } from "@/lib/content";
import { Eyebrow } from "./section-head";

const MARKS = ["bg-brand-yellow", "bg-brand-pink", "bg-brand-blue"];

export default async function PointOfView() {
  const { home } = await getSiteContent();
  const POV = home.pointOfView;
  return (
    <section id="point-of-view" aria-labelledby="pov-title" className="public-shell border-t border-ink">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 sm:px-10 sm:py-24 lg:grid-cols-2 lg:gap-[72px]">
        <div>
          <Eyebrow>{POV.eyebrow}</Eyebrow>
          <h2
            id="pov-title"
            className="mt-6 font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-[52px]"
          >
            {POV.heading}
          </h2>
        </div>
        <ul>
          {POV.principles.map((p, i) => (
            <li key={p.title} className="flex gap-5 border-t border-ink py-6">
              <span className={`mt-1.5 h-4 w-4 shrink-0 ${MARKS[i]}`} aria-hidden />
              <div>
                <h3 className="font-display text-[22px] font-bold tracking-[-0.03em]">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-normal text-ink-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
