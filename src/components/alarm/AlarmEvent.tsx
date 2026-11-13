import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOperation } from '../../store/operationStore';
import * as engine from '../../features/operation/engine';
import { grantedTone, lockdownTone, startAlarm, tick } from '../../features/alarm/siren';
import { Breach } from './Breach';
import type { Alarm } from '../../types';
import { CodeInput } from '../common/CodeInput';
import { Icon } from '../common/Icon';
import s from './alarm.module.css';

type Phase = 'delay' | 'freeze' | 'breach' | 'alarm' | 'granted' | 'lockdown' | 'recovery' | 'restored';
interface Run { id: string; phase: Phase }

const root = () => document.getElementById('root');
const setDocAlarm = (v: string | null) => {
  if (v) document.documentElement.dataset.alarm = v;
  else delete document.documentElement.dataset.alarm;
};

/**
 * Timed alarm, played as a separate event on top of the console:
 * delay → the interface hangs → screen-wide breach → access request with countdown + warnings → granted, or lockdown → recovery protocol.
 * Failing is never final. State lives in the engine (`alarms`), so a reload resumes lockdown.
 */
export function AlarmEvent() {
  const pendingId = useOperation((st) => engine.pendingAlarm(st)?.id);
  const status = useOperation((st) => (pendingId ? st.alarms[pendingId] : undefined));
  const alarmNow = useOperation((st) => st.alarmNow);
  const setOnScreen = useOperation((st) => st.setAlarmOnScreen);
  const [run, setRun] = useState<Run | null>(null);
  const alarm = run ? engine.findAlarm(run.id) : undefined;
  const go = useCallback((phase: Phase) => setRun((r) => (r ? { ...r, phase } : r)), []);

  // Pick up an armed or locked-down alarm.
  useEffect(() => {
    if (run || !pendingId) return;
    setRun({ id: pendingId, phase: status === 'lockdown' ? 'lockdown' : 'delay' });
  }, [run, pendingId, status]);

  // Delay, then freeze, then the alarm cuts in.
  useEffect(() => {
    if (!run || !alarm) return;
    if (run.phase === 'delay') {
      const t = window.setTimeout(() => go('freeze'), alarmNow ? 600 : alarm.delayMs);
      return () => window.clearTimeout(t);
    }
    if (run.phase === 'freeze') {
      useOperation.getState().clearAlarmNow();
      const t = window.setTimeout(() => go('breach'), alarm.freezeMs);
      return () => window.clearTimeout(t);
    }
    if (run.phase === 'breach') {
      const t = window.setTimeout(() => go('alarm'), alarm.breachMs);
      return () => window.clearTimeout(t);
    }
  }, [run, alarm, alarmNow, go]);

  // Screen takeover: freeze styling, inert console, block keys while frozen.
  const onScreen = Boolean(run && run.phase !== 'delay');
  useEffect(() => {
    setOnScreen(onScreen);
    const el = root();
    if (el) el.inert = onScreen && run?.phase !== 'freeze' ? true : false;
    return () => {
      if (el) el.inert = false;
    };
  }, [onScreen, run?.phase, setOnScreen]);

  useEffect(() => {
    const phase = run?.phase;
    if (phase === 'freeze' || phase === 'breach') {
      (document.activeElement as HTMLElement | null)?.blur?.();
      const block = (e: Event) => { e.preventDefault(); e.stopPropagation(); };
      setDocAlarm(phase);
      window.addEventListener('keydown', block, true);
      return () => window.removeEventListener('keydown', block, true);
    }
    setDocAlarm(phase === 'alarm' ? 'on' : phase && phase !== 'delay' ? 'hold' : null);
  }, [run?.phase]);
  useEffect(() => () => setDocAlarm(null), []);

  if (!run || !alarm || run.phase === 'delay' || run.phase === 'freeze') return null;
  if (run.phase === 'breach') return createPortal(<Breach alarm={alarm} />, document.body);

  const finish = () => setRun(null);
  return createPortal(<AlarmScreen alarm={alarm} phase={run.phase} go={go} finish={finish} />, document.body);
}

