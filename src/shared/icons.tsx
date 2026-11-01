const PATHS = {
  search: "M10.8 4.5a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6zM15.4 15.4 20 20",
  cup: "M5 9h11v4.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 13.5V9zM16 11h1.5a2.25 2.25 0 0 1 0 4.5H16M8.5 3.5c-.8 1 .8 1.7 0 3M11.5 3.5c-.8 1 .8 1.7 0 3",
  pin: "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z",
  star: "M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.6 1-5.8-4.2-4.1 5.8-.8z",
  chat: "M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4.5 3.5V6.5a1 1 0 0 1 1-1z",
  close: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  instagram:
    "M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17 7h.01",
  chevron: "M6 9l6 6 6-6",
  logout:
    "M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10M15 8l4 4-4 4M19 12H9",
  trash:
    "M5 7h14M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6A1.2 1.2 0 0 1 14.5 5.2V7M18 7l-.8 12.1A2 2 0 0 1 15.2 21H8.8a2 2 0 0 1-2-1.9L6 7M10 11v6M14 11v6",
  settings:
    "M4 7h7M17 7h3M11 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0M4 17h3M13 17h7M7 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4z",
  eyeOff:
    "M4 4l16 16M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.9M6.4 7.6A16.4 16.4 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-.9M10 10a2.7 2.7 0 0 0 3.9 3.8",
  refresh:
    "M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66M17 4v4.5h-4.5M7 20v-4.5h4.5",
  copy: "M9 9.5h9A1.5 1.5 0 0 1 19.5 11v8A1.5 1.5 0 0 1 18 20.5H9A1.5 1.5 0 0 1 7.5 19v-8A1.5 1.5 0 0 1 9 9.5zM6 14.5h-.5A1.5 1.5 0 0 1 4 13V5a1.5 1.5 0 0 1 1.5-1.5H14A1.5 1.5 0 0 1 15.5 5v.5",
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  className?: string;
}

const FLIP_IN_RTL: readonly IconName[] = ["arrow", "logout"];

const SVG_ATTRIBUTES = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

export function Icon({ name, className = "" }: IconProps) {
  const flip = FLIP_IN_RTL.includes(name) ? "rtl:-scale-x-100" : "";
  return (
    <svg {...SVG_ATTRIBUTES} className={`${flip} ${className}`.trim()}>
      <path d={PATHS[name]} />
    </svg>
  );
}
