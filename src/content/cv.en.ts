// CV copy, English. Word for word from Figma (CV mode 51:10, phone 83:56, A4 51:106).
// Do not rewrite, shorten or "improve" anything here; ask Daniela if something has to change.
// After any change, regenerate the PDFs: npm run cv:pdf (see scripts/README-cv-pdfs.md).
import type { CvContent } from './cv';

export const cv: CvContent = {
  download: {
    note: 'This is the short version of the portfolio. Same facts, one page.',
    current: 'Download PDF',
    other: 'PDF на български',
    verify: {
      copy: 'Copy',
      copied: 'Copied',
      help: 'To check your copy, run shasum -a 256 on macOS, sha256sum on Linux or Get-FileHash in PowerShell. The result should match the hash above.',
      older: 'Older versions:',
    },
  },
  name: 'Daniela Georgieva',
  title: 'Full stack DevOps engineer',
  location: 'Plovdiv, Bulgaria',
  links: { github: 'GitHub', linkedin: 'LinkedIn' },
  profile: {
    label: 'Profile',
    text: 'Full stack DevOps engineer who takes products from first design to production and runs the Linux servers behind them. Offensive security is my biggest passion and where my career is heading: outside my full-time job I practise every day, playing CTFs, reproducing public CVEs and learning how vulnerabilities are found and exploited. I’m proactive and learn fast: in four months at XTRMND I went from learning the codebase to owning projects and leading their shareholder presentations in plain language, and the stock system I took over was live by my second month. I work as well in a team as alone, people find me patient and clear, and I hit my deadlines. I aim to be the best in this field and look at every problem from all sides.',
  },
  experience: {
    label: 'Experience',
    jobs: [
      {
        title: 'Full stack DevOps engineer',
        place: 'XTRMND · Plovdiv',
        dates: 'Jul 2026 – present',
        bullets: [
          'I took over a rooflight manufacturer’s warehouse management system and moved the business off its shared spreadsheet. In production since August 2026: five sales channels share one stock count, and sales taking stock from the wrong product fell from 47 to 0.',
          'I release and run it on a Linux server (Docker Compose, PostgreSQL with nightly backups, Caddy). GitHub Actions deploys to staging, then production, with health checks and a one-step rollback. Six releases between 6 and 19 November 2026.',
          'B2B trade portal: customers order online and get their proforma, VAT invoice and monthly statement automatically, with live stock from the warehouse system. I built the stock link and the statements, and on 22 October 2026 switched its stock over in production (backup, guarded SQL transaction, rollback plan) with 0 mismatches.',
          'I designed, built and host a language school’s website and brand identity, with a CMS the staff edit themselves. Google speed score: 31 to 100 on desktop, 54 to 95 on mobile.',
          'I’m moving nine WordPress and Shopify shops onto one platform I designed and built: a fix or price change happens once, and every product size gets its own page on Google.',
        ],
      },
    ],
  },
  skills: {
    label: 'Skills',
    groups: [
      {
        name: 'Linux administration',
        items:
          'LVM, filesystems and mounts, users and permissions, virtualisation (UTM), VPS setup, IT infrastructure management, Bash scripting',
      },
      {
        name: 'Security',
        items:
          'OWASP Top 10, MITRE ATT&CK, Kali Linux, Nmap, gobuster, sqlmap, Metasploit, netcat, OSINT (Shodan, Google dorking, WHOIS, crt.sh, Wayback Machine), web exploitation, reverse shells and pivoting, Linux and Windows privilege escalation, Active Directory, BloodHound, Kerberoasting, credential dumping, C2 frameworks (Cobalt Strike, Tuoni), Microsoft Sentinel and KQL, Wazuh, security log analysis, Windows security and IIS, tcpdump, server hardening, security headers and CSP, TLS and certificates, secrets management, dependency scanning',
      },
      {
        name: 'Networking',
        items:
          'Network administration and infrastructure, TCP/IP and OSI, subnets and CIDR, ports and firewalls, NAT and port forwarding, HTTP/HTTPS, CDN and caching, DNS and Cloudflare, SSH keys and tunnels, Cloudflare Tunnel, Let’s Encrypt and ACME, dig, nslookup, curl, openssl, ss, netstat and lsof',
        itemsPrint:
          'Network administration and infrastructure, TCP/IP and OSI, subnets and CIDR, firewalls, NAT and port forwarding, HTTP/HTTPS, CDN, DNS, Cloudflare and Cloudflare Tunnel, SSH keys and tunnels, Let’s Encrypt, dig, nslookup, curl, openssl, ss, netstat, lsof',
      },
      {
        name: 'DevOps',
        items:
          'Docker and Compose, GitHub Actions CI/CD, Turborepo and pnpm workspaces, Nginx, Python',
        itemsPrint:
          'Docker and Compose, GitHub Actions CI/CD, Turborepo and pnpm, Nginx, Python',
      },
      {
        name: 'Full stack',
        printOnly: true,
        items:
          'TypeScript, JavaScript, React, Next.js, Tailwind CSS, HTML and CSS, Node.js, Medusa, Payload CMS, PostgreSQL, SQL, REST APIs, webhooks',
      },
      {
        name: 'Frontend',
        screenOnly: true,
        items:
          'TypeScript, JavaScript, React, Next.js (framework), Tailwind CSS, HTML and CSS, responsive web design',
      },
      {
        name: 'Backend and data',
        screenOnly: true,
        items:
          'Node.js, Medusa (framework), Payload CMS, PostgreSQL, SQL, REST APIs, webhooks, API integrations',
      },
      {
        name: 'Ways of working',
        // Not in the A4 PDF (Daniela, Nov 2026): makes room for the longer Women4Cyber line.
        screenOnly: true,
        items: 'Leadership, stakeholder relations, agentic workflows, Git and code review, Figma, responsive design, design-to-code',
      },
    ],
  },
  education: {
    label: 'Education',
    items: [{ title: 'BSc Computer Science (Hons)', place: 'University of Essex', dates: 'Expected 2030' }],
  },
  training: {
    label: 'Training',
    // Newest first.
    items: [
      {
        title: 'Inside a Cyber Attack: Student Bootcamp',
        place: 'Focal Point Academy · breach to data theft, SIEM, KQL detections',
        dates: 'Nov 2026',
      },
      {
        title: 'Cloud Hacking & Cloud Defence',
        place: 'Focal Point Academy · Microsoft cloud attacks and detection',
        dates: 'Nov 2026',
      },
      { title: 'Cloud & DevOps programme', place: 'EPAM · Linux, Bash, Python, Docker, AWS, Kubernetes' },
    ],
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
      'I volunteer in Women4Cyber Bulgaria’s 40-minute cyber-safety sessions in schools across the country. I took on managing the project, led the Plovdiv region, and designed and built the grades 1 to 4 presentation as a web app presenters run in class.',
    ],
  },
};
