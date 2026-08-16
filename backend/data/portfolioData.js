// Sathish Chakali's portfolio content, mirrored from the portfolio repo's
// src/data.js so the backend can build chat context without depending on
// that separate repo at runtime.
export const PORTFOLIO_DATA = {
  meta: {
    name: "Sathish Chakali",
    role: "Full Stack Developer",
    email: "sathishchakali1023@gmail.com",
    location: "Hyderabad, India",
    github: "https://github.com/sathish3201",
    linkedin: "https://linkedin.com/in/sathish-chakali-91221b320",
  },

  summary:
    "Full stack developer with 1.6+ years of experience at Accenture and a track record of independently building and deploying complete projects — React on the frontend, and Node.js, REST APIs, and MongoDB on the backend. Shipped a full MERN-stack SaaS mock interview platform with JWT authentication and live LLM-based grading, alongside an Oracle ETL data warehouse pipeline, a documented SQL performance tuning case study, and an n8n + LLM incident-triage automation.",

  experience: [
    {
      role: "Package Development Associate, Oracle Development & Support",
      company: "Accenture",
      period: "Oct 2024 — Present",
      summary:
        "Monitors enterprise data warehouse batch jobs and ETL schedules, develops and debugs Oracle PL/SQL packages/procedures/functions/triggers, tunes SQL performance with Optimizer Hints and DBMS_STATS, resolves data-load failures via PuTTY/WinSCP, and triages production support tickets within SLA as part of a 3-member hybrid support pod.",
      tech: ["Oracle PL/SQL", "SQL Developer", "DBMS_STATS", "PuTTY", "WinSCP", "Unix/Linux"],
    },
  ],

  projects: [
    {
      title: "Oracle ETL Warehouse Pipeline",
      description:
        "A star-schema Oracle data warehouse with a PL/SQL package that loads staging data into dimension and fact tables, with per-row exception handling, error logging, and batch-run tracking.",
      tech: ["Oracle PL/SQL", "ETL", "Data Warehousing", "SQL"],
      github: "https://github.com/sathish3201/etl-warehouse-pipeline",
    },
    {
      title: "SQL Performance Tuning Case Study",
      description:
        "A documented before/after tuning exercise on a 2M-row Oracle table: DBMS_STATS, a targeted composite index, and Optimizer Hints, with EXPLAIN PLAN evidence for both states.",
      tech: ["Oracle SQL", "DBMS_STATS", "Optimizer Hints", "EXPLAIN PLAN"],
      github: "https://github.com/sathish3201/sql-performance-tuning-case-study",
    },
    {
      title: "ETL Incident Triage Automation",
      description:
        "An n8n workflow that classifies ETL job failures using Claude and drafts ready-to-paste incident tickets, automating the manual triage step in production data support.",
      tech: ["n8n", "Claude/LLM", "Workflow Automation"],
      github: "https://github.com/sathish3201/etl-incident-triage-automation",
    },
    {
      title: "MockGenius AI — SaaS Mock Interview Platform",
      description:
        "An AI-powered SaaS application that simulates technical mock interviews, with JWT authentication, AI-generated interview questions, speech-to-text response submission, instant LLM-based grading with detailed feedback, and a dashboard with score progression analytics.",
      tech: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Groq/Llama API"],
      github: "https://github.com/sathish3201/mockgenius-ai",
    },
    {
      title: "Nexoria Technologies — Business Website",
      description:
        "A full-stack marketing website for an IT services business, with a React frontend and Node/Express backend serving services, pricing, and portfolio content, a working contact form with email notifications, and a lightweight built-in FAQ chatbot.",
      tech: ["React", "Node.js", "Express", "Vite"],
      github: "https://github.com/sathish3201/nexoria-website",
    },
    {
      title: "E-Commerce Storefront Demo",
      description:
        "A working storefront demo with product catalog, cart, Razorpay test-mode checkout with server-side payment signature verification, an admin dashboard for inventory and orders, and a built-in FAQ chatbot.",
      tech: ["React", "Node.js", "Express", "Razorpay"],
      github: "https://github.com/sathish3201/nexoria-website",
    },
    {
      title: "Object Design Field Guide",
      description:
        "A reference doc covering OOP fundamentals, all five SOLID principles, and six core design patterns, each shown before and after, with UML diagrams and working code in Python, Java, C#, and React.",
      tech: ["OOP", "SOLID", "Design Patterns", "UML"],
      github: "",
    },
  ],

  skills: [
    {
      category: "PL/SQL & Database",
      items: ["Oracle PL/SQL", "Packages, Procedures, Functions, Triggers", "SQL Performance Tuning", "Optimizer Hints", "DBMS_STATS"],
    },
    {
      category: "ETL & Data Warehousing",
      items: ["ETL Design & Support", "Data Warehousing", "Batch Job Scheduling", "ABEND Resolution", "Data Quality, Cleansing & Validation"],
    },
    {
      category: "Tools & Support",
      items: ["SQL Developer", "VS Code", "PuTTY", "WinSCP", "Unix/Linux", "Incident & Ticket Management"],
    },
    {
      category: "Emerging Skills",
      items: ["AI-Assisted Workflow Automation", "n8n", "Claude/LLM Integration", "Agile/Hybrid Collaboration"],
    },
  ],

  education: [
    { degree: "B.Tech, Computer Engineering — CGPA: 8.5/10", school: "CMR Engineering College, Hyderabad" },
    { degree: "Intermediate (XII)", school: "Sandeepani Junior College, Kamareddy", period: "2019" },
    { degree: "SSC (X) — CGPA: 9.3", school: "Zilla Parishad High School, Kondapoor, Kamareddy", period: "2017" },
  ],

  certifications: [
    { name: "Java Full Stack Certification", issuer: "Wipro TalentNext", year: "2023" },
    { name: "AI/ML Virtual Internship Certificate", year: "2023" },
    { name: "Smart Coder Certification — Global Rank 1402/22591", issuer: "Smart Interviews", year: "2022" },
    { name: "HTML Attributes & Tags", issuer: "GL Academy", year: "2022" },
  ],

  faq: [
    {
      question: "Are you available for freelance work or hiring?",
      answer:
        "Sathish is currently working full-time at Accenture but is open to freelance/collaboration opportunities and new roles — best way to reach out is via email or LinkedIn.",
    },
    {
      question: "How do I contact you?",
      answer: `You can reach Sathish at ${"sathishchakali1023@gmail.com"} or on LinkedIn: https://linkedin.com/in/sathish-chakali-91221b320`,
    },
    {
      question: "Where can I see your code?",
      answer: "All of Sathish's project source code is on GitHub: https://github.com/sathish3201",
    },
  ],
};
