import { useEffect, useRef, useState, type SyntheticEvent, type FormEvent, type KeyboardEvent } from 'react';
import { login } from '../../data/login';
import { operation } from '../../data/operation';
import { matchName, ruCharFor } from '../../features/login/layout';
import { useMotionEnabled } from '../../features/operation/useMotion';
import { useOperation } from '../../store/operationStore';
import { StatusBadge } from '../common/StatusBadge';
import s from './login.module.css';

type Phase = 'input' | 'loading';

/** Entry gate: the operative types her name in Russian, keys mapped by physical ЙЦУКЕН position. */
export function LoginScreen() {
  const motion = useMotionEnabled();
  const doLogin = useOperation((st) => st.login);
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<number>(0); // increments to replay the slip
  const [failText, setFailText] = useState(login.failMessage);
  const [phase, setPhase] = useState<Phase>('input');
  const [identity, setIdentity] = useState('');
  const [step, setStep] = useState(0);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const insert = (ch: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = (value.slice(0, start) + ch + value.slice(end)).slice(0, 24);
    setValue(next);
    requestAnimationFrame(() => el?.setSelectionRange(start + 1, start + 1));
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Enter') return; // handled by form submit
    const ch = ruCharFor(e.code, e.key, e.shiftKey || e.getModifierState('CapsLock'));
    if (ch) {
      e.preventDefault();
      insert(ch);
    }
  };

  const block = (e: SyntheticEvent) => e.preventDefault();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== 'input' || !value.trim()) return;
    const name = matchName(value, login.acceptedNames);
    if (!name) {
      setFailText(matchName(value, login.nearMiss.names) ? login.nearMiss.message : login.failMessage);
      setAttempts((a) => a + 1);
      setError((n) => n + 1);
      setValue('');
      setShaking(false);
      requestAnimationFrame(() => setShaking(true));
      inputRef.current?.focus();
      return;
    }
    setIdentity(name);
    setPhase('loading');
  };

  // Loader: advance steps, then hand over to the console.
  useEffect(() => {
    if (phase !== 'loading') return;
    const ms = motion ? login.stepMs : 120;
    if (step < login.loaderSteps.length) {
      const t = window.setTimeout(() => setStep((n) => n + 1), ms);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => doLogin(identity), motion ? 650 : 0);
    return () => window.clearTimeout(t);
  }, [phase, step, motion, identity, doLogin]);

  const hints = login.hints.filter((h) => attempts >= h.after);
  const pct = Math.round((step / login.loaderSteps.length) * 100);

  return (
    <div className={s.screen}>
      <header className={s.top}>
        <span className={s.brand}>
          <svg className={s.mark} viewBox="0 0 32 32" aria-hidden="true">
            <path d="M8 24V9l4 4h8l4-4v15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M13 18h.01M19 18h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <span>MUSYA<span className={s.ext}>.exe</span></span>
          <span className={s.version}>{operation.version}</span>
        </span>
        <StatusBadge label="CLASSIFIED" />
      </header>

      <main className={s.center}>
        <section className={s.panel} aria-labelledby="auth-title">
          <header className={s.panelHead}>
            <span>ACCESS TERMINAL // AUTH</span>
            <span className={phase === 'loading' ? s.ok : s.wait}>{phase === 'loading' ? 'GRANTED' : 'LOCKED'}</span>
          </header>

          {phase === 'input' ? (
            <form className={s.body} onSubmit={submit} noValidate>
              <h1 id="auth-title" className={s.title}>{login.title}</h1>
              <label htmlFor="op-name" className={s.label}>
                <span>{login.prompt}</span>
                <span className={s.layout} title="Раскладка ввода">{login.layoutLabel}</span>
              </label>
              <div className={`${s.field} ${error ? s.fieldErr : ''} ${shaking ? s.shake : ''}`} onAnimationEnd={() => setShaking(false)}>
                <span className={s.ps} aria-hidden="true">&gt;</span>
                <input
                  id="op-name"
                  ref={inputRef}
                  className={s.input}
                  value={value}
                  onKeyDown={onKey}
                  onChange={(e) => setValue(e.target.value.replace(/[^а-яё \-]/gi, '').slice(0, 24))}
                  onPaste={block}
                  onDrop={block}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  lang="ru"
                  aria-invalid={error > 0 && !value ? true : undefined}
                  aria-describedby="auth-msg"
                />
              </div>
              <div className={s.row}>
                <p id="auth-msg" className={s.msg} role="status">
                  {error > 0 && <span key={error} className="slip" style={{ display: 'inline-block' }}>ACCESS DENIED · {failText}</span>}
                </p>
                <span className={s.attempts}>ATTEMPTS {attempts}</span>
              </div>
              <button className={s.submit} type="submit" disabled={!value.trim()}>AUTHENTICATE</button>
              {hints.length > 0 && (
                <ol className={s.hints} aria-label="Подсказки">
                  {hints.map((h, i) => (
                    <li key={i}><span>H{i + 1}</span>{h.text}</li>
                  ))}
                </ol>
              )}
            </form>
          ) : (
            <div className={s.body} role="status" aria-live="polite">
              <h1 id="auth-title" className={`${s.title} ${s.granted} slip`}>ACCESS GRANTED</h1>
              <p className={s.identity}>{login.successLine(identity)}</p>
              <ol className={s.steps}>
                {login.loaderSteps.map((label, i) => (
                  <li key={label} className={i < step ? s.stepDone : i === step ? s.stepNow : s.stepWait}>
                    <span className={s.stepMark}>{i < step ? 'OK' : i === step ? '··' : '--'}</span>
                    {label}
                  </li>
                ))}
              </ol>
              <div className={s.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
              <span className={s.pct}>{pct}%</span>
            </div>
          )}
        </section>
      </main>

      <footer className={s.foot}>
        <span><span className={s.live} aria-hidden="true" />LOCAL SESSION</span>
        <span>{operation.title}</span>
      </footer>
    </div>
  );
}
