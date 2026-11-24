// Home page copy, English. Word for word from Figma (Home · Desktop 1440, node 31:51).
// Do not rewrite, shorten or "improve" anything here; ask Daniela if something has to change.
import type { CaseSlug } from '../i18n';

export interface ProjectCard {
  slug: CaseSlug;
  theme: 'sky' | 'ea' | 'sis';
  index: string;
  client: string;
  /** Phone frame (56:120) only: shorter client line. Falls back to `client`. */
  clientPhone?: string;
  /** Phone frame only: a line under the title (the phone card has no body text). */
  notePhone?: string;
  kind: string;
  /** Title. Wrap the italic tail in <em> where Figma sets one. */
  title: string;
  body: string;
  numbers: { value: string; label: string }[];
  chips: string[];
  shotAlt: string;
}

export interface HomeContent {
  meta: { title: string; description: string };
  hero: {
    kicker: string;
    /** Phone frame (56:82) only: shorter kicker. Falls back to `kicker`. */
    kickerPhone?: string;
    firstName: string;
    lastName: string;
    tagline: string;
    start: string;
    projects: string;
    cv: string;
    meta: string[];
    /** Phone frame only: shorter meta row, set on one line. Falls back to `meta`. */
    metaPhone?: string[];
    scroll: string;
    portraitAlt: string;
  };
  about: {
    eyebrow: string;
    /** The statement: `lead` is ink, `rest` starts faint and fills in on scroll. */
    lead: string;
    rest: string;
    bio: string[];
    /** Phone frame (56:103) only: the bio as drawn on phone. Falls back to `bio`. */
    bioPhone?: string[];
    info: { label: string; value: string }[];
  };
  work: {
    titleItalic: string;
    titleRest: string;
    /** 'italic-first' renders "<em>Selected</em> work"; 'italic-last' renders "Избрани <em>проекти</em>". */
    titleOrder: 'italic-first' | 'italic-last';
    count: string;
    cards: ProjectCard[];
    link: string;
    footnote: string;
  };
  manifesto: {
    eyebrow: string;
    word: string;
    sizeLabel: string;
    /** Phone frame (148:43) only: the word measures 343 × 62 there. Falls back to `sizeLabel`. */
    sizeLabelPhone?: string;
    offLabel: string;
    lineBefore: string;
    lineAccent: string;
    lineAfter: string;
  };
  toolbox: {
    eyebrow: string;
    title: string;
    aside: string;
    marquee: [string[], string[]];
    rows: {
      label: string;
      note?: string;
      chips: string[];
      dark?: boolean;
      /** Phone frame (58:78) only: shorter chip labels, keyed by the desktop label. */
      chipsPhone?: Record<string, string>;
    }[];
  };
  beyond: {
    titleBefore: string;
    titleItalic: string;
    ctf: {
      eyebrow: string;
      prompt: string;
      hint: string;
      title: string;
      body: string;
    };
  };
  contact: {
    status: string;
    headline: string;
    headlineItalic: string;
    intro: string;
    book: string;
    fallback: string;
    emailCta: string;
    noSlots: string;
    /** `emailPhone`: the phone frame (58:205) labels the email link instead of showing the address. */
    links: { github: string; linkedin: string; emailPhone?: string };
    form: {
      name: string;
      email: string;
      message: string;
      submit: string;
      cancel: string;
      sending: string;
      success: string;
      error: string;
      /** Shown when the chosen slot was booked by someone else in the meantime. */
      taken: string;
    };
  };
  /** `leftPhone`: phone frame (58:241) only. Falls back to `left`. */
  footer: { left: string; leftPhone?: string; right: string };
}

