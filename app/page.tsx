export const dynamic = 'force-dynamic';

import Hero from "@/components/hero";
import Projects from "@/components/projects";
import About from "@/components/about";
import Experience from "@/components/experience";
import Contact from "@/components/contact";

export default function Home() {
  return (
    <main id="main-content">
      <Hero />
      <Projects />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
