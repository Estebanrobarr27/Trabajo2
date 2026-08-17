import type { ReactElement } from "react";

/* Iconografía propia de Juventudes: trazos redondeados, 24×24. */
const P: Record<string, ReactElement> = {
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" /></>),
  bus: (<><rect x="4" y="4" width="16" height="13" rx="2.5" /><path d="M4 11h16M8 17v2.5M16 17v2.5M8.5 14.5h.01M15.5 14.5h.01" /></>),
  heart: (<path d="M12 20.5S4.5 15.8 4.5 10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.7c0 5.5-7.5 10.2-7.5 10.2z" />),
  medical: (<path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" />),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></>),
  wheel: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /><path d="M12 3v6.5M4.5 16.5l5.3-3M19.5 16.5l-5.3-3" /></>),
  tag: (<><path d="M12.5 2.5H4v8.5L13 20l8.5-8.5z" /><circle cx="8" cy="6.5" r="1.4" /></>),
  shield: (<><path d="M12 2.5 20 6v6c0 4.8-3.4 8.2-8 9.5-4.6-1.3-8-4.7-8-9.5V6z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></>),
  siren: (<><path d="M6 20v-6a6 6 0 0 1 12 0v6" /><path d="M3.5 20h17M12 4.5V2M4.8 7.6 3.4 6.2M19.2 7.6l1.4-1.4" /></>),
  phone: (<path d="M6.8 3.5c.6 0 1.1.4 1.3 1l.9 2.6c.2.5 0 1.1-.4 1.5L7.3 9.8a12.5 12.5 0 0 0 6.9 6.9l1.2-1.3c.4-.4 1-.6 1.5-.4l2.6.9c.6.2 1 .7 1 1.3v2.3c0 .8-.7 1.5-1.5 1.5C10.6 21 3 13.4 3 5c0-.8.7-1.5 1.5-1.5z" />),
  pin: (<><path d="M12 21.5s7-6.3 7-11.5a7 7 0 1 0-14 0c0 5.2 7 11.5 7 11.5z" /><circle cx="12" cy="10" r="2.5" /></>),
  bell: (<><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2.5h-15z" /><path d="M10 21a2.4 2.4 0 0 0 4 0" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4.5 21c1.3-3.8 4.2-5.7 7.5-5.7s6.2 1.9 7.5 5.7" /></>),
  users: (<><circle cx="9" cy="8.5" r="3.5" /><path d="M2.8 20c1.1-3.3 3.4-5 6.2-5s5.1 1.7 6.2 5" /><path d="M15.5 5.5a3.5 3.5 0 0 1 0 6M18.5 15.6c1.5.7 2.4 2.2 2.9 4.4" /></>),
  settings: (<><path d="M4 8h9M19 8h1M4 16h3M13 16h7" /><circle cx="16" cy="8" r="2.2" /><circle cx="10" cy="16" r="2.2" /></>),
  logout: (<><path d="M9.5 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.5" /><path d="m15.5 16.5 4.5-4.5-4.5-4.5M20 12H9.5" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  chat: (<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3.1-.4-4.4-1.2L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z" />),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10.5h18" /></>),
  pill: (<><path d="m10.2 4.6 9.2 9.2a4.6 4.6 0 1 1-6.5 6.5L3.7 11a4.6 4.6 0 1 1 6.5-6.4z" /><path d="m7 8 6.5 6.5" /></>),
  clipboard: (<><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7M9 10h6M9 13.5h6M9 17h3.5" /></>),
  check: (<path d="m4.5 12.5 5 5L19.5 6.5" />),
  x: (<path d="M6 6l12 12M18 6 6 18" />),
  plus: (<path d="M12 5v14M5 12h14" />),
  trash: (<><path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13.5h9l1-13.5" /><path d="M10 11v6M14 11v6" /></>),
  edit: (<><path d="M12 20h9" /><path d="M16.6 3.6a2.1 2.1 0 0 1 3 3L8 18.2 4 19.2l1-4z" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></>),
  news: (<><path d="M4 4h13v16H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M17 9h3v8.5A2.5 2.5 0 0 1 17.5 20M7.5 8.5H13M7.5 12H13M7.5 15.5h3" /></>),
  dollar: (<><path d="M12 2.5v19" /><path d="M16.8 6.2c-1-1.3-2.9-1.9-4.8-1.9-2.4 0-4.3 1.2-4.3 3.1 0 4.3 9.4 2.2 9.4 6.6 0 1.9-2 3.1-4.7 3.1-2.1 0-4.1-.7-5.2-2.1" /></>),
  euro: (<><path d="M18 5.5A7.5 7.5 0 1 0 18 18.5" /><path d="M4 10.5h9M4 13.5h8" /></>),
  alert: (<><path d="M12 3 1.8 20.2h20.4z" /><path d="M12 9.5v4.5M12 17.5h.01" /></>),
  star: (<path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z" />),
  chevronDown: (<path d="m6 9.5 6 6 6-6" />),
  chevronRight: (<path d="m9.5 6 6 6-6 6" />),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.5-4.5" /></>),
  lock: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></>),
  unlock: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7.5a4 4 0 0 1 7.8-1.2" /></>),
  eye: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>),
  eyeOff: (<><path d="M4 4l16 16" /><path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6.1 8A16.9 16.9 0 0 0 2.5 12S6 18.5 12 18.5a9.7 9.7 0 0 0 3.5-.7" /></>),
  send: (<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />),
  refresh: (<><path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 3v6h-6" /></>),
  home: (<path d="m3 11 9-8 9 8v9.5a1.5 1.5 0 0 1-1.5 1.5H14v-6h-4v6H4.5A1.5 1.5 0 0 1 3 20.5z" />),
  list: (<><path d="M9 6h12M9 12h12M9 18h12" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>),
  activity: (<path d="M22 12h-4l-3 8-6-16-3 8H2" />),
  key: (<><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 8.5-8.5M18 5l2.5 2.5M15 8l2 2" /></>),
  truck: (<><path d="M2.5 6h11v11h-11zM13.5 10h4l3 3v4h-3" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>),
  download: (<path d="M12 3v12M6.5 9.5 12 15l5.5-5.5M4 20.5h16" />),
  arrowRight: (<path d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5" />),
  filter: (<path d="M3.5 5h17l-6.5 7.6V19l-4 2v-8.4z" />),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5h.01" /></>),
  sparkle: (<path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />),
  crosshair: (<><circle cx="12" cy="12" r="7.5" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></>),
  camera: (<><path d="M4 8h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13.5" r="3.2" /></>),
  doc: (<><path d="M6 2.5h8L19 7.5v14H6z" /><path d="M14 2.5v5h5M9 12h6M9 15.5h6" /></>),
  moon: (<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a7 7 0 0 0 10 10z" />),
  wallet: (<><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 15h2" /></>),
  btc: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 7.5v9M11.8 7.5v9M9.5 7.5h3.2a2.2 2.2 0 0 1 0 4.4H9.5h3.6a2.3 2.3 0 0 1 0 4.6H9.5M11 5.5v2M13.2 5.5v2M11 16.5v2M13.2 16.5v2" /></>),
  gold: (<><path d="m6 10 2-5h8l2 5" /><path d="M3.5 10h17l1.5 9H2z" /><path d="M8 10v9M12 10v9M16 10v9" /></>),
  chart: (<><path d="M3.5 20.5h17" /><path d="m4.5 16 4.5-5 3.5 3 6-7.5" /><path d="M14.5 6.5h4v4" /></>),
};

export type IconName = keyof typeof P & string;

export function Icon({ n, size = 22, className = "", sw = 1.9 }: { n: string; size?: number; className?: string; sw?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {P[n] ?? P.info}
    </svg>
  );
}
