import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as engine from '../features/operation/engine';
import type { OperationState, Outcome, SubmitResult } from '../features/operation/engine';
import type { AccessLevel, Effect, LogLevel, Notification, Trigger } from '../types';

export type MotionPref = 'system' | 'on' | 'off';

interface UiState {
  notifications: Notification[];
  /** Keys unlocked during this page session that have not yet played their reveal. */
  fresh: string[];
  accessBanner: AccessLevel | null;
  devOpen: boolean;
  motion: MotionPref;
  /** Name entered at login (Cyrillic, uppercased). null = not logged in. */
  identity: string | null;
  /** Material open in the viewer overlay. */
  viewing: Viewing | null;
  /** Newly received documents / items / archive entries ("doc:ID", "item:ID", "arc:ID") waiting to be announced. */
  incoming: string[];
  /** True while an alarm has taken over the screen (freeze, countdown, lockdown). */
  alarmOnScreen: boolean;
  /** Event sounds (alarm siren). */
  sound: boolean;
  /** DEV: next armed alarm skips its delay. */
  alarmNow: boolean;
}

export interface Viewing { kind: 'doc' | 'arc'; id: string }

const ANNOUNCED = /^(doc|item|arc):/;

interface Actions {
  pushLog: (type: LogLevel, message: string) => void;
  clearLogs: () => void;
  finishBoot: () => void;
  trigger: (t: Trigger) => void;
  runEffects: (effects: Effect[]) => void;
  submit: (taskId: string, answer?: string) => SubmitResult;
  revealHint: (taskId: string) => void;
  openDocument: (docId: string) => void;
  consumeFresh: (key: string) => void;
  dismissNotification: (id: string) => void;
  dismissAccessBanner: () => void;
  setDevOpen: (open: boolean) => void;
  setMotion: (m: MotionPref) => void;
  login: (identity: string) => void;
  view: (v: Viewing | null) => void;
  dismissIncoming: () => void;
  answerAlarm: (id: string, answer: string) => SubmitResult;
  lockAlarm: (id: string) => void;
  setAlarmOnScreen: (on: boolean) => void;
  setSound: (on: boolean) => void;
  devReset: () => void;
  devUnlockAll: () => void;
  devGrantAll: () => void;
  devArmAlarm: (id: string) => void;
  clearAlarmNow: () => void;
}

export type Store = OperationState & UiState & Actions;

const STORAGE_KEY = 'musya-exe:operation:v1';

export const useOperation = create<Store>()(
  persist(
    (set, get) => {
      /** Merge an engine transition into the store and surface its side information to the UI. */
      const commit = (next: OperationState, out: Outcome, announce = true) =>
        set((cur) => ({
          ...next,
          notifications: [...cur.notifications, ...out.notifications].slice(-4),
          fresh: [...cur.fresh, ...out.unlocked],
          accessBanner: out.accessChanged ?? cur.accessBanner,
          incoming: announce ? [...cur.incoming, ...out.unlocked.filter((k) => ANNOUNCED.test(k))] : cur.incoming,
        }));
      const snapshot = (): OperationState => {
        const s = get();
        return {
          startedAt: s.startedAt, completedStages: s.completedStages, tasks: s.tasks, items: s.items,
          documents: s.documents, archive: s.archive, logs: s.logs, firedEvents: s.firedEvents, bootDone: s.bootDone,
          alarms: s.alarms,
        };
      };

      return {
        ...engine.createInitialState(),
        notifications: [],
        fresh: [],
        accessBanner: null,
        devOpen: false,
        motion: 'system',
        identity: null,
        viewing: null,
        incoming: [],
        alarmOnScreen: false,
        sound: true,
        alarmNow: false,

        pushLog: (type, message) => set(engine.appendLog(snapshot(), type, message)),
        clearLogs: () => set({ logs: [] }),
        finishBoot: () => set({ bootDone: true }),
        trigger: (t) => commit(...engine.fireTrigger(snapshot(), t)),
        runEffects: (effects) => commit(...engine.applyEffects(snapshot(), effects)),
        submit: (taskId, answer) => {
          const [next, out, result] = engine.submitTask(snapshot(), taskId, answer);
          commit(next, out);
          return result;
        },
        revealHint: (taskId) => set(engine.revealHint(snapshot(), taskId)),
        openDocument: (docId) => commit(...engine.openDocument(snapshot(), docId)),
        consumeFresh: (key) => set((s) => ({ fresh: s.fresh.filter((k) => k !== key) })),
        dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
        dismissAccessBanner: () => set({ accessBanner: null }),
        setDevOpen: (devOpen) => set({ devOpen }),
        setMotion: (motion) => set({ motion }),
        login: (identity) => set({ identity }),
        view: (viewing) => {
          set({ viewing });
          if (viewing?.kind === 'doc') get().openDocument(viewing.id);
        },
        dismissIncoming: () => set((s) => ({ incoming: s.incoming.slice(1) })),
        answerAlarm: (id, answer) => {
          const [next, out, result] = engine.answerAlarm(snapshot(), id, answer);
          commit(next, out);
          return result;
        },
        lockAlarm: (id) => set(engine.lockAlarm(snapshot(), id)),
        setAlarmOnScreen: (alarmOnScreen) => set({ alarmOnScreen }),
        setSound: (sound) => set({ sound }),
        devReset: () => set({ ...engine.createInitialState(), notifications: [], fresh: [], accessBanner: null, identity: null, viewing: null, incoming: [], alarmOnScreen: false }),
        devUnlockAll: () => commit(...engine.devUnlockAllStages(snapshot()), false),
        devGrantAll: () => commit(...engine.devGrantAllItems(snapshot()), false),
        devArmAlarm: (id) => set((s) => ({ alarms: { ...s.alarms, [id]: 'armed' }, alarmNow: true })),
        clearAlarmNow: () => set({ alarmNow: false }),
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        startedAt: s.startedAt, completedStages: s.completedStages, tasks: s.tasks, items: s.items,
        documents: s.documents, archive: s.archive, logs: s.logs, firedEvents: s.firedEvents, bootDone: s.bootDone,
        alarms: s.alarms,
        motion: s.motion,
        sound: s.sound,
        identity: s.identity,
      }),
      // Content may change between sessions: keep saved progress, add entries for new tasks.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Store>;
        const base = engine.createInitialState();
        return { ...current, ...p, tasks: { ...base.tasks, ...(p.tasks ?? {}) } };
      },
    },
  ),
);

