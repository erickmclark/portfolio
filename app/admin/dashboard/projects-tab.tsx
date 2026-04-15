"use client";
import type { Project } from '@/lib/types';
export default function ProjectsTab({ projects, onChange }: { projects: Project[]; onChange: (p: Project[]) => void }) {
  return <div className="text-muted">Projects tab loading…</div>;
}
