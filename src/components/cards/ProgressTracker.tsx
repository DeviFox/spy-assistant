import { operation } from '../../data/operation';
import { useOperation } from '../../store/operationStore';
import * as engine from '../../features/operation/engine';
import { Redacted } from '../common/Redacted';
import s from './cards.module.css';

const label = { completed: 'COMPLETED', active: 'ACTIVE', locked: 'LOCKED' } as const;

/** Five-cell routing strip. Locked stages are redacted; entering a stage wipes its redaction. */
export function ProgressTracker() {
  const st = useOperation();
  const done = st.completedStages.length;
  return (
    <section className={s.progress} aria-label="Прогресс операции">
      <div className={s.progressHead}>
        <h2 className={s.progressTitle}>OPERATION PROGRESS</h2>
        <span className="cap">{done} / {operation.stages.length} COMPLETED</span>
      </div>
      <ol className={s.stages}>
        {operation.stages.map((stage) => {
          const status = engine.stageStatus(st, stage.id);
          return (
            <li key={stage.id} className={`${s.stage} ${s[`stage_${status}`]}`} aria-current={status === 'active' ? 'step' : undefined}>
              <span className={s.stageBar} aria-hidden="true" />
              <span className={s.stageCode}>{stage.code}</span>
              <span className={s.stageName}>
                <Redacted locked={status === 'locked'} revealKey={`stage:${stage.id}`} chars={stage.title.length}>
                  {stage.title}
                </Redacted>
                {status === 'locked' && <span className="visually-hidden">{stage.title}</span>}
              </span>
              <span className={s.stageStatus}>{label[status]}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
