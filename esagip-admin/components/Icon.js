const iconPaths = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20v-1.5a5.5 5.5 0 0 1 11 0V20M18 8v6m-3-3h6" /></>,
  operations: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 12h18" /></>,
  attendance: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18m-13 4h3m-3 3h7" /></>,
  community: <><path d="m3 11 15-6v14L3 13v-2Z" /><path d="M18 8.5a3.5 3.5 0 0 1 0 7M7 14.5l1.5 4.5" /></>,
  reports: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 6-7" /></>,
  access: <><path d="M12 3 5 6v6c0 5 3.5 8.2 7 9 3.5-.8 7-4 7-9V6l-7-3Z" /><path d="m9.5 12 1.8 1.8 3.7-3.8" /></>,
  logs: <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />,
  plus: <path d="M12 5v14M5 12h14" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8m-3 0h3v3m-5 2 2 2" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export default function Icon({ name, className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}
