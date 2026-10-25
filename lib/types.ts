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
};

export type AboutContent = {
  name: string;
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
};
