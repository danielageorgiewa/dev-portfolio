// CV copy, English. Word for word from Figma (CV mode 51:10, phone 83:56, A4 51:106).
// Do not rewrite, shorten or "improve" anything here; ask Daniela if something has to change.
// After any change, regenerate the PDFs: npm run cv:pdf (see scripts/README-cv-pdfs.md).
import type { CvContent } from './cv';

export const cv: CvContent = {
  download: {
    note: 'This is the short version of the portfolio. Same facts, one page.',
    current: 'Download PDF',
    other: 'PDF на български',
  },
  name: 'Daniela Georgieva',
  title: 'Full stack DevOps engineer',
  location: 'Plovdiv, Bulgaria',
  links: { github: 'GitHub', linkedin: 'LinkedIn' },
  profile: {
    label: 'Profile',
    text: 'Full stack DevOps engineer who takes products from the first design to production and keeps them running there. I create brand identities and build websites, online shops and internal systems that drive sales for small businesses. I’m proactive and I learn fast: in four months at XTRMND I went from learning the codebase to owning projects and leading their presentations to shareholders in plain language, and the stock system I took over was in production by my second month. I’m as good in a team as on my own. People say I’m patient and clear to work with, and I hit deadlines either way. I plan to be the best in this field, so I look at every problem from all sides until the work is right.',
  },
  experience: {
    label: 'Experience',
    jobs: [
      {
        title: 'Full stack DevOps engineer',
        place: 'XTRMND · Plovdiv',
        dates: 'Jul 2026 – present',
        bullets: [
          'Warehouse management system for a rooflight manufacturer, in production since August 2026. I took over the build and moved the business off a shared spreadsheet: five sales channels now share one stock count, and sales that took stock from the wrong product went from 47 to 0.',
          'I release and run it myself on a Linux server: Docker Compose, PostgreSQL with nightly backups, Caddy, and GitHub Actions deploying to staging and production with health checks and a one-step rollback. I shipped six releases between 6 and 19 November 2026.',
          'B2B trade portal, live for trade customers. On 22 October 2026 I moved its stock onto the new system in production with a backup, a guarded SQL transaction and a rollback plan. The switch had 0 stock mismatches.',
          'Language school website and brand identity, designed, built and hosted by me, with a CMS the staff edit themselves. The Google speed score went from 31 to 100 on desktop and from 54 to 95 on mobile.',
          'One platform for nine WordPress and Shopify shops, so a fix or a price change happens once and every product size gets its own page on Google.',
        ],
      },
    ],
  },
  skills: {
    label: 'Skills',
    groups: [
      {
        name: 'Frontend',
        items: 'TypeScript, JavaScript, React, Next.js (framework), Tailwind CSS, HTML and CSS, responsive web design',
      },
      {
        name: 'Backend and data',
        items: 'Node.js, Medusa (framework), Payload CMS, PostgreSQL, SQL, REST APIs, webhooks, API integrations',
      },
      {
        name: 'DevOps and Linux',
        items:
          'Production releases and rollbacks, Docker and Compose, CI/CD with GitHub Actions, Turborepo and pnpm workspaces, Linux VPS setup, Nginx, Caddy, Bash and shell scripting, Python',
      },
      {
        name: 'Networking',
        items:
          'TCP/IP and the OSI model, subnets and CIDR, ports and firewalls, NAT and port forwarding, HTTP/HTTPS, CDN and caching, DNS and Cloudflare, SSH keys and tunnels, Cloudflare Tunnel, Let’s Encrypt and ACME, dig, nslookup, curl, openssl, ss, netstat and lsof',
      },
      {
        name: 'Security',
        items:
          'OWASP Top 10, MITRE ATT&CK, server hardening, security headers and CSP, TLS and certificates, secrets management, dependency scanning, SIEM, tcpdump, web exploitation, Linux privilege escalation',
      },
      {
        name: 'Design',
        items: 'Brand identity, Figma, UI design, UX, responsive design, design-to-code',
      },
      {
        name: 'Testing',
        items: 'Playwright, Vitest, Lighthouse CI, accessibility checks (axe)',
      },
      {
        name: 'Ways of working',
        // Not in the A4 PDF (Daniela, Nov 2026): makes room for the longer Women4Cyber line.
        screenOnly: true,
        items: 'Leadership, stakeholder relations, agentic workflows, Git and code review',
      },
    ],
  },
  education: {
    label: 'Education',
    items: [{ title: 'BSc Computer Science (Hons)', place: 'University of Essex', dates: 'Expected 2030' }],
  },
  training: {
    label: 'Training',
    items: [{ title: 'Cloud & DevOps programme', place: 'EPAM · Linux, Bash, Python, Docker, AWS, Kubernetes' }],
  },
  educationAndTraining: { label: 'Education and training' },
  languages: {
    label: 'Languages',
    text: 'Bulgarian (native) · English (C2, Cambridge CPE) · French (A2)',
  },
  volunteering: {
    label: 'Security and volunteering',
    items: [
      'CTF player. One of the winners of TryHackMe’s Women in Cyber campaign.',
      'Women4Cyber volunteer. For the nationwide school visits that teach children about cybersecurity, I took on project management on my own initiative, was the regional lead for Plovdiv, and designed and built the presentation as a web app for grades 1 to 4.',
    ],
  },
};
