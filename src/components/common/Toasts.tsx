import { useEffect } from 'react';
import { useOperation } from '../../store/operationStore';
import type { Notification } from '../../types';
import s from './overlays.module.css';

const label = { info: 'INFO', success: 'SUCCESS', warning: 'WARNING', error: 'ERROR', unknown: 'UNKNOWN' } as const;

/** Small system notifications, bottom-right. Each one dismisses itself a few seconds after it appears. */
export function Toasts() {
  const items = useOperation((st) => st.notifications);
  const dismiss = useOperation((st) => st.dismissNotification);

  return (
    <div className={s.toasts} aria-live="polite">
      {items.map((n) => (
        <Toast key={n.id} n={n} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function Toast({ n, onDismiss }: { n: Notification; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = window.setTimeout(() => onDismiss(n.id), 3600);
    return () => window.clearTimeout(t);
  }, [n.id, onDismiss]);
  return (
    <button className={`${s.toast} ${s[n.level]}`} onClick={() => onDismiss(n.id)}>
      <span className={s.toastLevel}>{label[n.level]}</span>
      <span>{n.message}</span>
    </button>
  );
}

/** Access level change: a brief non-blocking banner with the signal slip. */
export function AccessBanner() {
  const level = useOperation((st) => st.accessBanner);
  const dismiss = useOperation((st) => st.dismissAccessBanner);

  useEffect(() => {
    if (!level) return;
    const t = window.setTimeout(dismiss, 3200);
    return () => window.clearTimeout(t);
  }, [level, dismiss]);

  if (!level) return null;
  return (
    <div className={s.bannerWrap} role="status" aria-live="assertive" onClick={dismiss}>
      <div className={s.banner}>
        <span className={s.bannerLine} aria-hidden="true" />
        <span className={s.bannerCap}>ACCESS LEVEL UPDATED</span>
        <strong className={`${s.bannerLevel} slip`}>{level}</strong>
        <span className={s.bannerCap}>Новые материалы доступны</span>
      </div>
    </div>
  );
}
