import { useState } from 'react';
import { useOperation } from '../../store/operationStore';
import * as engine from '../../features/operation/engine';
import { operation } from '../../data/operation';
import { TerminalWindow } from '../../components/terminal/TerminalWindow';
import { ProgressTracker } from '../../components/cards/ProgressTracker';
import { EmptyState } from '../../components/common/States';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TaskDetail } from './TaskDetail';
import { Materials } from './Materials';
import s from './mission.module.css';

/**
 * The single working screen: current task with its input inline, the stage strip,
 * received materials and the terminal. Documents and new finds open on top of it.
 */
export function MissionPage() {
  const st = useOperation();
  const active = engine.activeTasks(st);
  const [picked, setPicked] = useState<string | null>(null);
  const current = active.find((t) => t.id === picked) ?? active[0];
  const status = engine.operationStatus(st);

  return (
    <div className={s.grid}>
      <header className={s.greeting}>
        <div className={s.hello}>
          {operation.avatar && <img className={s.avatar} src={operation.avatar} alt={`Агент ${operation.operative}`} />}
          <div>
            <h1 className={s.display}>ОПЕРАЦИЯ АКТИВИРОВАНА</h1>
            <p className={s.sub}>Добро пожаловать, агент {st.identity ?? ''}.</p>
          </div>
        </div>
        <dl className={s.dossier}>
          <div><dt className="cap">Допуск</dt><dd><StatusBadge label={engine.accessLevel(st)} /></dd></div>
          <div><dt className="cap">Статус</dt><dd><StatusBadge label={status} /></dd></div>
        </dl>
      </header>

      <div className={s.progress}><ProgressTracker /></div>

      <div className={s.main}>
        {active.length > 1 && (
          <div className={s.tabs} role="tablist" aria-label="Активные задания">
            {active.map((t) => (
              <button key={t.id} role="tab" aria-selected={t.id === current?.id} className={s.tab} onClick={() => setPicked(t.id)}>
                {t.id}
              </button>
            ))}
          </div>
        )}
        {current ? (
          <div key={current.id} className="page-in"><TaskDetail task={current} /></div>
        ) : (
          <div className={s.waiting}>
            <EmptyState
              code={status === 'OPERATION COMPLETE' ? 'OPERATION COMPLETE' : 'AWAITING TASK'}
              message={status === 'OPERATION COMPLETE' ? 'Все этапы операции завершены.' : 'Ожидается получение задания.'}
            />
          </div>
        )}
      </div>

      <aside className={s.side}>
        <TerminalWindow className={s.terminal} />
        <Materials />
      </aside>
    </div>
  );
}
