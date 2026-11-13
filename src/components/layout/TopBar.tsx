import { operation } from '../../data/operation';
import { StatusBadge } from '../common/StatusBadge';
import { useOperation, type MotionPref } from '../../store/operationStore';
import s from './layout.module.css';

const nextMotion: Record<MotionPref, MotionPref> = { system: 'off', off: 'on', on: 'system' };

export function TopBar() {
  const motion = useOperation((st) => st.motion);
  const setMotion = useOperation((st) => st.setMotion);
  return (
    <header className={s.topbar}>
      <div className={s.brand}>
        {/* Placeholder mark — later replaced by the kitten-with-sword silhouette. */}
        <svg className={s.mark} viewBox="0 0 32 32" aria-hidden="true">
          <path d="M8 24V9l4 4h8l4-4v15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M13 18h.01M19 18h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
        <span className={s.name}>
          MUSYA<span className={s.ext}>.exe</span>
        </span>
        <span className={s.version}>{operation.version}</span>
      </div>
      <dl className={s.meta}>
        <div className={s.metaItem}>
          <dt className="visually-hidden">Сеанс</dt>
          <dd><span className={s.live} aria-hidden="true" />LOCAL SESSION</dd>
        </div>
        <div className={`${s.metaItem} ${s.hideSm}`}>
          <dt className="visually-hidden">Операция</dt>
          <dd>{operation.title}</dd>
        </div>
        <div className={`${s.metaItem} ${s.hideSm}`}>
          <dt className="visually-hidden">Анимация</dt>
          <dd>
            <button className={s.motionBtn} onClick={() => setMotion(nextMotion[motion])} aria-label="Переключить анимацию">
              ANIM {motion === 'system' ? 'AUTO' : motion.toUpperCase()}
            </button>
          </dd>
        </div>
        <div className={s.metaItem}>
          <dt className="visually-hidden">Гриф</dt>
          <dd><StatusBadge label="CLASSIFIED" /></dd>
        </div>
      </dl>
    </header>
  );
}
