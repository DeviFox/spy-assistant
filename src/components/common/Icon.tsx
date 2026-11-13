import type { IconName } from '../../types';

/* Authored pictograms: 24px grid, 1.5 stroke, square caps. */
const paths: Record<IconName, string> = {
  overview: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  files: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  tasks: 'M5 5h14v14H5zM8.5 12l2.5 2.5L16 9.5',
  equipment: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  archive: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4',
  flashlight: 'M8 3h8v5l-2 3v10h-4V11L8 8zM8 6h8M12 14v2',
  key: 'M14.5 4a5.5 5.5 0 1 1-4.3 8.9L4 19v1h3v-2h2v-2h2l.7-.7M16 8h.01',
  decoder: 'M4 6h16v12H4zM7 10h2M11 10h2M15 10h2M7 14h10',
  magnet: 'M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2',
  alert: 'M12 3l10 18H2zM12 10v5M12 17.5v1',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9h.01',
  audio: 'M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2',
  video: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  text: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4',
  log: 'M4 5h16M4 10h10M4 15h16M4 20h8',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  hint: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
};

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
