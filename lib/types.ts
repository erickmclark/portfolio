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
};

export type SiteContent = {
  projects: Project[];
  about: AboutContent;
  contact: ContactContent;
  experience: ExperienceItem[];
};
