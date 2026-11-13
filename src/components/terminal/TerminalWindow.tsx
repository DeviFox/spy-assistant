import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useOperation } from '../../store/operationStore';
import { execute, complete } from '../../features/terminal/parser';
import { terminalCommands } from '../../data/terminal-commands';
import { operation } from '../../data/operation';
import { TerminalLine } from './TerminalLine';
import s from './terminal.module.css';

const mountedAt = Date.now();

/** Themed command terminal. Commands come from the registry in src/data/terminal-commands.ts. */
export function TerminalWindow({ className }: { className?: string }) {
  const logs = useOperation((st) => st.logs);
  const booted = useOperation((st) => st.bootDone);
  const [value, setValue] = useState('');
  const [pos, setPos] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs.length]);

  const run = (input: string) => {
    const store = useOperation.getState();
    store.pushLog('input', input);
    const out = execute(input, { store, commands: terminalCommands });
    for (const o of out) useOperation.getState().pushLog(o.level, o.text);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = value.trim();
      if (!v) return;
      run(v);
      setHistory((h) => [...h.slice(-49), v]);
      setHIndex(-1);
      setValue('');
      setPos(0);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!history.length) return;
      e.preventDefault();
      const next = e.key === 'ArrowUp'
        ? (hIndex === -1 ? history.length - 1 : Math.max(0, hIndex - 1))
        : (hIndex === -1 ? -1 : hIndex + 1 >= history.length ? -1 : hIndex + 1);
      const v = next === -1 ? '' : history[next];
      setHIndex(next);
      setValue(v);
      setPos(v.length);
    } else if (e.key === 'Tab') {
      const c = complete(terminalCommands, value);
      if (c) {
        e.preventDefault();
        setValue(c + ' ');
        setPos(c.length + 1);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      useOperation.getState().clearLogs();
    }
  };

  const syncPos = () => setPos(inputRef.current?.selectionStart ?? value.length);
  const lines = logs;

  return (
    <section className={`${s.term} ${className ?? ''}`} aria-label="Системный терминал">
      <header className={s.head}>
        <h2 className={s.title}>SYSTEM TERMINAL <span>// SESSION {operation.session}</span></h2>
        <span className={s.state}>{booted ? 'ONLINE' : 'BOOTING'}</span>
      </header>
      <div
        ref={scrollRef}
        className={s.screen}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}
      >
        {lines.length === 0 && booted && <p className={s.cleared}>История очищена.</p>}
        {lines.map((l, i) => (
          <TerminalLine key={l.id} line={l} animate={l.timestamp >= mountedAt} caret={(!booted || !focused) && i === lines.length - 1} />
        ))}
      </div>
      <label className={`${s.prompt} ${booted ? '' : s.promptOff}`}>
        <span className={s.ps1} aria-hidden="true">musya@op01 ~ $</span>
        <span className={s.field}>
          <span className={s.mirror} aria-hidden="true">
            {value.slice(0, pos)}
            <span className={`${s.caret} ${booted ? 'caret' : ''}`}>{value[pos] ?? ' '}</span>
            {value.slice(pos + 1)}
          </span>
          <input
            ref={inputRef}
            className={s.input}
            value={value}
            disabled={!booted}
            onChange={(e) => { setValue(e.target.value); setPos(e.target.selectionStart ?? e.target.value.length); }}
            onKeyDown={onKey}
            onKeyUp={syncPos}
            onSelect={syncPos}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            maxLength={120}
            aria-label="Команда терминала. Введите help для списка команд."
          />
        </span>
      </label>
    </section>
  );
}
