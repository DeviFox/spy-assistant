/*
 * Operation engine: pure functions over OperationState.
 * Content (src/data) describes WHAT happens; this file decides HOW state changes.
 * UI components never mutate game state directly — they call store actions that use this engine.
 */
import { operation } from '../../data/operation';
import { tasks as taskList } from '../../data/tasks';
import { equipment as equipmentList } from '../../data/equipment';
import { documents as documentList, initialDocuments } from '../../data/documents';
import { archiveEntries } from '../../data/archive';
import { systemEvents } from '../../data/events';
import { alarms as alarmList } from '../../data/alarms';
import type {
  AlarmStatus, AccessLevel, Effect, LogLevel, Notification, OperationStatus, StageId, StageStatus, SystemLog, TaskStatus, Trigger,
} from '../../types';

export interface OperationState {
  startedAt: number;
  completedStages: StageId[];
  tasks: Record<string, { status: TaskStatus; hintsRevealed: number; attempts: number; completedAt?: number }>;
  items: Record<string, { foundAt: number }>;
  documents: Record<string, { status: 'available' | 'viewed'; receivedAt: number }>;
  archive: Record<string, { unlockedAt: number }>;
  logs: SystemLog[];
  firedEvents: string[];
  bootDone: boolean;
  alarms: Record<string, AlarmStatus>;
}

/** Side information produced by a transition, consumed by the UI (toasts, reveal animation). */
export interface Outcome {
  notifications: Notification[];
  /** Keys like "item:decoder", "doc:DOC-002", "stage:access", "task:T-03" — used for the unredaction reveal. */
  unlocked: string[];
  accessChanged?: AccessLevel;
}

const MAX_LOGS = 300;
let seq = 0;
export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const findTask = (id: string) => taskList.find((t) => t.id === id);
export const findItem = (id: string) => equipmentList.find((e) => e.id === id);
export const findDocument = (id: string) => documentList.find((d) => d.id === id);
export const findAlarm = (id: string) => alarmList.find((a) => a.id === id);

export function createInitialState(now = Date.now()): OperationState {
  const tasks: OperationState['tasks'] = {};
  for (const t of taskList) tasks[t.id] = { status: 'locked', hintsRevealed: 0, attempts: 0 };
  const documents: OperationState['documents'] = {};
  for (const id of initialDocuments) documents[id] = { status: 'available', receivedAt: now };
  const archive: OperationState['archive'] = {};
  for (const a of archiveEntries) if (!a.locked) archive[a.id] = { unlockedAt: now };
  return { startedAt: now, completedStages: [], tasks, items: {}, documents, archive, logs: [], firedEvents: [], bootDone: false, alarms: {} };
}

/* ---------------- selectors ---------------- */

export function currentStageIndex(s: OperationState): number {
  const i = operation.stages.findIndex((st) => !s.completedStages.includes(st.id));
  return i === -1 ? operation.stages.length : i;
}

export function stageStatus(s: OperationState, id: StageId): StageStatus {
  if (s.completedStages.includes(id)) return 'completed';
  const idx = operation.stages.findIndex((st) => st.id === id);
  return idx === currentStageIndex(s) ? 'active' : 'locked';
}

export function accessLevel(s: OperationState): AccessLevel {
  const stages = operation.stages;
  return stages[Math.min(currentStageIndex(s), stages.length - 1)].accessLevel;
}

export const activeTasks = (s: OperationState) => taskList.filter((t) => s.tasks[t.id]?.status === 'active');

export function operationStatus(s: OperationState): OperationStatus {
  if (currentStageIndex(s) >= operation.stages.length) return 'OPERATION COMPLETE';
  return activeTasks(s).length ? 'TASK ASSIGNED' : 'AWAITING TASK';
}

export const normalizeAnswer = (v: string) => v.trim().toUpperCase().replace(/\s+/g, '').replace(/Ё/g, 'Е');

/* ---------------- transitions ---------------- */

const emptyOutcome = (): Outcome => ({ notifications: [], unlocked: [] });

function log(s: OperationState, type: LogLevel, message: string, now: number): OperationState {
  const logs = [...s.logs, { id: uid('log'), timestamp: now, type, message }];
  return { ...s, logs: logs.length > MAX_LOGS ? logs.slice(-MAX_LOGS) : logs };
}

export function appendLog(s: OperationState, type: LogLevel, message: string, now = Date.now()) {
  return log(s, type, message, now);
}

