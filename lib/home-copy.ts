import type { View } from './home-view';

/**
 * In-code homepage copy (content spec v1.1, section 16.5). Verbatim from the spec.
 * Eventual destinations live here so T-10 can switch them in one place.
 */
export const CONTACT_HREFS = {
  leadership: '#contact', // eventual: /contact?type=leadership
  advisory: '#contact', // eventual: /contact?type=advisory
  build: '#contact', // eventual: /contact?type=build
  speaking: '#contact', // eventual: /contact?type=speaking
  general: '#contact',
} as const;

export const CLARK_STRATEGICS_URL = 'https://clarkstrategics.com';

export const PROFILE_LINE =
  'Former JPMorgan Chase Vice President & Chief of Staff · Founder · AI Product Builder';
export const SELECTOR_LABEL = 'Explore my work as a';

type Cta = { label: string; href: string };
type HeroCopy = {
  h1: string;
  body: string;
  primary: Cta;
  secondary: Cta;
  /** Optional third action, a text link. */
  tertiary?: Cta;
  tertiaryExternal?: boolean;
};

export const HERO: Record<View, HeroCopy> = {
  it: {
    h1: 'I turn enterprise technology priorities into decisions, delivery, and results.',
    body: "I'm a former JPMorgan Chase Vice President and Chief of Staff with more than 15 years of experience across technology strategy, enterprise transformation, portfolio governance, and business operations. I also design and build AI-powered products, giving me direct experience connecting executive decisions to technical execution.",
    primary: { label: 'Explore My Work', href: '#work' },
    secondary: { label: 'Download Résumé', href: 'resume' },
    tertiary: { label: 'Discuss an Opportunity', href: CONTACT_HREFS.leadership },
  },
  consultant: {
    h1: 'I help organizations turn complex business problems into practical technology solutions.',
    body: "I work across business strategy, operations, AI, and technology to understand what's slowing an organization down, identify opportunities, and define a realistic path forward. My approach combines executive-level planning with hands-on delivery experience, so recommendations account for what it actually takes to implement them.",
    primary: { label: 'Discuss Your Business Challenge', href: CONTACT_HREFS.advisory },
    secondary: { label: 'See Consulting Work', href: '#work' },
    tertiary: { label: 'Explore Clark Strategics', href: CLARK_STRATEGICS_URL },
    tertiaryExternal: true,
  },
  builder: {
    h1: 'I turn ideas into working software that solves real problems.',
    body: 'I design and develop AI-powered applications, business platforms, and automation systems. My work spans product strategy, architecture, databases, integrations, AI workflows, testing, and deployment. I use AI-assisted engineering with defined quality and security controls while retaining human judgment over important decisions.',
    primary: { label: "Explore What I've Built", href: '#work' },
    secondary: { label: 'Discuss a Build', href: CONTACT_HREFS.build },
  },
};

export const CAPABILITIES_HEAD = {
  eyebrow: 'Capabilities',
  heading: 'Different roles. A connected set of capabilities.',
  lede: 'My experience spans the decisions that shape technology, the operating systems that deliver it, and the products that make it tangible.',
};

export type IconKey =
  | 'compass' | 'shapes' | 'network' | 'gantt' | 'bars' | 'shield' | 'presentation'
  | 'search' | 'workflow' | 'sparkles' | 'route' | 'wrench' | 'users'
  | 'target' | 'layout' | 'code' | 'database' | 'cpu' | 'lock' | 'rocket';

export type Capability = {
  title: string;
  body: string;
  icon: IconKey;
  /** Governance or security: runs as the full-height band. Applies throughout. */
  band?: boolean;
};

