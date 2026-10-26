"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_CATEGORIES } from "@/lib/types";
import type { ProjectCategory } from "@/lib/types";
import { DEFAULT_VIEW, workHref, type View } from "@/lib/home-view";

export default function WorkCategorySelect({ view, category }: { view: View; category: ProjectCategory | null }) {
  const router = useRouter();
  const [value, setValue] = useState<string>(category ?? "");
  const [seen, setSeen] = useState(category);
  if (seen !== category) {
    setSeen(category);
    setValue(category ?? "");
  }

  return (
    <form action="/work" method="get" onSubmit={(e) => e.preventDefault()} className="mt-10 flex flex-col gap-2 sm:max-w-sm">
      {view !== DEFAULT_VIEW && <input type="hidden" name="view" value={view} />}
      <label htmlFor="work-category" className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        Category
      </label>
      <div className="relative">
        <select
          id="work-category"
          name="category"
          value={value}
          onChange={(e) => {
            const next = (PROJECT_CATEGORIES as readonly string[]).includes(e.target.value) ? (e.target.value as ProjectCategory) : null;
            setValue(e.target.value);
            router.push(workHref(view, next), { scroll: false });
          }}
          className="h-11 w-full cursor-pointer appearance-none rounded-full border-2 border-ink bg-paper pl-5 pr-11 text-[15px] font-semibold text-ink hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <option value="">All</option>
          {PROJECT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <noscript>
        <button type="submit" className="on-dark mt-2 inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-ink px-5 text-[15px] font-semibold text-white">
          Apply
        </button>
      </noscript>
    </form>
  );
}
