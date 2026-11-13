import { useEffect, useRef, useState } from 'react';
import { useOperation } from '../../store/operationStore';
import { glitchBurst } from '../../features/alarm/siren';
import type { Alarm } from '../../types';
import { Icon } from '../common/Icon';
import s from './breach.module.css';

interface Pop { id: number; x: number; y: number; code: string; message: string; warn: boolean; echoes: number }
interface Tear { id: number; top: number; h: number; dx: number; kind: 'hatch' | 'line' | 'plate' | 'red' }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hex = () => Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
let n = 0;

/**
 * The breach: the frozen console tears apart. Error windows pile up across the screen,
 * horizontal bands slip, the picture drops out for a frame, and it ends on a black
 * "access request" card that hands over to the countdown.
 * Under motion off only the error windows appear, without tears or blackouts.
 */
export function Breach({ alarm }: { alarm: Alarm }) {
  const sound = useOperation((st) => st.sound);
  const motion = document.documentElement.dataset.motion !== 'off';
  const [pops, setPops] = useState<Pop[]>([]);
  const [tears, setTears] = useState<Tear[]>([]);
  const [black, setBlack] = useState(false);
  const [handover, setHandover] = useState(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  useEffect(() => {
    const total = alarm.breachMs;
    const chaosEnd = total - 900; // last 0.9 s: black handover card
    const t0 = performance.now();
    const timers: number[] = [];
    const progress = () => Math.min(1, (performance.now() - t0) / chaosEnd);

    // Error windows, faster and faster.
    let i = 0;
    const spawn = () => {
      const p = progress();
      if (p >= 1) return;
      const message = alarm.breachErrors[i % alarm.breachErrors.length];
      i += 1;
      setPops((cur) => [
        ...cur.slice(-15),
        {
          id: n++,
          x: rnd(2, 74),
          y: rnd(6, 78),
          code: `0x${hex()}`,
          message,
          warn: Math.random() < 0.3,
          // Some windows smear into a trail, like a hung window being dragged.
          echoes: motion && Math.random() < 0.35 ? 3 + Math.floor(Math.random() * 4) : 0,
        },
      ]);
      if (soundRef.current) glitchBurst(0.6 + p * 0.6);
      timers.push(window.setTimeout(spawn, rnd(420, 560) * (1 - p * 0.7)));
    };
    spawn();

    // Tears and dropouts.
    let ticker = 0;
    if (motion) {
      ticker = window.setInterval(() => {
        const p = progress();
        if (p >= 1) return;
        const count = Math.random() < 0.35 + p * 0.4 ? 1 + Math.floor(Math.random() * (2 + p * 4)) : 0;
        setTears(
          Array.from({ length: count }, () => ({
            id: n++,
            top: rnd(0, 98),
            h: Math.random() < 0.4 ? 1 : rnd(4, 26 + p * 40),
            dx: rnd(-60, 60),
            kind: (['hatch', 'line', 'plate', 'red'] as const)[Math.floor(Math.random() * 4)],
          })),
        );
        const drop = Math.random() < 0.04 + p * 0.1;
        setBlack(drop);
        if (drop && soundRef.current) glitchBurst(1.2);
      }, 70);
    }

    timers.push(
      window.setTimeout(() => {
        setTears([]);
        setBlack(false);
        setHandover(true);
      }, chaosEnd),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(ticker);
    };
  }, [alarm, motion]);

  return (
    <div className={s.breach} aria-hidden={handover ? undefined : 'true'}>
      {pops.map((p) => (
        <div key={p.id} className={s.popAnchor} style={{ left: `${p.x}vw`, top: `${p.y}vh` }}>
          {Array.from({ length: p.echoes }, (_, k) => (
            <span key={k} className={s.echo} style={{ transform: `translate(${-(p.echoes - k) * 10}px, ${-(p.echoes - k) * 8}px)` }} />
          ))}
          <div className={`${s.pop} ${p.warn ? s.warn : ''}`}>
            <div className={s.popHead}>
              <Icon name="alert" size={14} />
              <span>{p.warn ? 'WARNING' : 'SYSTEM FAULT'}</span>
              <span className={s.popCode}>{p.code}</span>
              <Icon name="close" size={14} />
            </div>
            <p className={s.popMsg}>{p.message}</p>
            <div className={s.popFoot}><span>ERR_{p.code.slice(2)}</span><span>PID {(p.id * 37 + 1024) % 9999}</span></div>
          </div>
        </div>
      ))}
      {tears.map((t) => (
        <span key={t.id} className={`${s.tear} ${s[t.kind]}`} style={{ top: `${t.top}%`, height: t.h, transform: `translateX(${t.dx}px)` }} />
      ))}
      {black && <div className={s.black} />}
      {handover && (
        <div className={s.handover} role="status">
          <p className={s.handText}>ACCESS REQUEST<span className={s.caret} /></p>
          <p className={s.handSub}>Требуется подтверждение личности агента</p>
        </div>
      )}
    </div>
  );
}
