"use client";

import { Suspense, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, CircleUser, House, Mail } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { parseView, viewHref, type View } from "@/lib/home-view";
import { resolveBottomNavItem, shouldSetPending, type BottomNavItem, type PendingBottomNav } from "@/lib/bottom-nav-current";

const item =
  "relative inline-flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-full focus-visible:rounded-full! px-1 text-xs leading-none font-semibold touch-manipulation [-webkit-tap-highlight-color:transparent]";
const ico = { "aria-hidden": true, size: 20, strokeWidth: 2.25 } as const;
const active = "text-brand-sky";
const ORDER: BottomNavItem[] = ["home", "work", "about", "contact"];

function BottomNav({ photo, view }: { photo?: string; view: View }) {
  const pathname = usePathname();
  // Optimistic highlight for the in-flight navigation started by a tap; cleared as soon as the pathname changes.
  const [pending, setPending] = useState<PendingBottomNav | null>(null);
  if (pending && pathname !== pending.from) setPending(null);
  const current = resolveBottomNavItem(pathname, pending);
  // The indicator keeps its last position while hidden, and only slides between two visible items.
  const [lastIndex, setLastIndex] = useState(Math.max(0, current ? ORDER.indexOf(current) : 0));
  const index = current ? ORDER.indexOf(current) : lastIndex;
  if (index !== lastIndex) setLastIndex(index);
  const [tracked, setTracked] = useState({ current, slide: false });
  if (tracked.current !== current) setTracked({ current, slide: tracked.current !== null && current !== null });
  const slide = tracked.slide;
  if (pathname.startsWith("/admin")) return null;

  const cls = (key: BottomNavItem) => `${item} ${current === key ? active : ""}`;
  const aria = (key: BottomNavItem) => (current === key ? ("page" as const) : undefined);
  const tap = (key: BottomNavItem) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (shouldSetPending(e)) setPending({ key, from: pathname });
  };

  return (
    <nav
      aria-label="Primary"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom))" }}
      className="bottom-nav font-body [&_a]:focus-visible:outline-brand-sky! fixed inset-x-3 z-40 mx-auto flex max-w-sm items-center justify-between rounded-full border border-white/15 bg-ink px-1 py-0.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] supports-[backdrop-filter]:bg-ink/40 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 supports-[backdrop-filter]:backdrop-brightness-70 md:hidden"
    >
      <span
        aria-hidden
        style={{
          transform: `translateX(${index * 100}%)`,
          opacity: current ? 1 : 0,
          transitionProperty: slide ? "transform, opacity" : "opacity",
          transitionDuration: "var(--dur-base)",
          transitionTimingFunction: "var(--ease-out-expo)",
        }}
        className="pointer-events-none absolute top-0.5 left-1 h-11 w-[calc((100%-0.5rem)/4)] rounded-full bg-black/40 motion-reduce:transition-none!"
      />
      <Link href={viewHref("/", view)} aria-current={aria("home")} onClick={tap("home")} className={cls("home")}>
        <House {...ico} />
        Home
      </Link>
      <Link href={viewHref("/work", view)} aria-current={aria("work")} onClick={tap("work")} className={cls("work")}>
        <BriefcaseBusiness {...ico} />
        Work
      </Link>
      <Link href={viewHref("/about", view)} aria-current={aria("about")} onClick={tap("about")} className={cls("about")}>
        {photo ? (
          <Image src={photo} alt="" width={20} height={20} sizes="20px" className="h-5 w-5 rounded-full object-cover ring-1 ring-brand-sky shadow-[0_0_6px_1px_var(--color-brand-sky)]" />
        ) : (
          <CircleUser {...ico} />
        )}
        About
      </Link>
      <Link href={viewHref("/contact", view)} aria-current={aria("contact")} onClick={tap("contact")} className={cls("contact")}>
        <Mail {...ico} />
        Contact
      </Link>
    </nav>
  );
}

function WithView({ photo }: { photo?: string }) {
  return <BottomNav photo={photo} view={parseView(useSearchParams().get("view") ?? undefined)} />;
}

// useSearchParams needs a Suspense boundary on statically prerendered routes; the fallback renders the default-view links.
export default function MobileBottomNav({ photo }: { photo?: string }) {
  return (
    <Suspense fallback={<BottomNav photo={photo} view="it" />}>
      <WithView photo={photo} />
    </Suspense>
  );
}
