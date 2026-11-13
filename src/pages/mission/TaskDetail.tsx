import { useState } from 'react';
import type { Task } from '../../types';
import { useOperation } from '../../store/operationStore';
import { findDocument } from '../../features/operation/engine';
import { operation } from '../../data/operation';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CodeInput } from '../../components/common/CodeInput';
import { Redacted } from '../../components/common/Redacted';
import { Icon } from '../../components/common/Icon';
import s from './task.module.css';

const typeLabel: Record<Task['type'], string> = {
  INFORMATION: 'Прочитать информацию',
  CODE_INPUT: 'Ввести код',
  PHYSICAL: 'Действие в реальном мире',
  INVESTIGATION: 'Изучить улики',
  DECISION: 'Выбрать вариант',
};

export function TaskDetail({ task }: { task: Task }) {
  const ts = useOperation((st) => st.tasks[task.id]);
  const docs = useOperation((st) => st.documents);
  const submit = useOperation((st) => st.submit);
  const revealHint = useOperation((st) => st.revealHint);
  const view = useOperation((st) => st.view);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string; n: number } | null>(null);
  const [choice, setChoice] = useState<string>('');

  const done = ts.status === 'completed';
  const stage = operation.stages.find((x) => x.id === task.stage);
  const confirm = (answer?: string) => {
    const r = submit(task.id, answer);
    setFeedback((p) => ({ ...r, n: (p?.n ?? 0) + 1 }));
    return r;
  };

  return (
    <article className={s.task}>
      <header className={s.taskHead}>
        <div className={s.taskMeta}>
          <span className="cap">{task.id}</span>
          <span className="cap">STAGE {stage?.code} · {stage?.title}</span>
          <span className="cap">{task.type}</span>
        </div>
        <StatusBadge label={done ? 'COMPLETED' : 'ACTIVE'} />
      </header>

      <div className={s.taskBody}>
        <h2 className={s.taskTitle}>{task.title}</h2>
        <p className={s.taskDesc}>{task.description}</p>

        <section className={s.block} aria-label="Инструкция">
          <h3 className="cap">Instruction · {typeLabel[task.type]}</h3>
          <p className={s.instruction}>{task.instruction}</p>
        </section>

        {task.requiresDocuments?.length ? (
          <section className={s.block} aria-label="Материалы">
            <h3 className="cap">Required files</h3>
            <ul className={s.reqs}>
              {task.requiresDocuments.map((d) => {
                const doc = findDocument(d);
                const viewed = docs[d]?.status === 'viewed';
                return (
                  <li key={d}>
                    <button type="button" onClick={() => view({ kind: 'doc', id: d })} className={`${s.req} ${viewed ? s.reqDone : ''}`}>
                      <Icon name={viewed ? 'check' : 'files'} size={16} />
                      <span className="mono">{doc?.filename ?? d}</span>
                      <span className="cap">{viewed ? 'VIEWED' : 'OPEN'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {!done && (
          <section className={s.action} aria-label="Ответ">
            {(task.type === 'CODE_INPUT' || task.type === 'INVESTIGATION') && (
              <CodeInput
                label={task.type === 'CODE_INPUT' ? 'Access code' : 'Finding'}
                placeholder={task.type === 'CODE_INPUT' ? 'Введите код' : 'Введите ответ'}
                onSubmit={confirm}
              />
            )}
            {task.type === 'DECISION' && (
              <form className={s.decision} onSubmit={(e) => { e.preventDefault(); confirm(choice); }}>
                <fieldset className={s.options}>
                  <legend className="cap">Choose one</legend>
                  {task.options?.map((o) => (
                    <label key={o.id} className={`${s.option} ${choice === o.id ? s.optionOn : ''}`}>
                      <input type="radio" name={`${task.id}-opt`} value={o.id} checked={choice === o.id} onChange={() => setChoice(o.id)} />
                      <span className={s.optKey}>{o.id}</span>
                      <span>{o.label}</span>
                    </label>
                  ))}
                </fieldset>
                <button className={s.btn} type="submit" disabled={!choice}>SUBMIT</button>
              </form>
            )}
            {(task.type === 'INFORMATION' || task.type === 'PHYSICAL') && (
              <button className={s.btn} onClick={() => confirm()}>
                <Icon name="check" size={16} /> {task.confirmLabel ?? 'Подтвердить'}
              </button>
            )}
            {feedback && !feedback.ok && task.type !== 'CODE_INPUT' && task.type !== 'INVESTIGATION' && (
              <p key={feedback.n} className={`${s.fail} slip`} role="status">ACCESS DENIED · {feedback.message}</p>
            )}
          </section>
        )}

        {done && (
          <section className={s.success} role="status">
            <Icon name="check" size={18} />
            <div>
              <p className="cap">Completed</p>
              <p>{task.successMessage}</p>
            </div>
          </section>
        )}

        <section className={s.block} aria-label="Результат">
          <h3 className="cap">Reward</h3>
          <p className={s.reward}>
            <Redacted locked={!done} revealKey={`reward:${task.id}`} chars={24}>{task.reward}</Redacted>
          </p>
        </section>

        {task.hints.length > 0 && (
          <section className={s.block} aria-label="Подсказки">
            <div className={s.hintHead}>
              <h3 className="cap">Hints · {ts.hintsRevealed} / {task.hints.length}</h3>
              {!done && ts.hintsRevealed < task.hints.length && (
                <button className={s.ghost} onClick={() => revealHint(task.id)}>
                  <Icon name="hint" size={16} /> Запросить подсказку
                </button>
              )}
            </div>
            {ts.hintsRevealed > 0 && (
              <ol className={s.hints}>
                {task.hints.slice(0, ts.hintsRevealed).map((h, i) => (
                  <li key={i} className={s.hint}><span className="mono">H{i + 1}</span>{h}</li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </article>
  );
}
