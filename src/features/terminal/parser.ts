import type { LogLevel } from '../../types';
import type { Store } from '../../store/operationStore';

export interface TerminalOutput {
  level: Exclude<LogLevel, 'input'>;
  text: string;
}

export interface CommandContext {
  args: string[];
  raw: string;
  /** Current store snapshot with actions. */
  store: Store;
  commands: TerminalCommand[];
}

export interface TerminalCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  /** Undocumented commands are not listed by `help`. */
  hidden?: boolean;
  /** Return a reason string to block execution, or null to allow. */
  condition?: (ctx: CommandContext) => string | null;
  run: (ctx: CommandContext) => TerminalOutput[] | void;
}

export const tokenize = (input: string) => input.trim().split(/\s+/).filter(Boolean);

export function findCommand(commands: TerminalCommand[], name: string) {
  const n = name.toLowerCase();
  return commands.find((c) => c.name === n || c.aliases?.includes(n));
}

/** Parses one line and runs the matching command. Never executes anything outside the registry. */
export function execute(input: string, ctx: Omit<CommandContext, 'args' | 'raw'>): TerminalOutput[] {
  const [name, ...args] = tokenize(input.slice(0, 200));
  if (!name) return [];
  const cmd = findCommand(ctx.commands, name);
  if (!cmd) {
    return [{ level: 'error', text: `Команда не распознана: ${name}. Введите help для списка команд.` }];
  }
  const full: CommandContext = { ...ctx, args, raw: input };
  const blocked = cmd.condition?.(full);
  if (blocked) return [{ level: 'warning', text: blocked }];
  return cmd.run(full) ?? [];
}

/** Completes a partial command name against visible commands. */
export function complete(commands: TerminalCommand[], partial: string): string | null {
  const p = partial.trim().toLowerCase();
  if (!p || p.includes(' ')) return null;
  const hits = commands.filter((c) => !c.hidden && c.name.startsWith(p));
  return hits.length === 1 ? hits[0].name : null;
}
