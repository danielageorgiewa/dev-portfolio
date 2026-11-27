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
  title: 'Full Stack | DevOps | Aspiring Penetration Tester',
  location: 'Plovdiv, Bulgaria',
  links: { github: 'GitHub', linkedin: 'LinkedIn' },
  profile: {
    label: 'Profile',
    text: 'I am an offensive security enthusiast who comes from a Full Stack Engineer and DevOps background: I understand how systems and their plumbing are designed and built, and where to probe. Outside work I love to play CTFs, build home labs on VMs and attend useful webinars and workshops. I am determined to grow and become one of the best in this industry and am incredibly proactive in order to do so. In four months at XTRMND I went from learning the codebase to owning projects in production.',
  },
  experience: {
    label: 'Experience',
    jobs: [
      {
        title: 'Full stack DevOps engineer',
        place: 'XTRMND · Plovdiv',
        dates: 'Jul 2026 – present',
        bullets: [
          'Was responsible for designing, building and maintaining an international skylight supplier’s warehouse management system, replacing a legacy spreadsheet/Apps Script setup. Multi-tenant architecture which takes its stock from multiple WooCommerce/Shopify and custom websites. Wrong stock movement fell to 0.',
          'The WMS lives on a self-hosted Linux server with CI/CD on GitHub Actions that deploys releases to staging on merge and to production with a manual trigger. Health checks, backups and a one-step rollback by design.',
          'Was responsible for creating a commerce solution for B2B clients, hooked to the warehouse management system’s API. The system issues VATs and proformas and has a configured SMTP server which sends them out.',
          'Gave a language school’s website a completely new makeover, designing, building, maintaining and hosting it ourselves. I started this all by giving them a new brand identity in Figma, where I then turned this design into code. They have their own CMS (Payload), which lets them edit anything they wish, but also re-use Figma components to add new listings. Google speed score went from 31 to 100 (desktop) and 54 to 95 (mobile).',
          'I’m currently in the process of moving nine legacy WordPress and Shopify websites onto one platform I designed and built. In scope are role-based access, IAM auth and expanding to micro-service architecture.',
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
        items:
          'TypeScript, JavaScript, React, Next.js, Tailwind CSS, HTML and CSS, Node.js, Medusa, Payload CMS, PostgreSQL, SQL, REST APIs, webhooks',
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
    label: 'Volunteering',
    items: [
      'As an active member of the Women4Cyber chapter in Bulgaria, I regularly contribute to their campaigns. I took on creating the materials (a web app in slide format hosted on Cloudflare Pages) for their cyber-safety in school sessions and led the Plovdiv region. You can find out more about me on my website, linked at the top.',
    ],
  },
};
