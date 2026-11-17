import { useEffect, useRef, useState } from 'react';
import { useOperation } from '../../store/operationStore';
import * as engine from '../../features/operation/engine';
import { operation } from '../../data/operation';
import { declassifyTone, glitchBurst } from '../../features/alarm/siren';
import { Icon } from '../../components/common/Icon';
import s from './finale.module.css';

const PRIZE = 'main-prize';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@';

type Phase = 'confirm' | 'decrypt' | 'done';

/**
 * After the last task: the prize stays classified until the agent confirms, by holding a button,
 * that the vault is really open. Then the name decrypts letter by letter and the case closes.
 */
export function Finale() {
  const complete = useOperation((st) => engine.operationStatus(st) === 'OPERATION COMPLETE');
  const claimed = useOperation((st) => Boolean(st.items[PRIZE]));
  const blocked = useOperation((st) => Boolean(st.viewing || st.alarmOnScreen));
  const runEffects = useOperation((st) => st.runEffects);
  const identity = useOperation((st) => st.identity);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);

  const pending = complete && !claimed && !blocked;
  // A beat after the last task, so its success message is seen first.
  useEffect(() => {
    if (!pending) return;
    const t = window.setTimeout(() => setReady(true), 1600);
    return () => window.clearTimeout(t);
  }, [pending]);

  const current: Phase | null = phase ?? (pending && ready ? 'confirm' : null);
  if (!current) return null;

  const confirm = () => {
    runEffects(
      [
        { type: 'grantItem', item: PRIZE },
        { type: 'log', level: 'success', message: 'Объект рассекречен. Операция завершена.' },
      ],
      false,
    );
    setPhase('decrypt');
  };

  return (
    <div className={s.wrap} role="dialog" aria-modal="true" aria-labelledby="finale-title">
      <section className={s.plate}>
        <span className={s.bar} aria-hidden="true" />
        <header className={s.head}>
          <span className="cap">Протокол рассекречивания</span>
          <span className="cap">ASSET P-03 · {operation.codename}</span>
        </header>
        {current === 'confirm' && <Confirm onConfirm={confirm} />}
        {current !== 'confirm' && <Reveal done={current === 'done'} onDecrypted={() => setPhase('done')} />}
        {current === 'done' && (
          <footer className={`${s.outro} page-in`}>
            <p className={s.wish}>С днём рождения, агент {identity ?? operation.operative}.</p>
            <p className={s.note}>Операция завершена. Все материалы дела остаются в вашем распоряжении.</p>
            <button className={s.btn} onClick={() => setPhase(null)} autoFocus>
              <Icon name="check" size={16} /> Закрыть дело
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

/** Press and hold for 2 s: a deliberate act, not a stray click. Works with mouse, touch and Space/Enter. */
function Confirm({ onConfirm }: { onConfirm: () => void }) {
  const [holding, setHolding] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);

  const key = (down: boolean) => (e: React.KeyboardEvent) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (!e.repeat) setHolding(down);
  };

  return (
    <div className={`${s.body} page-in`}>
      <div className={s.object}>
        <Icon name="lock" size={28} />
        <div>
          <p className="cap">Спецустройство</p>
          <h2 id="finale-title" className={s.name}><span className={s.redacted} aria-label="Засекречено" /></h2>
        </div>
      </div>
      <p className={s.text}>
        Объект засекречен до вскрытия хранилища. Вскройте хранилище и подтвердите, что объект у вас в руках.
      </p>
      <button
        ref={btn}
        className={`${s.hold} ${holding ? s.holding : ''}`}
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onKeyDown={key(true)}
        onKeyUp={key(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className={s.fill} onAnimationEnd={onConfirm} aria-hidden="true" />
        <span className={s.holdLabel}>{holding ? 'Подтверждение…' : 'Удерживайте: хранилище вскрыто'}</span>
      </button>
    </div>
  );
}

/** The prize name decrypts left to right out of random glyphs, then gets its stamp. */
function Reveal({ done, onDecrypted }: { done: boolean; onDecrypted: () => void }) {
  const prize = engine.findItem(PRIZE)!;
  const target = prize.name;
  const [shown, setShown] = useState(() => scramble(target, 0));

  useEffect(() => {
    glitchBurst(1);
    const total = 2600;
    const t0 = performance.now();
    const timer = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / total);
      setShown(scramble(target, Math.floor(k * target.length)));
      if (k >= 1) {
        window.clearInterval(timer);
        declassifyTone();
        onDecrypted();
      }
    }, 45);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={s.body}>
      <div className={`${s.object} ${done ? s.open : ''}`}>
        <Icon name={done ? prize.icon : 'lock'} size={28} />
        <div>
          <p className="cap">Спецустройство</p>
          <h2 id="finale-title" className={s.name} aria-label={done ? target : 'Расшифровка'}>{shown}</h2>
        </div>
        {done && <span className={s.stamp}>Рассекречено</span>}
      </div>
    </div>
  );
}

function scramble(target: string, revealed: number) {
  return [...target]
    .map((c, i) => (i < revealed || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join('');
}