export const CAPABILITIES: Record<View, Capability[]> = {
  it: [
    { title: 'Technology Strategy', icon: 'compass', body: 'I translate business priorities into technology objectives, investment decisions, multi-year roadmaps, and measurable outcomes. My experience includes annual strategy cycles and leadership alignment across complex technology organizations.' },
    { title: 'Enterprise Transformation', icon: 'shapes', body: 'I help organizations redesign operating models, clarify product ownership, improve decision rights, and manage the changes required to make transformation sustainable.' },
    { title: 'AI Strategy', icon: 'network', body: 'I identify and prioritize AI opportunities based on business value, feasibility, cost, adoption requirements, and risk. My experience spans enterprise AI planning and independent product development.' },
    { title: 'Portfolio & Investment Governance', icon: 'gantt', body: 'I establish planning, prioritization, dependencies, reporting, and decision processes that help organizations deliver important initiatives.' },
    { title: 'Technology Business Operations', icon: 'bars', body: 'I connect strategy to financial planning, workforce capacity, vendor management, resource allocation, operating reviews, and performance management.' },
    { title: 'AI Governance', icon: 'shield', band: true, body: 'I apply governance principles to AI systems, including risk assessment, accountability, data protection, human oversight, evaluation, and monitoring. My product work provides practical implementation experience.' },
    { title: 'Executive Leadership & Reporting', icon: 'presentation', body: 'I work across technology, finance, risk, operations, and senior leadership to communicate tradeoffs, resolve competing priorities, and translate complex issues into clear decisions.' },
  ],
  consultant: [
    { title: 'Business Discovery', icon: 'search', body: 'I examine how an organization operates, where work gets delayed, and what problems actually need solving before recommending technology.' },
    { title: 'Process Redesign', icon: 'workflow', body: 'I simplify manual workflows, reduce unnecessary handoffs, and identify opportunities for automation and better information flow.' },
    { title: 'AI Opportunity Assessment', icon: 'sparkles', body: 'I identify where AI could improve productivity, decision support, customer experience, and operations while considering data readiness, costs, and risks.' },
    { title: 'Strategy & Roadmapping', icon: 'route', body: 'I help leaders define the desired outcome, evaluate alternatives, prioritize investments, and create an achievable implementation roadmap.' },
    { title: 'Risk & Governance', icon: 'shield', band: true, body: 'I help organizations think through AI controls, privacy, accountability, human approval, security requirements, and operational risk.' },
    { title: 'Implementation Advisory', icon: 'wrench', body: 'I connect recommendations to execution through requirements, solution planning, technical coordination, delivery oversight, and hands-on implementation where appropriate.' },
    { title: 'Adoption & Enablement', icon: 'users', body: 'I help teams understand tools, adapt workflows, establish ownership, and develop skills to operate and improve solutions after launch.' },
  ],
  builder: [
    { title: 'Product Strategy', icon: 'target', body: 'I translate business problems into product requirements, user journeys, priorities, and incremental releases.' },
    { title: 'UX & Product Design', icon: 'layout', body: 'I shape user journeys, interface structure, and administrative workflows so products are clear to use, then refine them with feedback before and after release.' },
    { title: 'Web & App Development', icon: 'code', body: 'I develop web applications and business platforms with user authentication, databases, interfaces, integrations, and administrative workflows.' },
    { title: 'Data & Integrations', icon: 'database', body: 'I design data models and connect applications to APIs, external services, business processes, and information sources.' },
    { title: 'AI Engineering & Automation', icon: 'cpu', body: 'I build AI-powered features using language models, retrieval, specialized agents, structured workflows, and human review.' },
    { title: 'Security & Quality', icon: 'lock', band: true, body: 'I incorporate access controls, data boundaries, validation, testing, auditability, and risk-based approval into software delivery.' },
    { title: 'Deployment & Improvement', icon: 'rocket', body: 'I take applications through testing and deployment, then use monitoring, feedback, and operational evidence to guide improvements.' },
  ],
};

export const APPROACH = {
  eyebrow: 'How I Work',
  heading: 'From understanding the problem to delivering the outcome.',
  intro: 'The technology is never the starting point. The business problem is.',
  steps: [
    { n: '01', title: 'Understand the problem', body: 'I start by learning the business, its users, workflows, constraints, costs, and current challenges. I distinguish the original request from the underlying problem and identify what success should look like.' },
    { n: '02', title: 'Define the right approach', body: 'I evaluate possible solutions, challenge assumptions, prioritize opportunities, and establish requirements, ownership, risks, dependencies, and measures of success.' },
    { n: '03', title: 'Deliver, measure, and improve', body: 'I connect the plan to implementation. Depending on the engagement, that may mean leading an enterprise initiative, advising a delivery team, or personally developing a product. I focus on adoption, reliability, and evidence of business value.' },
  ],
  cta: 'See the Work',
};

