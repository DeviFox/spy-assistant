import { describe, it, expect } from 'vitest';
import * as e from '../src/features/operation/engine';
import { equipment } from '../src/data/equipment';
import { documents } from '../src/data/documents';

/** Placeholder answers change as props are made, so tests read them from the scenario. */
const answer = (id: string) => e.findTask(id)!.expectedAnswer!;
const SERIAL = answer('T-04');
const PIN = answer('T-05');

const boot = () => e.fireTrigger(e.createInitialState(0), 'session:ready', 0)[0];

/** Brief and calibration done: stage EQUIPMENT, task T-03 active. */
const toEquipment = () => {
  let s = boot();
  [s] = e.openDocument(s, 'DOC-001');
  [s] = e.submitTask(s, 'T-01');
  [s] = e.submitTask(s, 'T-02');
  return s;
};

/** Up to the PIN task completed: dossier received, alarm armed. */
const armed = () => {
  let [s] = e.submitTask(toEquipment(), 'T-03');
  [s] = e.openDocument(s, 'DOC-004');
  [s] = e.submitTask(s, 'T-04', SERIAL);
  [s] = e.submitTask(s, 'T-05', PIN);
  return s;
};

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
    [s, , r] = e.submitTask(s, 'T-01');
    expect(r.ok).toBe(true);
    expect(s.tasks['T-02'].status).toBe('active');
    const [next, out] = e.submitTask(s, 'T-02');
    expect(next.completedStages).toContain('initialization');
    expect(out.unlocked).toContain('stage:equipment');
  });

  it('envelope grants the sheet; flashlight needs the serial number', () => {
    let s = toEquipment();
    let r;
    [s, , r] = e.submitTask(s, 'T-03');
    expect(r.ok).toBe(true);
    expect(s.items['strange-sheet']).toBeDefined();
    expect(s.documents['DOC-004']).toBeDefined();
    [s] = e.openDocument(s, 'DOC-004');
    [s, , r] = e.submitTask(s, 'T-04', '0000');
    expect(r.ok).toBe(false);
    expect(s.tasks['T-04'].attempts).toBe(1);
    [s, , r] = e.submitTask(s, 'T-04', ` ${SERIAL} `);
    expect(r.ok).toBe(true);
    expect(s.items['uv-flashlight']).toBeDefined();
  });

  it('raises access level and reports it when entering investigation', () => {
    let [s] = e.submitTask(toEquipment(), 'T-03');
    [s] = e.openDocument(s, 'DOC-004');
    const [next, out] = e.submitTask(s, 'T-04', SERIAL);
    expect(e.accessLevel(next)).toBe('CONFIDENTIAL');
    expect(out.accessChanged).toBe('CONFIDENTIAL');
  });

  it('runs the whole operation to completion', () => {
    let s = armed();
    expect(s.archive['ARC-IMG-01']).toBeDefined();
    [s] = e.openDocument(s, 'DOC-002');
    [s] = e.submitTask(s, 'T-06', 'чипсеки');
    [s] = e.openDocument(s, 'DOC-003');
    [s] = e.submitTask(s, 'T-07', 'сладуся');
    expect(s.tasks['T-08'].status).toBe('active');
    let [, , r] = e.submitTask(s, 'T-08');
    expect(r.ok).toBe(false); // needs the vault protocol opened first
    [s] = e.openDocument(s, 'DOC-005');
    [s] = e.submitTask(s, 'T-08');
    expect(e.operationStatus(s)).toBe('OPERATION COMPLETE');
  });

  it('dev helpers unlock everything and reveal hints are capped', () => {
    let s = boot();
    [s] = e.devGrantAllItems(s);
    expect(Object.keys(s.items)).toHaveLength(equipment.length);
    [s] = e.devUnlockAllStages(s);
    expect(e.currentStageIndex(s)).toBe(4);
    s = e.revealHint(s, 'T-01');
    s = e.revealHint(s, 'T-01');
    expect(s.tasks['T-01'].hintsRevealed).toBe(1);
  });
});

describe('timed alarm', () => {
  it('arms when the PIN task (T-05) is completed', () => {
    const s = armed();
    expect(s.alarms['AL-01']).toBe('armed');
    expect(e.pendingAlarm(s)?.id).toBe('AL-01');
  });

  it('accepts the birth date digit sum in time and closes the alarm', () => {
    let s = armed();
    let r;
    [s, , r] = e.answerAlarm(s, 'AL-01', '15');
    expect(r.ok).toBe(false);
    expect(s.alarms['AL-01']).toBe('armed');
    [s, , r] = e.answerAlarm(s, 'AL-01', ' 14 ');
    expect(r.ok).toBe(true);
    expect(s.alarms['AL-01']).toBe('passed');
    expect(e.pendingAlarm(s)).toBeUndefined();
  });

  it('timeout locks down; reversed birth date restores access; never re-arms after', () => {
    let s = e.lockAlarm(armed(), 'AL-01');
    expect(s.alarms['AL-01']).toBe('lockdown');
    let r;
    [s, , r] = e.answerAlarm(s, 'AL-01', '14');
    expect(r.ok).toBe(false);
    [s, , r] = e.answerAlarm(s, 'AL-01', '00021191');
    expect(r.ok).toBe(true);
    expect(s.alarms['AL-01']).toBe('recovered');
    [s] = e.applyEffects(s, [{ type: 'armAlarm', alarm: 'AL-01' }]);
    expect(s.alarms['AL-01']).toBe('recovered');
  });

  it('does not block task progress', () => {
    const [s] = e.openDocument(armed(), 'DOC-002');
    const [, , r] = e.submitTask(s, 'T-06', 'чипсеки');
    expect(r.ok).toBe(true);
  });
});

describe('stencil task', () => {
  it('needs the poem opened and accepts the secret word', () => {
    let [s] = e.applyEffects(boot(), [
      { type: 'unlockDocument', document: 'DOC-003' },
      { type: 'issueTask', task: 'T-07' },
    ]);
    let r;
    [s, , r] = e.submitTask(s, 'T-07', 'сладуся');
    expect(r.ok).toBe(false);
    [s] = e.openDocument(s, 'DOC-003');
    [s, , r] = e.submitTask(s, 'T-07', 'не то');
    expect(r.ok).toBe(false);
    [s, , r] = e.submitTask(s, 'T-07', ' Сладуся ');
    expect(r.ok).toBe(true);
    expect(s.tasks['T-08'].status).toBe('active');
    expect(s.documents['DOC-005']).toBeDefined();
  });
});

/**
 * Vault combination, as VAULT_ACCESS.key describes it: last digit of the flashlight serial,
 * first digit of the UV PIN, first digit of the dossier number, letters in the decrypted word.
 * Set the case lock to this; the console prints it when tests run.
 */
describe('vault combination', () => {
  const dossierNo = documents
    .find((d) => d.id === 'DOC-002')!
    .content.flatMap((b) => (b.kind === 'fields' ? b.rows : []))
    .find(([k]) => k === 'Досье №')![1];
  const code = [
    SERIAL.slice(-1),
    PIN[0],
    dossierNo.match(/\d/)![0],
    String([...answer('T-07')].length),
  ].join('');

  it('has four digits', () => {
    console.info(`VAULT CODE: ${code}`);
    expect(code).toMatch(/^\d{4}$/);
  });
});
