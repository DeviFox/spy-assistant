import { describe, it, expect } from 'vitest';
import { execute, complete, type TerminalCommand } from '../src/features/terminal/parser';

const cmds: TerminalCommand[] = [
  { name: 'help', description: 'h', run: () => [{ level: 'info', text: 'ok' }] },
  { name: 'status', aliases: ['st'], description: 's', run: ({ args }) => [{ level: 'info', text: args.join(',') }] },
  { name: 'secret', hidden: true, description: 'x', condition: () => 'blocked', run: () => [{ level: 'info', text: 'no' }] },
];
const ctx = { store: {} as never, commands: cmds };

describe('terminal parser', () => {
  it('runs commands case-insensitively with args and aliases', () => {
    expect(execute('HELP', ctx)[0].text).toBe('ok');
    expect(execute('st a  b', ctx)[0].text).toBe('a,b');
  });
  it('reports unknown commands', () => {
    expect(execute('rm -rf /', ctx)[0].level).toBe('error');
  });
  it('honours conditions and ignores empty input', () => {
    expect(execute('secret', ctx)[0]).toEqual({ level: 'warning', text: 'blocked' });
    expect(execute('   ', ctx)).toEqual([]);
  });
  it('completes only visible commands', () => {
    expect(complete(cmds, 'he')).toBe('help');
    expect(complete(cmds, 'se')).toBeNull();
  });
});
