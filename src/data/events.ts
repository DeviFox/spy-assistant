import type { DemoEvent, SystemEvent } from '../types';

/**
 * Scripted system events. They fire on triggers and run effects.
 * Use them for optional moments between stages (extra messages, unlocks).
 */
export const systemEvents: SystemEvent[] = [
  {
    id: 'EV-ISSUE-FIRST-TASK',
    on: 'session:ready',
    effects: [
      { type: 'issueTask', task: 'T-01' },
      { type: 'log', level: 'info', message: 'Получено новое задание: T-01.' },
      { type: 'notify', level: 'info', message: 'Новое задание: T-01' },
    ],
  },
  {
    id: 'EV-STAGE-INVESTIGATION',
    on: 'stage:entered:investigation',
    effects: [{ type: 'log', level: 'warning', message: 'Уровень доступа повышен. Новые материалы будут поступать в FILES.' }],
  },
  {
    // Timed alarm: goes off 10 s (AL-01 delayMs) after T-03 is completed, as T-04 begins.
    id: 'EV-ALARM-01',
    on: 'task:completed:T-03',
    effects: [{ type: 'armAlarm', alarm: 'AL-01' }],
  },
  {
    id: 'EV-STAGE-EXTRACTION',
    on: 'stage:entered:extraction',
    effects: [{ type: 'log', level: 'info', message: 'Этап EXTRACTION активирован. Ожидайте дальнейших указаний.' }],
  },
];

/** Events the organizer can fire from the DEV panel. */
export const demoEvents: DemoEvent[] = [
  { id: 'demo-info', label: 'INFO', effects: [{ type: 'log', level: 'info', message: 'Демонстрационное событие: информационное сообщение.' }, { type: 'notify', level: 'info', message: 'Демонстрационное событие' }] },
  { id: 'demo-warning', label: 'WARNING', effects: [{ type: 'log', level: 'warning', message: 'Демонстрационное событие: предупреждение.' }, { type: 'notify', level: 'warning', message: 'Предупреждение системы' }] },
  { id: 'demo-error', label: 'ERROR', effects: [{ type: 'log', level: 'error', message: 'Демонстрационное событие: ошибка канала.' }, { type: 'notify', level: 'error', message: 'Ошибка канала' }] },
  { id: 'demo-success', label: 'SUCCESS', effects: [{ type: 'log', level: 'success', message: 'Демонстрационное событие: операция выполнена.' }, { type: 'notify', level: 'success', message: 'Успешно' }] },
  { id: 'demo-unknown', label: 'UNKNOWN', effects: [{ type: 'log', level: 'unknown', message: 'Демонстрационное событие: источник сигнала не определён.' }, { type: 'notify', level: 'unknown', message: 'Неопознанный сигнал' }] },
];
