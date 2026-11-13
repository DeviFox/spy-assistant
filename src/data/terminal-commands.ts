/*
 * Terminal command registry. Add a command by appending an object here —
 * the terminal component does not need to change.
 */
import type { TerminalCommand, TerminalOutput } from '../features/terminal/parser';
import { operation } from './operation';
import { equipment } from './equipment';
import { documents } from './documents';
import * as engine from '../features/operation/engine';

const pad = (s: string, n: number) => s + ' '.repeat(Math.max(1, n - s.length));

export const terminalCommands: TerminalCommand[] = [
  {
    name: 'help',
    description: 'Список доступных команд',
    run: ({ commands }) => [
      { level: 'system', text: 'Доступные команды:' },
      ...commands
        .filter((c) => !c.hidden)
        .map((c) => ({ level: 'info' as const, text: `  ${pad(c.usage ?? c.name, 16)}${c.description}` })),
    ],
  },
  {
    name: 'status',
    description: 'Состояние операции, этап и уровень доступа',
    run: ({ store }) => {
      const idx = engine.currentStageIndex(store);
      const stage = operation.stages[Math.min(idx, operation.stages.length - 1)];
      const done = store.completedStages.length;
      return [
        { level: 'system', text: `${operation.title} // ${operation.codename}` },
        { level: 'info', text: `  Агент       ${operation.operative}` },
        { level: 'info', text: `  Статус            ${engine.operationStatus(store)}` },
        { level: 'info', text: `  Текущий этап      ${stage.code} ${stage.title}` },
        { level: 'info', text: `  Пройдено этапов   ${done} / ${operation.stages.length}` },
        { level: 'info', text: `  Уровень доступа   ${engine.accessLevel(store)}` },
      ];
    },
  },
  {
    name: 'task',
    aliases: ['tasks'],
    description: 'Текущее задание',
    run: ({ store }) => {
      const active = engine.activeTasks(store);
      if (!active.length) return [{ level: 'warning', text: 'Активных заданий нет. Ожидается получение задания.' }];
      return active.flatMap<TerminalOutput>((t) => [
        { level: 'info', text: `${t.id} · ${t.type} · ${t.title}` },
        { level: 'system', text: `  ${t.instruction}` },
      ]);
    },
  },
  {
    name: 'inventory',
    aliases: ['inv'],
    description: 'Полученное оборудование',
    run: ({ store }) => {
      const found = equipment.filter((e) => store.items[e.id]);
      return [
        { level: 'system', text: `Оборудование: ${found.length} / ${equipment.length}` },
        ...equipment.map((e) =>
          store.items[e.id]
            ? { level: 'success' as const, text: `  ${pad(e.name, 16)}FOUND` }
            : { level: 'system' as const, text: `  ${pad('█'.repeat(e.name.length), 16)}CLASSIFIED` },
        ),
      ];
    },
  },
  {
    name: 'files',
    aliases: ['ls'],
    description: 'Доступные документы',
    run: ({ store }) => [
      { level: 'system', text: 'Документы:' },
      ...documents.map((d) => {
        const st = store.documents[d.id];
        if (!st) return { level: 'system' as const, text: `  ${pad(d.id, 10)}${pad('█'.repeat(d.filename.length), 24)}LOCKED` };
        return { level: 'info' as const, text: `  ${pad(d.id, 10)}${pad(d.filename, 24)}${st.status === 'viewed' ? 'VIEWED' : 'AVAILABLE'}` };
      }),
      { level: 'system', text: 'Открыть документ: open <имя файла>' },
    ],
  },
  {
    name: 'open',
    usage: 'open <file>',
    description: 'Открыть документ',
    run: ({ args, store }) => {
      const q = args.join(' ').toLowerCase();
      if (!q) return [{ level: 'warning', text: 'Укажите файл: open OPERATION_BRIEF.txt' }];
      const doc = documents.find((d) => d.filename.toLowerCase().startsWith(q) || d.id.toLowerCase() === q);
      if (!doc) return [{ level: 'error', text: `Файл не найден: ${args.join(' ')}` }];
      if (!store.documents[doc.id]) return [{ level: 'error', text: `Доступ запрещён: ${doc.filename} — LOCKED` }];
      store.view({ kind: 'doc', id: doc.id });
      return [{ level: 'success', text: `Открываю ${doc.filename}...` }];
    },
  },
  {
    name: 'clear',
    aliases: ['cls'],
    description: 'Очистить историю терминала',
    run: ({ store }) => {
      store.clearLogs();
    },
  },
  {
    name: 'about',
    description: 'Информация о системе',
    run: () => [
      { level: 'system', text: `${operation.codename} ${operation.version}` },
      { level: 'info', text: '  Рабочая станция агента. Локальный сеанс.' },
      { level: 'info', text: '  Задания, документы и оборудование операции.' },
      { level: 'system', text: '  Анимация: motion on | motion off' },
    ],
  },
  {
    name: 'motion',
    usage: 'motion on|off',
    description: 'Включить или отключить анимацию',
    hidden: true,
    run: ({ args, store }) => {
      const v = args[0]?.toLowerCase();
      if (v !== 'on' && v !== 'off' && v !== 'system') return [{ level: 'warning', text: 'Использование: motion on | motion off | motion system' }];
      store.setMotion(v);
      return [{ level: 'success', text: `Анимация: ${v.toUpperCase()}` }];
    },
  },
  {
    // Organizer-only. Not listed in help.
    name: 'devmode',
    hidden: true,
    description: 'Панель организатора',
    run: ({ store }) => {
      store.setDevOpen(true);
      return [{ level: 'unknown', text: 'DEV-доступ открыт.' }];
    },
  },
];