function AlarmScreen({ alarm, phase, go, finish }: { alarm: Alarm; phase: Phase; go: (p: Phase) => void; finish: () => void }) {
  const sound = useOperation((st) => st.sound);
  const setSound = useOperation((st) => st.setSound);
  const tone = phase === 'alarm' || phase === 'lockdown' ? 'red' : phase === 'recovery' ? 'amber' : 'green';
  const caption = {
    alarm: 'INTRUSION DETECTED',
    lockdown: 'ACCESS BLOCKED',
    recovery: 'RECOVERY PROTOCOL',
    granted: 'THREAT NEUTRALIZED',
    restored: 'ACCESS RESTORED',
  }[phase as Exclude<Phase, 'delay' | 'freeze' | 'breach'>];

  return (
    <div className={`${s.wrap} ${s[tone]}`}>
      {phase === 'alarm' && <div className={s.frame} aria-hidden="true" />}
      <section className={s.plate} role="alertdialog" aria-modal="true" aria-labelledby="alarm-title" aria-describedby="alarm-desc">
        <span className={s.bar} aria-hidden="true" />
        <header className={s.head}>
          <span className={s.headCap}><Icon name={tone === 'green' ? 'check' : 'alert'} size={16} />{caption}</span>
          <span className={s.headAside}>
            <span className="cap">{alarm.id}</span>
            <button type="button" className={s.sound} onClick={() => setSound(!sound)} aria-pressed={sound}>
              {sound ? 'SOUND ON' : 'SOUND OFF'}
            </button>
          </span>
        </header>
        {phase === 'alarm' && <Countdown alarm={alarm} sound={sound} onGranted={() => go('granted')} onExpired={() => go('lockdown')} />}
        {phase === 'lockdown' && <Lockdown alarm={alarm} sound={sound} onRecover={() => go('recovery')} />}
        {phase === 'recovery' && <Recovery alarm={alarm} onDone={() => go('restored')} />}
        {(phase === 'granted' || phase === 'restored') && (
          <Resolved message={phase === 'granted' ? alarm.successMessage : alarm.recovery.successMessage} sound={sound && phase === 'granted'} onClose={finish} />
        )}
      </section>
    </div>
  );
}

