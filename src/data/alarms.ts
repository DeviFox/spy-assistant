import type { Alarm } from '../types';

/**
 * Timed alarm events. Armed by the `armAlarm` effect (see events.ts).
 * DEMO placeholder: the answer is derived from the code already found in T-02 (1+3+5+7).
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
    seconds: 20,
    title: 'НЕСАНКЦИОНИРОВАННЫЙ ДОСТУП',
    prompt: 'Подтвердите личность агента. Введите сумму цифр кода, найденного в задании T-02.',
    inputLabel: 'Verification sum',
    expectedAnswer: '16',
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
      prompt: 'Протокол восстановления. Введите код из задания T-02 в обратном порядке.',
      inputLabel: 'Recovery code',
      expectedAnswer: '7531',
      hint: 'Код из четырёх цифр, прочитанный справа налево.',
      successMessage: 'Доступ восстановлен.',
      effects: [{ type: 'notify', level: 'warning', message: 'Доступ восстановлен' }],
    },
  },
];
