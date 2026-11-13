import { useEffect, useRef } from 'react';
import { useOperation } from '../../store/operationStore';
import { findDocument, findItem } from '../../features/operation/engine';
import { archiveEntries } from '../../data/archive';
import type { IconName } from '../../types';
import { Icon } from '../../components/common/Icon';
import s from './mission.module.css';

const mediaIcon = { TEXT: 'text', IMAGE: 'image', AUDIO: 'audio', VIDEO: 'video' } as const;

/**
 * Announces each newly received document, item or archive entry on the mission screen, one at a time.
 * Waits until the viewer and the access banner are out of the way.
 */
export function Incoming() {
  const key = useOperation((st) => st.incoming[0]);
  const blocked = useOperation((st) => Boolean(st.viewing || st.accessBanner || st.alarmOnScreen));
  const dismiss = useOperation((st) => st.dismissIncoming);
  const view = useOperation((st) => st.view);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const show = Boolean(key) && !blocked;
  useEffect(() => {
    if (show) primaryRef.current?.focus();
  }, [show, key]);

  if (!show || !key) return null;
  const [kind, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];

  let icon: IconName = 'files';
  let label = 'NEW FILE';
  let name = id;
  let text = '';
  let openable = false;
  if (kind === 'doc') {
    const d = findDocument(id);
    name = d?.filename ?? id;
    text = d?.title ?? '';
    openable = true;
  } else if (kind === 'item') {
    const it = findItem(id);
    icon = it?.icon ?? 'equipment';
    label = 'EQUIPMENT FOUND';
    name = it?.name ?? id;
    text = it?.description ?? '';
  } else {
    const a = archiveEntries.find((x) => x.id === id);
    icon = a ? mediaIcon[a.media] : 'archive';
    label = 'NEW RECORD';
    name = a?.title ?? id;
    text = a?.description ?? '';
    openable = true;
  }

  const open = () => {
    dismiss();
    view({ kind: kind === 'doc' ? 'doc' : 'arc', id });
  };

  return (
    <div className={s.incomingWrap}>
      <section className={`${s.incoming} page-in`} role="alertdialog" aria-modal="true" aria-labelledby="incoming-name">
        <span className={s.incomingLine} aria-hidden="true" />
        <p className={s.incomingCap}>{label}</p>
        <div className={s.incomingBody}>
          <Icon name={icon} size={28} />
          <div>
            <h2 id="incoming-name" className={`${s.incomingName} slip`}>{name}</h2>
            {text && <p className={s.incomingText}>{text}</p>}
          </div>
        </div>
        <div className={s.incomingActions}>
          {openable ? (
            <>
              <button ref={primaryRef} className={s.btn} onClick={open}>
                <Icon name="arrow" size={16} /> Открыть
              </button>
              <button className={s.ghost} onClick={dismiss}>Позже</button>
            </>
          ) : (
            <button ref={primaryRef} className={s.btn} onClick={dismiss}>
              <Icon name="check" size={16} /> Принято
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