function Countdown({ alarm, sound, onGranted, onExpired }: { alarm: Alarm; sound: boolean; onGranted: () => void; onExpired: () => void }) {
  const answer = useOperation((st) => st.answerAlarm);
  const total = alarm.seconds * 1000;
  const deadline = useRef(performance.now() + total);
  const [left, setLeft] = useState(total);
  const logged = useRef(new Set<number>());
  const done = useRef(false);
  const expire = useRef(onExpired);
  expire.current = onExpired;
  const elapsed = Math.floor((total - left) / 1000);
  const secLeft = Math.ceil(left / 1000);

  // Machine alarm for the whole countdown.
  useEffect(() => (sound ? startAlarm() : undefined), [sound]);

  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const l = Math.max(0, deadline.current - performance.now());
      setLeft(l);
      if (l <= 0 && !done.current) {
        done.current = true;
        useOperation.getState().lockAlarm(alarm.id);
        expire.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [alarm.id]);

  // Warnings go to the system journal as they appear.
  useEffect(() => {
    alarm.warnings.forEach((w, i) => {
      if (w.at <= elapsed && !logged.current.has(i)) {
        logged.current.add(i);
        useOperation.getState().pushLog(w.level, w.message);
      }
    });
  }, [elapsed, alarm.warnings]);

  useEffect(() => {
    if (sound && secLeft <= 5 && secLeft > 0) tick();
  }, [secLeft, sound]);

  const submit = (value: string) => {
    if (done.current) return { ok: false, message: 'Время истекло.' };
    const r = answer(alarm.id, value);
    if (r.ok) {
      done.current = true;
      onGranted();
    }
    return r;
  };

  const shown = alarm.warnings.filter((w) => w.at <= elapsed);
  const critical = secLeft <= 5;
  return (
    <div className={s.body}>
      <h2 id="alarm-title" className={s.title}>{alarm.title}</h2>
      <div className={s.clock}>
        <span key={critical ? secLeft : 'calm'} className={`${s.digits} ${critical ? 'slip' : ''}`} aria-hidden="true">
          {(left / 1000).toFixed(1).padStart(4, '0')}
        </span>
        <span className="cap">SEC</span>
        <span className="visually-hidden" aria-live="assertive">
          {secLeft === alarm.seconds || secLeft === 10 || secLeft === 5 ? `Осталось ${secLeft} секунд` : ''}
        </span>
      </div>
      <div className={s.track} aria-hidden="true"><span className={s.fill} style={{ transform: `scaleX(${left / total})` }} /></div>
      <p id="alarm-desc" className={s.prompt}>{alarm.prompt}</p>
      <CodeInput label={alarm.inputLabel} placeholder="Введите ответ" onSubmit={submit} autoFocus />
      <section className={s.warnings} style={{ ['--rows' as string]: alarm.warnings.length }} aria-label="Предупреждения системы">
        <h3 className="cap">System warnings · {shown.length} / {alarm.warnings.length}</h3>
        <ol>
          {shown.map((w) => (
            <li key={w.at} className={s[w.level]}>
              <span className={s.wTime}>T+{String(w.at).padStart(2, '0')}</span>
              <span className={s.wMark}>!</span>
              <span>{w.message}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Lockdown({ alarm, sound, onRecover }: { alarm: Alarm; sound: boolean; onRecover: () => void }) {
  const [wait, setWait] = useState(alarm.lockdown.penaltySeconds);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (sound) lockdownTone();
    // Sound is read once, on entering lockdown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (wait <= 0) {
      btn.current?.focus();
      return;
    }
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  return (
    <div className={s.body}>
      <h2 id="alarm-title" className={s.title}>Рабочая станция заблокирована</h2>
      <div className={s.clock}>
        <span className={s.lockedDigits} aria-hidden="true">
          <span className={s.digits}>00.0</span>
          <span className={s.seal} />
        </span>
        <span className="cap">SEC</span>
      </div>
      <p id="alarm-desc" className={s.prompt}>{alarm.lockdown.message}</p>
      <div className={s.actions}>
        <button ref={btn} type="button" className={s.btn} onClick={onRecover} disabled={wait > 0}>
          <Icon name="arrow" size={16} /> Запустить протокол восстановления
        </button>
        {wait > 0 && <span className={s.penalty} role="status">Доступно через 0:{String(wait).padStart(2, '0')}</span>}
      </div>
    </div>
  );
}

function Recovery({ alarm, onDone }: { alarm: Alarm; onDone: () => void }) {
  const answer = useOperation((st) => st.answerAlarm);
  const [hint, setHint] = useState(false);
  const submit = (value: string) => {
    const r = answer(alarm.id, value);
    if (r.ok) onDone();
    return r;
  };
  return (
    <div className={s.body}>
      <h2 id="alarm-title" className={s.title}>Восстановление доступа</h2>
      <p id="alarm-desc" className={s.prompt}>{alarm.recovery.prompt}</p>
      <CodeInput label={alarm.recovery.inputLabel} placeholder="Введите код" onSubmit={submit} autoFocus />
      {alarm.recovery.hint && (
        hint ? (
          <p className={s.hint}><span className="mono">H1</span>{alarm.recovery.hint}</p>
        ) : (
          <button type="button" className={s.ghost} onClick={() => setHint(true)}>
            <Icon name="hint" size={16} /> Запросить подсказку
          </button>
        )
      )}
    </div>
  );
}

function Resolved({ message, sound, onClose }: { message: string; sound: boolean; onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
    if (sound) grantedTone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={s.body}>
      <h2 id="alarm-title" className={`${s.title} slip`}>{message}</h2>
      <p id="alarm-desc" className={s.prompt}>Инцидент успешно устранен. Можно продолжать работу.</p>
      <div className={s.actions}>
        <button ref={btn} type="button" className={s.btn} onClick={onClose}>
          <Icon name="check" size={16} /> Вернуться к работе
        </button>
      </div>
    </div>
  );
}
