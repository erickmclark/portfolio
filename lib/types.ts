import type { ContactIntent } from './contact';

export const PROJECT_CATEGORIES = [
  'Enterprise Leadership',
  'Web & App Development',
  'AI & SaaS Products',
  'AI Engineering Systems',
  'AI Strategy & Governance',
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_RELATIONSHIPS = [
  'Employment',
  'Client Work',
  'Independent Product',
  'Company Product',
] as const;
export type ProjectRelationship = (typeof PROJECT_RELATIONSHIPS)[number];

export const VISIBILITIES = ['public', 'hidden', 'archived'] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const IMAGE_KINDS = ['screenshot', 'conceptual'] as const;
export type ProjectImageKind = (typeof IMAGE_KINDS)[number];

export type ProjectImage = {
  url: string;
  alt: string;
  caption?: string;
  kind: ProjectImageKind; // 'conceptual' is never presented as an application screenshot
};

/** Case-study page sections (content spec 6). Each is markdown/text; empty means no verified fact yet. */
export const CASE_STUDY_SECTIONS = [
  'role',
  'dates',
  'intro',
  'challenge',
  'responsibility',
  'keyDecisions',
  'delivered',
  'howItWorks',
  'riskAndControls',
  'outcome',
  'learned',
] as const;
export type CaseStudySection = (typeof CASE_STUDY_SECTIONS)[number];
export type CaseStudy = Partial<Record<CaseStudySection, string>>;

export const VIEWS = ['it', 'consultant', 'builder'] as const;
export type View = (typeof VIEWS)[number];

export const ICON_KEYS = [
  'compass', 'shapes', 'network', 'gantt', 'bars', 'shield', 'presentation',
  'search', 'workflow', 'sparkles', 'route', 'wrench', 'users',
  'target', 'layout', 'code', 'database', 'cpu', 'lock', 'rocket',
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export type Cta = { label: string; href: string };

export type HeroCopy = {
  h1: string;
  body: string;
  primary: Cta;
  secondary: Cta;
  /** Optional third action, a text link. */
  tertiary?: Cta;
  tertiaryExternal?: boolean;
};

export type Capability = {
  title: string;
  body: string;
  icon: IconKey;
  /** Governance or security: runs as the full-height band. Applies throughout. */
  band?: boolean;
};

export type HomeContent = {
  profileLine: string;
  selectorLabel: string;
  viewLabels: Record<View, string>;
  hero: Record<View, HeroCopy>;
  capabilitiesHead: { eyebrow: string; heading: string; lede: string };
  capabilities: Record<View, Capability[]>;
  approach: {
    eyebrow: string;
    heading: string;
    intro: string;
    steps: { title: string; body: string }[];
    cta: string;
  };
  work: { eyebrow: string; heading: string; intro: string };
  /** Featured order per view, by Project.id. */
  workOrder: Record<View, string[]>;
  pointOfView: {
    eyebrow: string;
    heading: string;
    principles: { title: string; body: string }[];
  };
  about: { eyebrow: string; heading: string; closingLabel: string };
  toolkit: { group: string; items: string[] }[];
  experience: { eyebrow: string; heading: string; cta: string };
};

export type ContactPageContent = {
  heading: string;
  intro: string;
  topics: Record<ContactIntent, string>;
};

export type SeoCopy = { title: string; description: string };

export type SiteCopy = {
  footer: {
    name?: string;
    descriptor: string;
    line: string;
    location: string;
    availability: string;
    copyright: string;
  };
  privacy: {
    eyebrow: string;
    title: string;
    intro: string;
    /** `{email}` in a paragraph renders as the mailto link. */
    sections: { id: string; title: string; paragraphs: string[] }[];
  };
  notFound: { eyebrow: string; heading: string; body: string; cta: string };
  seo: { home: SeoCopy; contact: SeoCopy; privacy: SeoCopy };
};

export type Project = {
  id: string;          // Stable identity — never changes, unlike slug
  slug: string;
  title: string;
  tagline: string;
  description: string; // Markdown
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;          // Optional — falls back to a placeholder when absent
  featured: boolean;
  order: number;
  // Added by the content-spec migration. All optional so legacy content stays valid.
  category?: ProjectCategory;
  relationship?: ProjectRelationship;
  status?: string;                // Short label, e.g. "In Development"
  visibility?: Visibility;        // Absent means 'public'
  externalUrl?: string;           // Verified destination only
  caseStudy?: CaseStudy;
  images?: ProjectImage[];        // Ordered; legacy `image` keeps rendering
  /** Card button. When `href` is set the button goes there instead of the case study. */
  cardCta?: { label: string; href?: string };
  cardSecondaryCta?: { label: string; href: string };
};

export type AboutContent = {
  name: string;
  credentials?: string;    // e.g. "MBA, MS, PMP"; shown under the name in the hero
  title: string;           // e.g. "Software Engineer"
  heroTagline: string;     // Subtitle paragraph shown in hero
  availableForWork: boolean;
  photo?: string;          // Path to profile photo, e.g. /profile.png
  resumeUrl?: string;      // Path to a downloadable résumé PDF, e.g. /resume.pdf
  bio: string[];           // Array of paragraph strings
  skills: string[];
};

export type ContactContent = {
  email: string;
  githubUrl: string;
  linkedinUrl: string;
};

export type ExperienceItem = {
  id: string;          // Stable identity, like Project.id
  role: string;        // e.g. "Full-Stack Engineer"
  company: string;     // e.g. "NightPivot"
  start: string;       // e.g. "2023"
  end: string;         // e.g. "2025" — empty string means "Present"
  description: string; // Short paragraph about the role
  order: number;
  visibility?: Visibility; // Absent means 'public'
};

export type SiteContent = {
  projects: Project[];
  about: AboutContent;
  contact: ContactContent;
  experience: ExperienceItem[];
  home?: HomeContent;
  site?: SiteCopy;
  contactPage?: ContactPageContent;
};

/** SiteContent after defaults are applied: what getSiteContent() returns. */
export type ResolvedSiteContent = SiteContent & {
  home: HomeContent;
  site: SiteCopy;
  contactPage: ContactPageContent;
};
