import {
  Compass, Shapes, Network, ChartGantt, ChartColumn, ShieldCheck, Presentation,
  Search, Workflow, Sparkles, Route, Wrench, Users,
  Target, LayoutDashboard, CodeXml, Database, Cpu, Lock, Rocket,
} from "lucide-react";
import type { IconKey } from "@/lib/home-copy";

const ICONS = {
  compass: Compass, shapes: Shapes, network: Network, gantt: ChartGantt, bars: ChartColumn,
  shield: ShieldCheck, presentation: Presentation, search: Search, workflow: Workflow,
  sparkles: Sparkles, route: Route, wrench: Wrench, users: Users, target: Target,
  layout: LayoutDashboard, code: CodeXml, database: Database, cpu: Cpu, lock: Lock, rocket: Rocket,
} as const;

export default function CapabilityIcon({ name, size = 24 }: { name: IconKey; size?: number }) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={1.75} aria-hidden />;
}
