// Local fallback content — used if the backend API isn't running,
// so the site is still browsable during frontend-only development.
export const fallbackServices = [
  {
    id: "web-development",
    title: "Website Development",
    summary: "Fast, responsive, SEO-friendly websites built with modern frameworks.",
    details:
      "From marketing sites to content-heavy portals, we design and build websites that load fast, rank well, and are easy for your team to maintain.",
    highlights: ["Responsive design", "SEO fundamentals", "CMS integration", "Performance optimization"],
  },
  {
    id: "full-stack-development",
    title: "Full-Stack Development",
    summary: "End-to-end web applications — frontend, backend, database, and deployment.",
    details:
      "We design and build complete web applications using React, Node.js, and modern databases, handling everything from architecture to deployment and monitoring.",
    highlights: ["React / Node.js", "REST & GraphQL APIs", "Database design", "Cloud deployment"],
  },
  {
    id: "app-development",
    title: "App Development",
    summary: "Cross-platform mobile and desktop apps that feel native.",
    details:
      "We build iOS, Android, and cross-platform applications with a shared codebase where it makes sense, prioritizing performance and a clean user experience.",
    highlights: ["iOS & Android", "Cross-platform (React Native)", "App store deployment", "Push notifications & auth"],
  },
  {
    id: "it-services",
    title: "IT Services & Consulting",
    summary: "Ongoing technical support, infrastructure, and strategy for growing teams.",
    details:
      "Cloud setup, DevOps, system integrations, and technical advisory so your team can focus on the business instead of infrastructure fires.",
    highlights: ["Cloud infrastructure", "DevOps & CI/CD", "System integration", "Technical advisory"],
  },
  {
    id: "data-pipelines",
    title: "Data Pipeline Engineering",
    summary: "Reliable ETL/ELT pipelines that move and transform your data automatically.",
    details:
      "We design pipelines that extract data from your sources, clean and transform it, and load it where your team needs it — on a schedule you can trust.",
    highlights: ["ETL / ELT design", "Workflow orchestration", "Data warehousing", "Automated scheduling"],
  },
  {
    id: "data-analytics",
    title: "Data Analysis & BI",
    summary: "Turn raw data into dashboards and insights your team can act on.",
    details:
      "From exploratory analysis to production dashboards, we help you understand what your data is telling you and track the metrics that matter.",
    highlights: ["Dashboards & reporting", "Exploratory analysis", "KPI tracking", "Data visualization"],
  },
];

export const fallbackPricing = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "From $1,500",
    cadence: "one-time",
    bestFor: "Small businesses that need a professional web presence.",
    features: [
      "Up to 5-page responsive website",
      "Basic SEO setup",
      "Contact form integration",
      "2 rounds of revisions",
      "2 weeks delivery",
    ],
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    priceLabel: "From $5,000",
    cadence: "project-based",
    bestFor: "Businesses that need a full-stack web or mobile application.",
    features: [
      "Custom full-stack application",
      "Database & API design",
      "Admin dashboard",
      "Cloud deployment & CI/CD",
      "4 weeks delivery + 30 days support",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise / Data",
    priceLabel: "Custom quote",
    cadence: "retainer or project",
    bestFor: "Organizations that need data pipelines, analytics, or ongoing IT support.",
    features: [
      "Data pipeline design & orchestration",
      "Analytics dashboards & reporting",
      "Ongoing IT support & DevOps",
      "Dedicated point of contact",
      "SLA-backed support",
    ],
    highlighted: false,
  },
];

export const fallbackPortfolio = [
  {
    id: "sample-01",
    title: "E-Commerce Storefront (Concept)",
    category: "Full-Stack Development",
    description:
      "Sample concept build: a React + Node storefront with cart, checkout, and an admin dashboard for inventory management.",
    tags: ["React", "Node.js", "PostgreSQL", "Stripe"],
    status: "Concept / template — replace with real client work as projects ship.",
  },
  {
    id: "sample-02",
    title: "Field Service Mobile App (Concept)",
    category: "App Development",
    description:
      "Sample concept build: a React Native app for field technicians to log jobs offline and sync when back online.",
    tags: ["React Native", "Offline sync", "REST API"],
    status: "Concept / template — replace with real client work as projects ship.",
  },
  {
    id: "sample-03",
    title: "Sales Data Pipeline & Dashboard (Concept)",
    category: "Data Engineering & Analytics",
    description:
      "Sample concept build: an automated ETL pipeline pulling from CRM and billing systems into a warehouse, feeding a BI dashboard.",
    tags: ["Python", "ETL", "Data Warehouse", "BI Dashboard"],
    status: "Concept / template — replace with real client work as projects ship.",
  },
];

export const fallbackBlog = [
  {
    id: "choosing-a-tech-stack",
    title: "How to Choose a Tech Stack for Your Startup MVP",
    excerpt: "A practical framework for picking a stack that lets you ship fast without boxing you in later.",
    date: "2026-07-01",
    author: "EKADHANTHA Technologies",
    tags: ["Full-Stack", "Startups"],
  },
  {
    id: "etl-vs-elt",
    title: "ETL vs. ELT: Which Data Pipeline Pattern Fits Your Team?",
    excerpt: "The tradeoffs between transforming data before vs. after loading it into your warehouse.",
    date: "2026-06-15",
    author: "EKADHANTHA Technologies",
    tags: ["Data Engineering"],
  },
  {
    id: "react-native-vs-native",
    title: "React Native vs. Native: What Actually Matters for Your App",
    excerpt: "A grounded look at when cross-platform makes sense and when it doesn't.",
    date: "2026-05-20",
    author: "EKADHANTHA Technologies",
    tags: ["App Development"],
  },
];