export const home: HomeContent = {
  meta: {
    title: 'Daniela Georgieva · Full stack DevOps engineer',
    description:
      'Ambitious ideas, built end to end, from the first sketch to something people use every day.',
  },
  hero: {
    kicker: 'Full stack DevOps engineer · Plovdiv, Bulgaria · UTC+2',
    kickerPhone: 'Full stack DevOps engineer · Plovdiv',
    firstName: 'Daniela',
    lastName: 'Georgieva',
    tagline:
      'Ambitious ideas, built end to end, from the first sketch to something people use every day.',
    start: 'Start a project',
    projects: 'See three projects',
    cv: 'See or download my CV',
    meta: ['FULL STACK & DEVOPS', 'PLOVDIV · UTC+2', 'OPEN TO FREELANCE WORK'],
    metaPhone: ['FULL STACK & DEVOPS', 'UTC+2', 'OPEN TO WORK'],
    scroll: 'SCROLL',
    portraitAlt: 'Portrait of Daniela Georgieva',
  },
  about: {
    eyebrow: 'About',
    lead: 'I give “end to end” a real meaning:',
    rest: 'from the first design to the servers it runs on, I build it all.',
    bio: [
      'I create brand identities and build the websites and systems behind them, and my work drives sales up. I also run what I build in production: I ship the releases and handle live data migrations myself.',
      'People find out fast that I don’t wait to be asked. In four months at XTRMND I went from learning the codebase to owning projects and leading their presentations to shareholders, and the feedback in those rooms has been great. The stock system I took over was in production by my second month. I work as well in a team as I do alone, people tell me I’m patient and kind to work with, and I’m still smiling when things get rough. I plan to be the best in this field.',
      'Based in Plovdiv. Outside work, I’m outdoors or playing video games.',
    ],
    bioPhone: [
      'I create brand identities and build the websites and systems behind them, and my work drives sales up. I also run what I build in production: I ship the releases and handle live data migrations myself.',
      'People find out fast that I don’t wait to be asked. In four months at XTRMND I went from learning the codebase to owning projects and leading their presentations to shareholders, and the feedback in those rooms has been great. The stock system I took over was in production by my second month. I work as well in a team as I do alone, people tell me I’m patient and kind to work with, and I’m still smiling when things get rough. I plan to be the best in this field.',
    ],
    info: [
      { label: 'What I do', value: 'I craft complete solutions for businesses. Brand identity, design, code and infrastructure.' },
      { label: 'Education', value: 'BSc Computer Science (Hons), University of Essex' },
      { label: 'Languages', value: 'Bulgarian, English (C2), French (A2)' },
    ],
  },
  work: {
    titleItalic: 'Selected',
    titleRest: 'work',
    titleOrder: 'italic-first',
    count: '(03)',
    link: 'Read the case study',
    footnote:
      '* Client names are placeholders and client logos are redacted for privacy. Real names on request.',
    cards: [
      {
        slug: 'multi-shop-platform',
        theme: 'sky',
        index: '01',
        client: 'Aperta* · Lightwell* and eight more shops',
        clientPhone: 'Aperta* · Lightwell*',
        kind: 'Online shop platform',
        title: 'One platform, nine shops, a luxury look.',
        body: 'Nine online shops, most of them on WordPress, broke often, went down and loaded slowly, and each needed its own security patching. I’m moving them onto one fast, secure platform with a stronger brand identity and a smoother way to shop. A fix now ships once and reaches every shop.',
        numbers: [{ value: '9 → 1', label: 'shops onto one platform' }],
        chips: ['Medusa', 'Next.js', 'Payload', 'PostgreSQL'],
        shotAlt: 'Homepage of the new online shop, with the client logo redacted',
      },
      {
        slug: 'language-school-website',
        theme: 'ea',
        index: '02',
        client: 'LingvoMost* · Language school',
        kind: 'Website and CMS',
        title: 'Language school website',
        body: 'The school had outgrown its website and had no consistent look. I gave it a brand identity people trust and remember, then designed, built and now host the new site. It loads fast, and the staff edit every page themselves.',
        numbers: [
          { value: '31 → 100', label: 'Google speed score, desktop' },
          { value: '54 → 95', label: 'Google speed score, mobile' },
        ],
        chips: ['Figma', 'Next.js', 'Payload', 'PostgreSQL', 'Docker'],
        shotAlt: 'Homepage of the new language school website, with the client logo redacted',
      },
      {
        slug: 'warehouse-management-system',
        theme: 'sis',
        index: '03',
        client: 'Aperta* · Rooflight manufacturer',
        notePhone: 'In production since August 2026. I ship every release myself.',
        kind: 'Stock and order logistics',
        title: 'Warehouse management system',
        body: 'The business sold through several websites and a trade portal, all running off one shared spreadsheet. Orders slipped through and stock counts drifted. I replaced the spreadsheet with one system that talks to every site directly, so every channel draws from the same stock count and every change is logged. It has run in production since August 2026, and I ship every release myself.',
        numbers: [
          { value: '47 → 0', label: 'sales taking stock off the wrong product' },
          { value: '5', label: 'sales channels on one stock count' },
        ],
        chips: ['TypeScript', 'Node', 'PostgreSQL', 'Next.js', 'Docker'],
        shotAlt: 'Dashboard of the warehouse management system with demo data, client logo redacted',
      },
    ],
  },
  manifesto: {
    eyebrow: 'How I work',
    word: 'Perfectionism',
    sizeLabel: '1323 × 238',
    sizeLabelPhone: '343 × 62',
    offLabel: '0 px off',
    lineBefore: 'Precision in ',
    lineAccent: 'every detail',
    lineAfter: ', for every client.',
  },
  toolbox: {
    eyebrow: 'Toolbox',
    title: 'What I build with',
    aside: 'The stack behind the projects above.',
    marquee: [
      ['Figma', 'TypeScript', 'React', 'Next.js', 'Tailwind', 'Node', 'PostgreSQL', 'Payload'],
      ['Docker', 'Linux', 'GitHub Actions', 'Nginx', 'Medusa', 'Bash', 'Python', 'AWS', 'Kubernetes'],
    ],
    rows: [
      {
        label: 'Linux administration',
        chips: [
          'LVM',
          'Filesystems and mounts',
          'Users and permissions',
          'Virtualisation (UTM)',
          'Linux VPS setup',
          'IT infrastructure management',
          'Bash and shell scripting',
        ],
        chipsPhone: {
          'Bash and shell scripting': 'Bash',
        },
      },
      {
        label: 'Offensive security',
        chips: [
          'OWASP Top 10',
          'MITRE ATT&CK',
          'Kali Linux',
          'Nmap',
          'gobuster',
          'sqlmap',
          'Metasploit',
          'netcat',
          'OSINT',
          'Shodan',
          'Google dorking',
          'WHOIS',
          'crt.sh',
          'Wayback Machine',
          'Web exploitation',
          'Reverse shells and pivoting',
          'Linux and Windows privilege escalation',
          'Active Directory',
          'BloodHound',
          'Kerberoasting',
          'Credential dumping',
          'C2 frameworks',
          'Cobalt Strike',
          'Tuoni',
        ],
      },
      {
        label: 'Defensive security',
        chips: [
          'Microsoft Sentinel and KQL',
          'Wazuh',
          'Security log analysis',
          'Windows security and IIS',
          'tcpdump',
          'Server hardening',
          'Security headers and CSP',
          'TLS and certificates',
          'Secrets management',
          'Dependency scanning',
        ],
      },
      {
        label: 'Networking',
        chips: [
          'Network administration and infrastructure',
          'TCP/IP and the OSI model',
          'Subnets and CIDR',
          'Ports and firewalls',
          'NAT and port forwarding',
          'HTTP/HTTPS',
          'CDN and caching',
          'DNS and Cloudflare',
          'SSH keys and tunnels',
          'Cloudflare Tunnel',
          'Let’s Encrypt and ACME',
          'dig and nslookup',
          'curl and openssl',
          'ss, netstat and lsof',
        ],
      },
      {
        label: 'DevOps',
        chips: [
          'Docker and Compose',
          'CI/CD with GitHub Actions',
          'Turborepo and pnpm workspaces',
          'Nginx',
          'Python',
        ],
        chipsPhone: {
          'Turborepo and pnpm workspaces': 'Turborepo and pnpm',
        },
      },
      {
        label: 'Frontend',
        chips: [
          'TypeScript',
          'JavaScript',
          'React',
          'Next.js (framework)',
          'Tailwind CSS',
          'HTML and CSS',
          'Responsive web design',
        ],
      },
      {
        label: 'Backend & data',
        chips: [
          'Node.js',
          'Medusa (framework)',
          'Payload CMS',
          'PostgreSQL',
          'SQL',
          'REST APIs',
          'Webhooks',
          'API integrations',
        ],
      },
      {
        label: 'Ways of working',
        chips: ['Leadership', 'Stakeholder relations', 'Agentic workflows', 'Git and code review', 'Figma', 'Responsive design', 'Design-to-code'],
      },
      {
        label: 'Learning now',
        note: 'EPAM Cloud & DevOps programme',
        chips: ['AWS', 'Kubernetes'],
        dark: true,
      },
    ],
  },
  beyond: {
    titleBefore: 'Beyond',
    titleItalic: 'code',
    ctf: {
      eyebrow: 'Security',
      prompt: '$ cat portfolio/flag.txt',
      hint: 'psst. there’s one more flag hidden in this page.',
      title: 'CTF player',
      body: 'I play capture the flag challenges to keep my security skills sharp. I was one of the winners of TryHackMe’s Women in Cyber campaign.',
    },
  },
  contact: {
    status: 'Taking on new projects',
    headline: 'Tell me what',
    headlineItalic: 'you’re building.',
    intro:
      'Pick a time for a free 30-minute call. Tell me what you need and I’ll tell you how I’d build it.',
    book: 'Book this time',
    fallback: 'No time that works? Email me and we’ll find one.',
    emailCta: 'Email me',
    noSlots: 'No free time this week',
    links: { github: 'GitHub', linkedin: 'LinkedIn', emailPhone: 'Email' },
    // TODO(copy): the booking form is described in the motion spec but not drawn in Figma.
    // These labels are functional UI strings pending Daniela's wording.
    form: {
      name: 'Name',
      email: 'Email',
      message: 'What are you building?',
      submit: 'Book this time',
      cancel: 'Back',
      sending: 'Booking',
      success: 'Booked. The invite is in your inbox.',
      error: 'That didn’t go through. Email me and we’ll find a time.',
      taken: 'That time was just taken. Pick another one.',
    },
  },
  footer: {
    left: '© Daniela Georgieva · Plovdiv, Bulgaria',
    leftPhone: '© Daniela Georgieva · Plovdiv',
    right: 'Designed and built end to end by me',
  },
};
