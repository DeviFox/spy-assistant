/* Domain model for MUSYA.exe. Content files in src/data conform to these types. */

export type AccessLevel = 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

export type StageId = 'initialization' | 'equipment' | 'investigation' | 'access' | 'extraction';
export type StageStatus = 'completed' | 'active' | 'locked';

export interface Stage {
  id: StageId;
  code: string; // "01"
  title: string; // "INITIALIZATION"
  /** Access level granted when this stage becomes active. */
  accessLevel: AccessLevel;
}

export interface Operation {
  id: string;
  title: string;
  codename: string;
  operative: string;
  /** Agent portrait (path under /public). */
  avatar?: string;
  version: string;
  session: string;
  stages: Stage[];
}

export type OperationStatus = 'AWAITING TASK' | 'TASK ASSIGNED' | 'OPERATION COMPLETE';

/* ---------- Effects: the only way content changes state ---------- */

export type LogLevel = 'system' | 'info' | 'success' | 'warning' | 'error' | 'unknown' | 'input';

export type Effect =
  | { type: 'completeStage'; stage: StageId }
  | { type: 'issueTask'; task: string }
  | { type: 'grantItem'; item: string }
  | { type: 'unlockDocument'; document: string }
  | { type: 'unlockArchive'; entry: string }
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'notify'; level: Exclude<LogLevel, 'input' | 'system'>; message: string }
  /** Starts a timed alarm event (see src/data/alarms.ts). */
  | { type: 'armAlarm'; alarm: string };

/* ---------- Tasks ---------- */

export type TaskType = 'INFORMATION' | 'CODE_INPUT' | 'PHYSICAL' | 'INVESTIGATION' | 'DECISION';
export type TaskStatus = 'locked' | 'active' | 'completed';

export interface DecisionOption {
  id: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  instruction: string;
  type: TaskType;
  stage: StageId;
  hints: string[];
  /** CODE_INPUT / INVESTIGATION: compared case- and whitespace-insensitively. DECISION: option id. */
  expectedAnswer?: string;
  options?: DecisionOption[];
  /** Label of the confirm button for INFORMATION / PHYSICAL tasks. */
  confirmLabel?: string;
  /** Documents the operative must open before the task can be submitted. */
  requiresDocuments?: string[];
  successMessage: string;
  failureMessage?: string;
  reward: string;
  unlocks: Effect[];
}

/* ---------- Equipment ---------- */

export type EquipmentStatus = 'locked' | 'found';
export type IconName =
  | 'flashlight' | 'key' | 'decoder' | 'magnet'
  | 'overview' | 'files' | 'tasks' | 'equipment' | 'archive'
  | 'lock' | 'alert' | 'image' | 'audio' | 'video' | 'text' | 'log' | 'arrow' | 'close' | 'menu' | 'hint' | 'check';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  details: string;
  icon: IconName;
}

/* ---------- Documents & archive ---------- */

export type MediaType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';
export type DocumentStatus = 'locked' | 'available' | 'viewed';

export type DocumentBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'section'; text: string }
  | { kind: 'paragraph'; text: string }
  /** With `photo`, the portrait sits beside the table, like a pasted photo in a paper file. */
  | { kind: 'fields'; rows: [string, string][]; photo?: { src: string; caption: string } }
  /** `frame` styles real images on paper: a pasted photo or a full-width attached scan. */
  | { kind: 'media'; media: MediaType; caption: string; src?: string; frame?: 'photo' | 'scan' };

export interface CaseDocument {
  id: string;
  filename: string;
  title: string;
  category: string;
  type: MediaType;
  classification: string;
  content: DocumentBlock[];
}

export type ArchiveCategory = 'DOCUMENTS' | 'IMAGES' | 'AUDIO' | 'LOGS';

export interface ArchiveEntry {
  id: string;
  category: ArchiveCategory;
  title: string;
  description: string;
  media: MediaType;
  src?: string;
  /** Entries without `locked` are available from the start. */
  locked?: boolean;
}

/* ---------- System log, events, characters ---------- */

export interface SystemLog {
  id: string;
  timestamp: number;
  type: LogLevel;
  message: string;
}

export type Trigger =
  | 'session:ready'
  | `stage:entered:${StageId}`
  | `task:completed:${string}`
  | `item:found:${string}`
  | `document:opened:${string}`;

export interface SystemEvent {
  id: string;
  on: Trigger;
  /** Fires only once per operation (default true). */
  once?: boolean;
  effects: Effect[];
}

/** Optional events the DEV panel can fire manually for testing. */
export interface DemoEvent {
  id: string;
  label: string;
  effects: Effect[];
}

/** Reserved for future characters. No characters are defined yet. */
export interface Character {
  id: string;
  name: string;
  role: string;
  image?: string;
  lines: { id: string; text: string }[];
  appearsOn: Trigger[];
}

export interface Notification {
  id: string;
  level: Exclude<LogLevel, 'input' | 'system'>;
  message: string;
}

/* ---------- Timed alarm events ---------- */

/** armed: waiting to go off (or counting down) · lockdown: time ran out, recovery pending · passed / recovered: done. */
export type AlarmStatus = 'armed' | 'lockdown' | 'passed' | 'recovered';

export interface AlarmWarning {
  /** Seconds after the countdown starts. */
  at: number;
  level: 'warning' | 'error';
  message: string;
}

export interface Alarm {
  id: string;
  /** Pause after arming before the interface hangs, so it lands mid-reading. */
  delayMs: number;
  /** How long the interface stays frozen before the breach starts. */
  freezeMs: number;
  /** Screen-wide breach before the access request: error windows, tears, blackouts. */
  breachMs: number;
  /** Messages for the error windows that pop up during the breach. */
  breachErrors: string[];
  /** Countdown length in seconds. */
  seconds: number;
  title: string;
  prompt: string;
  inputLabel: string;
  /** Compared like task answers (case, spaces, Ё/Е ignored). */
  expectedAnswer: string;
  warnings: AlarmWarning[];
  successMessage: string;
  /** Applied when answered in time. */
  successEffects: Effect[];
  lockdown: {
    message: string;
    /** Seconds before the recovery protocol can be started. 0 = immediately. */
    penaltySeconds: number;
  };
  recovery: {
    prompt: string;
    inputLabel: string;
    expectedAnswer: string;
    hint?: string;
    successMessage: string;
    /** Applied after recovery. */
    effects: Effect[];
  };
}
