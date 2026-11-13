/**
 * Login challenge: the operative types her name in Russian on a keyboard without Cyrillic legends.
 * Keys are mapped by physical position (ЙЦУКЕН), so the OS layout does not matter.
 */
export const login = {
  title: 'ИДЕНТИФИКАЦИЯ АГЕНТА',
  prompt: 'Введите позывной агента',
  layoutLabel: 'RU· ',
  /** Any of these (case-insensitive, Ё = Е) passes. */
  acceptedNames: ['МУСЯ'],
  failMessage: 'Агент не опознан. Повторите ввод.',
  /** Real names get a nudge towards the call sign instead of the generic failure. */
  nearMiss: {
    names: ['НАСТЯ', 'АНАСТАСИЯ', 'НАСТЕНЬКА', 'НАСТЮША'],
    message: 'Гражданское имя не принимается. Требуется позывной.',
  },
  /** Shown one by one after the given number of failed attempts. */
  hints: [
    { after: 2, text: 'Ввод принимается только на русском языке.' },
    { after: 4, text: 'Раскладка ЙЦУКЕН. Буквы на клавишах не подписаны — придётся по памяти.' },
    { after: 6, text: 'Первая буква — на клавише V.' },
  ],
  /** Loader steps after a successful login. */
  loaderSteps: [
    'Проверка личности',
    'Расшифровка профиля',
    'Подключение к защищённому контуру',
    'Загрузка интерфейса агента',
  ],
  stepMs: 700,
  successLine: (name: string) => `Личность подтверждена. Позывной: ${name}.`,
};