export const WORK = {
  eyebrow: 'Selected Work',
  heading: 'Experience that connects strategy to execution.',
  intro: 'My work includes enterprise technology leadership, paid client delivery, and independent software products. Each demonstrates a different part of how I frame problems, make decisions, and deliver outcomes.',
};

/** Card CTA by stable Project.id (spec section 6). */
export const WORK_CTA: Record<string, string> = {
  'prj-jpmc-legal-tech': 'View Leadership Case Study',
  'prj-ai-engineering-factory': 'Explore the Factory',
  'prj-authmatch': 'Explore AuthMatch AI',
  'prj-prepera': 'Explore Prepera',
  'prj-sanctionswatch': 'View Monitoring Workflow',
  'prj-regulatory-intelligence': 'Explore the MVP',
  'prj-gen4me': 'Explore Gen4Me',
};
export const WORK_CTA_DEFAULT = 'View case study';
/** Projects whose CTA goes to the contact section until a case study is the right destination. */
export const WORK_CTA_CONTACT: Record<string, { label: string; href: string }> = {
  'prj-ai-governance-platform': { label: 'Request an Overview', href: '#contact' },
};
export const FACTORY_SECOND_CTA = { label: 'Discuss AI-assisted engineering', href: CONTACT_HREFS.advisory };

export const POV = {
  eyebrow: 'Point of View',
  heading: 'Technology only counts when it ships, holds up under scrutiny, and leaves people more capable.',
  principles: [
    { title: 'Business outcomes before technology', body: 'I believe every technology initiative should begin with a clearly defined problem, an accountable owner, and a way to determine whether the investment was worthwhile.' },
    { title: 'Governance belongs in delivery', body: 'Security, risk, data protection, and human accountability should influence how a solution is designed and implemented, not become a final checklist before launch.' },
    { title: 'Execution proves the strategy', body: 'A compelling presentation is not a business outcome. The real test is whether people adopt the solution, operations improve, and the organization can sustain the result.' },
  ],
};

export const ABOUT = {
  eyebrow: 'About Erick',
  heading: 'From enterprise leadership to hands-on AI product development.',
  closingLabel: 'Closing statement',
};

/** Technical toolkit (spec section 8). Not part of the admin content model. */
export const TOOLKIT: { group: string; items: string[] }[] = [
  { group: 'AI', items: ['Claude / OpenAI APIs', 'AWS Bedrock', 'retrieval-augmented generation', 'agents', 'MCP', 'LangChain'] },
  { group: 'Applications', items: ['React', 'Next.js', 'TypeScript/JavaScript', 'Python', 'Node.js', 'API development'] },
  { group: 'Cloud', items: ['AWS ECS/Fargate', 'S3', 'IAM', 'Vercel'] },
  { group: 'Data & automation', items: ['PostgreSQL', 'Supabase', 'pgvector', 'n8n', 'Apify'] },
  { group: 'Engineering delivery', items: ['Claude Code', 'GitHub', 'CI/CD', 'automated tests', 'Playwright', 'independent reviews'] },
  { group: 'Enterprise leadership', items: ['Jira', 'Confluence', 'Excel', 'Power BI', 'Agile/Scrum', 'portfolio governance', 'financial and workforce planning'] },
];

export const EXPERIENCE = {
  eyebrow: 'Experience',
  heading: 'Enterprise leadership, grounded in delivery.',
  cta: 'Download Full Résumé',
};

export const CONTACT = {
  heading: "Let's talk about what you're working on.",
  intro: "Whether you're hiring a technology leader, exploring a business challenge, or looking to build a product, tell me what you need. I'll use the details to understand the request and determine the next step.",
};

export const FOOTER = {
  name: 'Erick Clark',
  descriptor: 'Technology Strategy & AI Transformation Executive',
  line: 'Enterprise leadership. Practical consulting. Working AI products.',
  location: 'Houston, Texas',
  availability: 'Open to senior technology leadership opportunities and select strategic advisory engagements.',
  copyright: '© 2026 Erick Clark.',
};

export const HOME_SEO = {
  title: 'Erick Clark | Technology Strategy & AI Transformation Executive',
  description:
    'Former JPMorgan Chase VP and Chief of Staff specializing in technology strategy, enterprise transformation, AI strategy, governance, and AI product development.',
};
