import { useOperation } from '../../store/operationStore';
import * as engine from '../../features/operation/engine';
import { demoEvents } from '../../data/events';
import { alarms } from '../../data/alarms';
import { Icon } from '../common/Icon';
import s from './dev.module.css';

/** Organizer-only panel. Opened with ?dev in the URL or the undocumented `devmode` command. */
export function DevPanel() {
  const st = useOperation();
  if (!st.devOpen) return null;

  const current = engine.activeTasks(st)[0];
  if (!st.identity) {
    return (
      <aside className={s.panel} aria-label="DEV-панель организатора">
        <header className={s.head}>
          <h2 className={s.title}>DEV PANEL</h2>
          <span className={s.note}>login gate</span>
          <button className={s.close} onClick={() => st.setDevOpen(false)} aria-label="Закрыть DEV-панель"><Icon name="close" size={16} /></button>
        </header>
        <div className={s.group}>
          <button className={s.btn} onClick={() => st.login('МУСЯ')}>Skip login</button>
        </div>
      </aside>
    );
  }
  const completeCurrent = () => {
    if (!current) return;
    for (const d of current.requiresDocuments ?? []) {
      st.runEffects([{ type: 'unlockDocument', document: d }]);
      useOperation.getState().openDocument(d);
    }
    useOperation.getState().submit(current.id, current.expectedAnswer);
  };
  const reset = () => {
    if (window.confirm('Сбросить весь прогресс операции? Журнал и полученные предметы будут удалены.')) {
      st.devReset();
      window.location.reload();
    }
  };

  return (
    <aside className={s.panel} aria-label="DEV-панель организатора">
      <header className={s.head}>
        <h2 className={s.title}>DEV PANEL</h2>
        <span className={s.note}>organizer only</span>
        <button className={s.close} onClick={() => st.setDevOpen(false)} aria-label="Закрыть DEV-панель"><Icon name="close" size={16} /></button>
      </header>

      <dl className={s.readout}>
        <div><dt>stage</dt><dd>{engine.currentStageIndex(st) + 1} / 5</dd></div>
        <div><dt>status</dt><dd>{engine.operationStatus(st)}</dd></div>
        <div><dt>access</dt><dd>{engine.accessLevel(st)}</dd></div>
        <div><dt>task</dt><dd>{current?.id ?? '—'}</dd></div>
        <div><dt>items</dt><dd>{Object.keys(st.items).length}</dd></div>
        <div><dt>logs</dt><dd>{st.logs.length}</dd></div>
        <div><dt>alarm</dt><dd>{alarms.map((a) => `${a.id}:${st.alarms[a.id] ?? 'idle'}`).join(' ') || '—'}</dd></div>
      </dl>

      <div className={s.group}>
        <h3 className={s.groupTitle}>Progress</h3>
        <button className={s.btn} onClick={completeCurrent} disabled={!current}>Complete current task</button>
        <button className={s.btn} onClick={st.devUnlockAll}>Unlock all stages</button>
        <button className={s.btn} onClick={st.devGrantAll}>Grant all items</button>
        <button className={`${s.btn} ${s.danger}`} onClick={reset}>Reset progress</button>
      </div>

      <div className={s.group}>
        <h3 className={s.groupTitle}>Timed alarm</h3>
        {alarms.map((a) => (
          <button key={a.id} className={s.btn} onClick={() => st.devArmAlarm(a.id)}>Run {a.id} now</button>
        ))}
      </div>

      <div className={s.group}>
        <h3 className={s.groupTitle}>Demo events</h3>
        <div className={s.events}>
          {demoEvents.map((e) => (
            <button key={e.id} className={`${s.btn} ${s[`ev_${e.label.toLowerCase()}`]}`} onClick={() => st.runEffects(e.effects)}>{e.label}</button>
          ))}
        </div>
      </div>
    </aside>
  );
}