function applyEffect(s: OperationState, e: Effect, now: number, out: Outcome, triggers: Trigger[]): OperationState {
  switch (e.type) {
    case 'log':
      return log(s, e.level, e.message, now);
    case 'notify':
      out.notifications.push({ id: uid('n'), level: e.level, message: e.message });
      return s;
    case 'issueTask': {
      const t = s.tasks[e.task];
      if (!t || t.status !== 'locked') return s;
      out.unlocked.push(`task:${e.task}`);
      return { ...s, tasks: { ...s.tasks, [e.task]: { ...t, status: 'active' } } };
    }
    case 'grantItem': {
      if (s.items[e.item] || !findItem(e.item)) return s;
      out.unlocked.push(`item:${e.item}`);
      triggers.push(`item:found:${e.item}`);
      return { ...s, items: { ...s.items, [e.item]: { foundAt: now } } };
    }
    case 'unlockDocument': {
      const doc = findDocument(e.document);
      if (s.documents[e.document] || !doc) return s;
      out.unlocked.push(`doc:${e.document}`);
      const next = { ...s, documents: { ...s.documents, [e.document]: { status: 'available' as const, receivedAt: now } } };
      return log(next, 'info', `Получен документ: ${doc.filename}`, now);
    }
    case 'unlockArchive': {
      if (s.archive[e.entry]) return s;
      out.unlocked.push(`arc:${e.entry}`);
      return { ...s, archive: { ...s.archive, [e.entry]: { unlockedAt: now } } };
    }
    case 'armAlarm': {
      const st = s.alarms?.[e.alarm];
      if (!findAlarm(e.alarm) || st === 'passed' || st === 'recovered') return s;
      return { ...s, alarms: { ...s.alarms, [e.alarm]: 'armed' } };
    }
    case 'completeStage': {
      if (s.completedStages.includes(e.stage)) return s;
      const before = accessLevel(s);
      let next: OperationState = { ...s, completedStages: [...s.completedStages, e.stage] };
      const stage = operation.stages.find((st) => st.id === e.stage);
      next = log(next, 'success', `Этап ${stage?.code} ${stage?.title} завершён.`, now);
      const idx = currentStageIndex(next);
      const entered = operation.stages[idx];
      if (entered) {
        out.unlocked.push(`stage:${entered.id}`);
        triggers.push(`stage:entered:${entered.id}`);
        const after = accessLevel(next);
        if (after !== before) {
          out.accessChanged = after;
          next = log(next, 'warning', `Уровень доступа изменён: ${after}`, now);
        }
      } else {
        next = log(next, 'success', 'Все этапы операции завершены.', now);
      }
      return next;
    }
  }
}

/** Applies effects, then fires any system events their triggers match (recursively, once-guarded). */
export function applyEffects(s: OperationState, effects: Effect[], now = Date.now(), out = emptyOutcome(), depth = 0): [OperationState, Outcome] {
  const triggers: Trigger[] = [];
  let next = s;
  for (const e of effects) next = applyEffect(next, e, now, out, triggers);
  for (const trig of triggers) [next] = fireTrigger(next, trig, now, out, depth + 1);
  return [next, out];
}

export function fireTrigger(s: OperationState, trigger: Trigger, now = Date.now(), out = emptyOutcome(), depth = 0): [OperationState, Outcome] {
  if (depth > 8) return [s, out]; // guard against event loops in content
  let next = s;
  for (const ev of systemEvents) {
    if (ev.on !== trigger) continue;
    const once = ev.once ?? true;
    if (once && next.firedEvents.includes(ev.id)) continue;
    next = { ...next, firedEvents: [...next.firedEvents, ev.id] };
    [next] = applyEffects(next, ev.effects, now, out, depth);
  }
  return [next, out];
}

export interface SubmitResult {
  ok: boolean;
  message: string;
}

/** Validates an answer (or plain confirmation) for an active task. */
export function submitTask(s: OperationState, taskId: string, answer?: string, now = Date.now()): [OperationState, Outcome, SubmitResult] {
  const task = findTask(taskId);
  const ts = s.tasks[taskId];
  const out = emptyOutcome();
  if (!task || !ts) return [s, out, { ok: false, message: 'Задание не найдено.' }];
  if (ts.status !== 'active') return [s, out, { ok: false, message: 'Задание недоступно.' }];

  const missing = (task.requiresDocuments ?? []).filter((d) => s.documents[d]?.status !== 'viewed');
  if (missing.length) {
    const names = missing.map((d) => findDocument(d)?.filename ?? d).join(', ');
    return [s, out, { ok: false, message: `Сначала откройте: ${names}` }];
  }

  if (task.expectedAnswer !== undefined) {
    const given = normalizeAnswer(answer ?? '');
    if (!given) return [s, out, { ok: false, message: 'Введите ответ.' }];
    if (given !== normalizeAnswer(task.expectedAnswer)) {
      let next: OperationState = { ...s, tasks: { ...s.tasks, [taskId]: { ...ts, attempts: ts.attempts + 1 } } };
      const msg = task.failureMessage ?? 'Ответ неверный.';
      next = log(next, 'error', `${task.id}: ${msg}`, now);
      return [next, out, { ok: false, message: msg }];
    }
  }

  let next: OperationState = { ...s, tasks: { ...s.tasks, [taskId]: { ...ts, status: 'completed', completedAt: now } } };
  next = log(next, 'success', `${task.id}: ${task.successMessage}`, now);
  out.unlocked.push(`reward:${taskId}`);
  [next] = applyEffects(next, task.unlocks, now, out);
  [next] = fireTrigger(next, `task:completed:${taskId}`, now, out);
  out.notifications.push({ id: uid('n'), level: 'success', message: `${task.id} выполнено` });
  return [next, out, { ok: true, message: task.successMessage }];
}

