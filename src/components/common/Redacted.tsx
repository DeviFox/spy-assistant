import { useEffect, useState, type ReactNode } from 'react';
import { useOperation } from '../../store/operationStore';
import s from './common.module.css';

interface Props {
  /** Locked content renders as a hatched redaction bar. */
  locked: boolean;
  /** Unlock key (e.g. "item:decoder"). When freshly unlocked, the redaction wipes off with a signal slip. */
  revealKey?: string;
  /** Approximate width of the bar in characters while locked. */
  chars?: number;
  children: ReactNode;
  className?: string;
}

export function Redacted({ locked, revealKey, chars = 14, children, className }: Props) {
  const fresh = useOperation((st) => (revealKey ? st.fresh.includes(revealKey) : false));
  const consume = useOperation((st) => st.consumeFresh);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!locked && fresh && revealKey) {
      setRevealing(true);
      consume(revealKey);
    }
  }, [locked, fresh, revealKey, consume]);

  useEffect(() => {
    if (!revealing) return;
    const t = window.setTimeout(() => setRevealing(false), 900);
    return () => window.clearTimeout(t);
  }, [revealing]);

  if (locked) {
    return (
      <span className={`${s.redacted} ${className ?? ''}`} style={{ width: `${chars}ch` }} aria-label="Засекречено">
        &nbsp;
      </span>
    );
  }
  return (
    <span className={`${s.reveal} ${revealing ? s.revealing : ''} ${className ?? ''}`}>
      <span className={revealing ? 'slip' : undefined}>{children}</span>
      {revealing && <span className={s.revealBar} aria-hidden="true" />}
    </span>
  );
}
