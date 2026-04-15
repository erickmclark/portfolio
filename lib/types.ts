export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string; // Markdown
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string;
  featured: boolean;
  order: number;
};

export type AboutContent = {
  name: string;
  title: string;           // e.g. "Software Engineer"
  heroTagline: string;     // Subtitle paragraph shown in hero
  availableForWork: boolean;
  photo?: string;          // Path to profile photo, e.g. /profile.png
  bio: string[];           // Array of paragraph strings
  skills: string[];
};

export type ContactContent = {
  email: string;
  githubUrl: string;
  linkedinUrl: string;
};

export type SiteContent = {
  projects: Project[];
  about: AboutContent;
  contact: ContactContent;
};
