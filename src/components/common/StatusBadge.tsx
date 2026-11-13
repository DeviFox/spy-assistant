import s from './common.module.css';

export type Tone = 'accent' | 'warning' | 'error' | 'muted' | 'unknown' | 'done';

const toneFor: Record<string, Tone> = {
  ACTIVE: 'accent', FOUND: 'accent', AVAILABLE: 'accent', 'TASK ASSIGNED': 'accent',
  COMPLETED: 'done', VIEWED: 'done', 'OPERATION COMPLETE': 'done',
  LOCKED: 'muted', 'NOT FOUND': 'muted', 'NOT AVAILABLE': 'muted',
  'AWAITING TASK': 'warning', PENDING: 'warning', RESTRICTED: 'warning', CONFIDENTIAL: 'warning', SECRET: 'error',
  CLASSIFIED: 'error',
};

export function StatusBadge({ label, tone }: { label: string; tone?: Tone }) {
  const t = tone ?? toneFor[label] ?? 'muted';
  return (
    <span className={`${s.badge} ${s[`tone_${t}`]}`}>
      <span className={s.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
