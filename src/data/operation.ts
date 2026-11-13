import type { Operation } from '../types';

/** Operation identity and stage ladder. Edit freely; ids are referenced by tasks and events. */
export const operation: Operation = {
  id: 'OP-01',
  title: 'OPERATION 01',
  codename: 'MUSYA.exe',
  operative: 'МУСЯ',
  avatar: `${import.meta.env.BASE_URL}images.jpeg`,
  version: 'v0.1.0',
  session: '001',
  stages: [
    { id: 'initialization', code: '01', title: 'INITIALIZATION', accessLevel: 'RESTRICTED' },
    { id: 'equipment', code: '02', title: 'EQUIPMENT', accessLevel: 'RESTRICTED' },
    { id: 'investigation', code: '03', title: 'INVESTIGATION', accessLevel: 'CONFIDENTIAL' },
    { id: 'access', code: '04', title: 'ACCESS', accessLevel: 'CONFIDENTIAL' },
    { id: 'extraction', code: '05', title: 'EXTRACTION', accessLevel: 'SECRET' },
  ],
};

/** Lines printed once, when the workstation boots for the first time. */
export const bootSequence: { level: 'system' | 'info' | 'success'; message: string }[] = [
  { level: 'system', message: 'Инициализация рабочей станции...' },
  { level: 'system', message: 'Проверка целостности системы...' },
  { level: 'system', message: 'Подключение к защищённому контуру...' },
  { level: 'info', message: `Агент: ${operation.operative}` },
  { level: 'info', message: 'Уровень доступа: RESTRICTED' },
  { level: 'success', message: 'Система готова к работе.' },
  { level: 'system', message: 'Ожидание команды.' },
];

export const restoredSessionMessage = 'Сеанс восстановлен. Журнал операции загружен.';
