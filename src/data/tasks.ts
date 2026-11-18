import type { Task } from '../types';

/**
 * Operation flow (DRAFT 01):
 *   T-01 brief → T-02 calibration → T-03 envelope → T-04 UV flashlight → T-05 hidden PIN
 *   → T-06 dossier → T-07 poem stencil → T-08 final extraction.
 * Lines marked TODO are placeholders: set them to match the real props (sticker, UV ink, vault).
 */
export const tasks: Task[] = [
  {
    id: 'T-01',
    title: 'Вводный брифинг',
    description: 'Ознакомиться с вводными материалами операции.',
    instruction: 'Откройте документ OPERATION_BRIEF.txt и подтвердите ознакомление.',
    type: 'INFORMATION',
    stage: 'initialization',
    hints: ['Документ открывается кнопкой в блоке Required files или в списке FILES справа.'],
    requiresDocuments: ['DOC-001'],
    confirmLabel: 'Подтвердить ознакомление',
    successMessage: 'Брифинг подтверждён. Переходите к калибровке.',
    reward: 'Задание T-02',
    unlocks: [{ type: 'issueTask', task: 'T-02' }],
  },
  {
    // TASK 00 · CALIBRATION: introduces the "confirm a real-world action" mechanic.
    id: 'T-02',
    title: 'Калибровка',
    description: 'Проверка канала связи с куратором.',
    // TODO: describe the real action (e.g. where the package is handed over).
    instruction: 'Ваш куратор выйдет на контакт лично и передаст вам конверт. Получите передачу и подтвердите выполнение.',
    type: 'PHYSICAL',
    stage: 'initialization',
    hints: ['Агент найдёт вас сам. Оставайтесь на месте.'],
    confirmLabel: 'Подтвердить выполнение',
    successMessage: 'Передача получена. Канал связи с агентом подтверждён.',
    reward: 'Доступ к этапу EQUIPMENT',
    unlocks: [
      { type: 'completeStage', stage: 'initialization' },
      { type: 'issueTask', task: 'T-03' },
    ],
  },
  {
    // TASK 01 · DOCUMENT RECOVERY: the sheet comes back in T-05 (UV ink).
    id: 'T-03',
    title: 'Изъятие документа',
    description: 'По данным источника, в материалах дела лежит нужный документ.',
    instruction: 'Документ должен находится среди материалов. Найдите его и изымите.',
    type: 'PHYSICAL',
    stage: 'equipment',
    hints: ['Лучшее место, чтобы спрятать бумагу, — среди других бумаг.', 'Ищите то, что запечатано.'],
    confirmLabel: 'Документ изъят',
    successMessage: 'Документ изъят. Возможно, прочитать его пока не удаётся. Сохраните его.',
    reward: 'UNKNOWN DOCUMENT, снимок EXHIBIT_B-2.png',
    unlocks: [
      { type: 'grantItem', item: 'strange-sheet' },
      { type: 'unlockDocument', document: 'DOC-004' },
      { type: 'issueTask', task: 'T-04' },
    ],
  },
  {
    // TASK 02 · EQUIPMENT RECOVERY: the answer is the serial number on a sticker on the flashlight.
    id: 'T-04',
    title: 'Получение оборудования',
    description: 'Для следующего этапа нужен спецприбор. Его местонахождение установлено лишь приблизительно.',
    // The hiding place is shown in DOC-004 (public/place.webp).
    instruction: 'Источник передал снимок возможного места хранения. Найдите прибор и поставьте его на учёт по серийному номеру.',
    type: 'CODE_INPUT',
    stage: 'equipment',
    hints: ['Это место вам знакомо. Сравните снимок с обстановкой вокруг.', 'Серийный номер указан на корпусе прибора.'],
    requiresDocuments: ['DOC-004'],
    expectedAnswer: '16092023', // TODO: the number printed on the sticker.
    successMessage: 'Серийный номер подтверждён. Прибор поставлен на учёт.',
    failureMessage: 'Оборудование с таким номером не зарегистрировано.',
    reward: 'UV FLASHLIGHT',
    unlocks: [
      { type: 'grantItem', item: 'uv-flashlight' },
      { type: 'completeStage', stage: 'equipment' },
      { type: 'issueTask', task: 'T-05' },
    ],
  },
  {
    // TASK 03 · HIDDEN DATA: the PIN is written in UV ink on the sheet from T-03.
    id: 'T-05',
    title: 'Скрытые данные',
    description: 'Изъятый документ скрывает больше, чем показывает.',
    instruction: 'Получите из документа код доступа. Всё необходимое у вас уже есть.',
    type: 'CODE_INPUT',
    stage: 'investigation',
    hints: ['Не всё можно увидеть при обычном свете.', 'Прибор из прошлого задания нужен именно для этого. Лучше работать в темноте.'],
    expectedAnswer: '1703', // TODO: the PIN written in UV ink.
    successMessage: 'Код принят. Открыт доступ к засекреченным материалам.',
    failureMessage: 'Код отклонён.',
    reward: 'Изображение 01, документ AGENT_PROFILE.dat',
    unlocks: [
      // Order matters: the image is announced first, then the dossier.
      { type: 'unlockArchive', entry: 'ARC-IMG-01' },
      { type: 'unlockDocument', document: 'DOC-002' },
      { type: 'issueTask', task: 'T-06' },
    ],
  },
  {
    id: 'T-06',
    title: 'Изучение материалов',
    description: 'Часть досье повреждена при передаче.',
    instruction: 'Восстановите контрольное слово из досье агента.',
    type: 'INVESTIGATION',
    stage: 'investigation',
    hints: ['Часть букв скрыта. Слово знакомо вам лично.'],
    requiresDocuments: ['DOC-002'],
    expectedAnswer: 'ЧИПСЕКИ',
    successMessage: 'Контрольное слово подтверждено. Получен новый документ.',
    failureMessage: 'Ответ не совпадает с данными досье.',
    reward: 'документ ENCRYPTED_POEM.png',
    unlocks: [
      { type: 'unlockDocument', document: 'DOC-003' },
      { type: 'completeStage', stage: 'investigation' },
      { type: 'issueTask', task: 'T-07' },
    ],
  },
  {
    // TASK 04 · MESSAGE DECODING: the paper stencil waits in the same box of papers as the T-03 envelope.
    id: 'T-07',
    title: 'Расшифровка',
    description: 'Перехвачено сообщение. На вид — личное письмо.',
    instruction: 'В сообщении скрыт ваш дополнительный позывной. Извлеките его.',
    type: 'INVESTIGATION',
    stage: 'access',
    hints: [
      'Метод расшифровки указан в самом документе.',
      'Вернитесь туда, где был изъят первый документ. Там осталось кое-что ещё.',
      'Откройте документ в режиме чтения и приложите найденное к экрану.',
    ],
    requiresDocuments: ['DOC-003'],
    expectedAnswer: 'СЛАДУСЯ',
    successMessage: 'Позывной принят. Авторизация агента подтверждена.',
    failureMessage: 'Позывной не распознан.',
    reward: 'документ VAULT_ACCESS.key',
    unlocks: [
      { type: 'unlockDocument', document: 'DOC-005' },
      { type: 'log', level: 'success', message: 'ASSET P-03: авторизация подтверждена.' },
      { type: 'completeStage', stage: 'access' },
      { type: 'issueTask', task: 'T-08' },
    ],
  },
  {
    // TASK 05 · FINAL EXTRACTION
    id: 'T-08',
    title: 'Извлечение объекта',
    description: 'Авторизация подтверждена. Комбинация получена.',
    instruction: 'Хранилище находится в вашем секторе. Вскройте контейнер и извлеките объект.',
    type: 'PHYSICAL',
    stage: 'extraction',
    hints: [
      'Порядок сборки комбинации указан в VAULT_ACCESS.key.',
      'Все исходные данные у вас: на найденных предметах и в вашей памяти.',
    ],
    requiresDocuments: ['DOC-005'],
    confirmLabel: 'Приступить к извлечению',
    successMessage: 'Запущен протокол рассекречивания.',
    reward: 'Засекреченный объект',
    unlocks: [{ type: 'completeStage', stage: 'extraction' }],
  },
];
