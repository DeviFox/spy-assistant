import { describe, it, expect } from 'vitest';
import * as e from '../src/features/operation/engine';

const boot = () => e.fireTrigger(e.createInitialState(0), 'session:ready', 0)[0];

describe('operation engine', () => {
  it('starts at stage 01, restricted, awaiting task', () => {
    const s = e.createInitialState(0);
    expect(e.currentStageIndex(s)).toBe(0);
    expect(e.accessLevel(s)).toBe('RESTRICTED');
    expect(e.operationStatus(s)).toBe('AWAITING TASK');
    expect(s.documents['DOC-001'].status).toBe('available');
  });

  it('session:ready issues the first task once', () => {
    let s = boot();
    expect(s.tasks['T-01'].status).toBe('active');
    expect(e.operationStatus(s)).toBe('TASK ASSIGNED');
    const logs = s.logs.length;
    [s] = e.fireTrigger(s, 'session:ready', 1);
    expect(s.logs.length).toBe(logs);
  });

  it('blocks a task until required documents are opened', () => {
    let s = boot();
    let [, , r] = e.submitTask(s, 'T-01');
    expect(r.ok).toBe(false);
    [s] = e.openDocument(s, 'DOC-001');
    let out;
    [s, out, r] = e.submitTask(s, 'T-01');
    expect(r.ok).toBe(true);
    expect(s.completedStages).toContain('initialization');
    expect(s.tasks['T-02'].status).toBe('active');
    expect(out.unlocked).toContain('stage:equipment');
  });

  it('rejects wrong codes, accepts normalized correct code and grants items', () => {
    let s = boot();
    [s] = e.openDocument(s, 'DOC-001');
    [s] = e.submitTask(s, 'T-01');
    let r;
    [s, , r] = e.submitTask(s, 'T-02', '0000');
    expect(r.ok).toBe(false);
    expect(s.tasks['T-02'].attempts).toBe(1);
    [s, , r] = e.submitTask(s, 'T-02', ' 13 57 ');
    expect(r.ok).toBe(true);
    expect(s.items['uv-flashlight']).toBeDefined();
  });

  it('raises access level and reports it when entering investigation', () => {
    let s = boot();
    [s] = e.openDocument(s, 'DOC-001');
    [s] = e.submitTask(s, 'T-01');
    const [next, out] = e.submitTask(s, 'T-02', '1357');
    expect(e.accessLevel(next)).toBe('CONFIDENTIAL');
    expect(out.accessChanged).toBe('CONFIDENTIAL');
  });

  it('dev helpers unlock everything and reveal hints are capped', () => {
    let s = boot();
    [s] = e.devGrantAllItems(s);
    expect(Object.keys(s.items)).toHaveLength(4);
    [s] = e.devUnlockAllStages(s);
    expect(e.currentStageIndex(s)).toBe(4);
    s = e.revealHint(s, 'T-01');
    s = e.revealHint(s, 'T-01');
    expect(s.tasks['T-01'].hintsRevealed).toBe(1);
  });
});

describe('timed alarm', () => {
  const armed = () => {
    let s = boot();
    [s] = e.openDocument(s, 'DOC-001');
    [s] = e.submitTask(s, 'T-01');
    [s] = e.submitTask(s, 'T-02', '1357');
    [s] = e.submitTask(s, 'T-03');
    return s;
  };

  it('arms when T-03 is completed', () => {
    const s = armed();
    expect(s.alarms['AL-01']).toBe('armed');
    expect(e.pendingAlarm(s)?.id).toBe('AL-01');
  });

  it('accepts the sum in time and closes the alarm', () => {
    let s = armed();
    let r;
    [s, , r] = e.answerAlarm(s, 'AL-01', '15');
    expect(r.ok).toBe(false);
    expect(s.alarms['AL-01']).toBe('armed');
    [s, , r] = e.answerAlarm(s, 'AL-01', ' 16 ');
    expect(r.ok).toBe(true);
    expect(s.alarms['AL-01']).toBe('passed');
    expect(e.pendingAlarm(s)).toBeUndefined();
  });

  it('timeout locks down; recovery code restores access; never re-arms after', () => {
    let s = e.lockAlarm(armed(), 'AL-01');
    expect(s.alarms['AL-01']).toBe('lockdown');
    let r;
    [s, , r] = e.answerAlarm(s, 'AL-01', '16');
    expect(r.ok).toBe(false);
    [s, , r] = e.answerAlarm(s, 'AL-01', '7531');
    expect(r.ok).toBe(true);
    expect(s.alarms['AL-01']).toBe('recovered');
    [s] = e.applyEffects(s, [{ type: 'armAlarm', alarm: 'AL-01' }]);
    expect(s.alarms['AL-01']).toBe('recovered');
  });

  it('does not block task progress', () => {
    const [s] = e.openDocument(armed(), 'DOC-002');
    const [, , r] = e.submitTask(s, 'T-04', 'образец');
    expect(r.ok).toBe(true);
  });
});