export function revealHint(s: OperationState, taskId: string): OperationState {
  const task = findTask(taskId);
  const ts = s.tasks[taskId];
  if (!task || !ts || ts.hintsRevealed >= task.hints.length) return s;
  return { ...s, tasks: { ...s.tasks, [taskId]: { ...ts, hintsRevealed: ts.hintsRevealed + 1 } } };
}

export function openDocument(s: OperationState, docId: string, now = Date.now()): [OperationState, Outcome] {
  const d = s.documents[docId];
  if (!d || d.status === 'viewed') return [s, emptyOutcome()];
  const next = { ...s, documents: { ...s.documents, [docId]: { ...d, status: 'viewed' as const } } };
  return fireTrigger(next, `document:opened:${docId}`, now);
}

/* ---------------- timed alarms ---------------- */

/** The alarm that is armed or locked down right now, if any. */
export function pendingAlarm(s: OperationState) {
  const id = Object.keys(s.alarms ?? {}).find((k) => s.alarms[k] === 'armed' || s.alarms[k] === 'lockdown');
  return id ? findAlarm(id) : undefined;
}

/**
 * Answers an alarm. While armed it checks the countdown answer; in lockdown it checks the recovery answer.
 * Wrong answers keep the status and are logged.
 */
export function answerAlarm(s: OperationState, id: string, answer: string, now = Date.now()): [OperationState, Outcome, SubmitResult] {
  const alarm = findAlarm(id);
  const status = s.alarms?.[id];
  const out = emptyOutcome();
  if (!alarm || (status !== 'armed' && status !== 'lockdown')) return [s, out, { ok: false, message: 'Событие неактивно.' }];
  const given = normalizeAnswer(answer);
  if (!given) return [s, out, { ok: false, message: 'Введите ответ.' }];
  const recovering = status === 'lockdown';
  const expected = recovering ? alarm.recovery.expectedAnswer : alarm.expectedAnswer;
  if (given !== normalizeAnswer(expected)) {
    return [log(s, 'error', `${id}: неверный ответ.`, now), out, { ok: false, message: 'Ответ не принят.' }];
  }
  const message = recovering ? alarm.recovery.successMessage : alarm.successMessage;
  let next: OperationState = { ...s, alarms: { ...s.alarms, [id]: recovering ? 'recovered' : 'passed' } };
  next = log(next, recovering ? 'warning' : 'success', `${id}: ${message}`, now);
  [next] = applyEffects(next, recovering ? alarm.recovery.effects : alarm.successEffects, now, out);
  return [next, out, { ok: true, message }];
}

/** Time ran out: the workstation locks until the recovery protocol is completed. */
export function lockAlarm(s: OperationState, id: string, now = Date.now()): OperationState {
  const alarm = findAlarm(id);
  if (!alarm || s.alarms?.[id] !== 'armed') return s;
  const next = { ...s, alarms: { ...s.alarms, [id]: 'lockdown' as const } };
  return log(next, 'error', `${id}: ${alarm.lockdown.message}`, now);
}

/* ---------------- DEV helpers ---------------- */

export function devUnlockAllStages(s: OperationState, now = Date.now()): [OperationState, Outcome] {
  const effects: Effect[] = [
    ...operation.stages.slice(0, -1).map((st) => ({ type: 'completeStage', stage: st.id }) as Effect),
    ...documentList.map((d) => ({ type: 'unlockDocument', document: d.id }) as Effect),
    ...taskList.map((t) => ({ type: 'issueTask', task: t.id }) as Effect),
  ];
  return applyEffects(s, effects, now);
}

export function devGrantAllItems(s: OperationState, now = Date.now()): [OperationState, Outcome] {
  return applyEffects(s, equipmentList.map((e) => ({ type: 'grantItem', item: e.id }) as Effect), now);
}
