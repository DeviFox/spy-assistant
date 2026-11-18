import type { Alarm } from '../types';

/**
 * Timed alarm events. Armed by the `armAlarm` effect (see events.ts).
 * AL-01 asks about the agent's birth date 19.11.2000 (the dossier shows only 19.11): digit sum 14, reversed 00021191.
 * Failing is never final: lockdown leads to a short recovery protocol.
 */
export const alarms: Alarm[] = [
  {
    id: 'AL-01',
    delayMs: 10_000,
    freezeMs: 1200,
    breachMs: 5000,
    breachErrors: [
      'Нарушена целостность защищённого контура.',
      'Сбой проверки подписи сеанса.',
      'Неизвестный процесс получил доступ к FILES.',
      'Потеря пакетов в канале связи.',
      'Журнал операции изменён извне.',
      'Отказ модуля шифрования.',
      'Повреждён сектор памяти рабочей станции.',
      'Превышено число попыток входа.',
    ],
    seconds: 30,
    title: 'НЕСАНКЦИОНИРОВАННЫЙ ДОСТУП',
    prompt: 'Подтвердите личность агента. Введите сумму цифр вашей полной даты рождения.',
    inputLabel: 'Verification sum',
    expectedAnswer: '14',
    warnings: [
      { at: 0, level: 'error', message: 'Обнаружено внешнее подключение к контуру.' },
      { at: 4, level: 'warning', message: 'Канал связи нестабилен.' },
      { at: 8, level: 'warning', message: 'Попытка копирования журнала операции.' },
      { at: 12, level: 'error', message: 'Защита файлов ослаблена.' },
      { at: 16, level: 'error', message: 'Подготовка к блокировке рабочей станции.' },
    ],
    successMessage: 'Личность подтверждена. Внешнее подключение разорвано.',
    successEffects: [{ type: 'notify', level: 'success', message: 'Угроза нейтрализована' }],
    lockdown: {
      message: 'Время ответа истекло. Рабочая станция заблокирована, инцидент записан в журнал.',
      penaltySeconds: 8,
    },
    recovery: {
      prompt: 'Протокол восстановления. Введите цифры вашей даты рождения (ДДММГГГГ) в обратном порядке.',
      inputLabel: 'Recovery code',
      expectedAnswer: '00021191',
      hint: 'Восемь цифр даты рождения, прочитанные справа налево.',
      successMessage: 'Доступ восстановлен.',
      effects: [{ type: 'notify', level: 'warning', message: 'Доступ восстановлен' }],
    },
  },
];
