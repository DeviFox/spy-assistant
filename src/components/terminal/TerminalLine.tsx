import { memo } from 'react';
import type { SystemLog } from '../../types';
import s from './terminal.module.css';

const time = (ts: number) => new Date(ts).toLocaleTimeString('ru-RU', { hour12: false });

export const TerminalLine = memo(function TerminalLine({ line, animate, caret }: { line: SystemLog; animate: boolean; caret?: boolean }) {
  return (
    <div className={`${s.line} ${s[line.type]} ${animate ? s.lineIn : ''}`}>
      <span className={s.ts}>{time(line.timestamp)}</span>
      <span className={s.mark} aria-hidden="true">{line.type === 'input' ? '>' : marks[line.type]}</span>
      <span className={s.msg}>
        {line.message}
        {caret && <span className={`${s.caretBlock} caret`} aria-hidden="true" />}
      </span>
    </div>
  );
});

const marks: Record<SystemLog['type'], string> = {
  input: '>', system: '·', info: '·', success: '+', warning: '!', error: '×', unknown: '?',
};
