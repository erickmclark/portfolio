export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string; // Markdown
  tech: string[];
  githubUrl?: string;
  liveUrl?: string;
  image: string; // Path relative to /public, e.g. "/projects/my-project.png"
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    tagline: "A short description of what this project does.",
    description: `
## Overview

Project One is a web application that solves a specific problem. Built with modern tooling and shipped to production.

## Key Features

- Feature A: brief explanation
- Feature B: brief explanation
- Feature C: brief explanation

## Challenges

Describe the interesting technical challenges you solved here.
    `.trim(),
    tech: ["Next.js", "TypeScript", "Postgres", "Tailwind CSS"],
    githubUrl: "https://github.com/yourusername/project-one",
    liveUrl: "https://project-one.vercel.app",
    image: "/projects/project-one.png",
    featured: true,
  },
  {
    slug: "project-two",
    title: "Project Two",
    tagline: "Another project with a memorable one-liner.",
    description: `
## Overview

Project Two is a CLI tool / API / library that does something useful.

## Key Features

- Feature A
- Feature B

## What I Learned

Reflection on what this project taught you.
    `.trim(),
    tech: ["Python", "FastAPI", "Docker"],
    githubUrl: "https://github.com/yourusername/project-two",
    image: "/projects/project-two.png",
    featured: true,
  },
  {
    slug: "project-three",
    title: "Project Three",
    tagline: "A utility or side project worth showing off.",
    description: `
## Overview

Project Three is a smaller project or experiment.
    `.trim(),
    tech: ["Go", "Redis"],
    githubUrl: "https://github.com/yourusername/project-three",
    image: "/projects/project-three.png",
    featured: false,
  },
];
