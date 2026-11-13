import type { CaseDocument } from '../types';

/** Case files. Neutral placeholders only. Locked unless listed in initialDocuments. */
export const documents: CaseDocument[] = [
  {
    id: 'DOC-001',
    filename: 'OPERATION_BRIEF.txt',
    title: 'Вводный брифинг',
    category: 'BRIEFING',
    type: 'TEXT',
    classification: 'RESTRICTED',
    content: [
      { kind: 'heading', text: 'OPERATION 001: BIRTHDAY PROTOCOL' },
      {
        kind: 'fields',
        rows: [
          ['Статус', 'ACTIVE'],
          ['Уровень допуска', 'RECRUIT'],
        ],
      },
      { kind: 'paragraph', text: 'Агент, ваша задача — восстановить доступ к засекреченному объекту.' },
      { kind: 'paragraph', text: 'В ходе операции вам могут потребоваться физические инструменты и документы.' },
      { kind: 'paragraph', text: 'Следуйте инструкциям системы. Не доверяйте неподтверждённым данным.' },
    ],
  },
  {
    id: 'DOC-002',
    filename: 'AGENT_PROFILE.dat',
    title: 'Досье агента',
    category: 'PERSONNEL',
    type: 'TEXT',
    classification: 'CONFIDENTIAL',
    content: [
      { kind: 'heading', text: 'Анастасия' },
      {
        kind: 'fields',
        photo: { src: `${import.meta.env.BASE_URL}images.jpeg`, caption: 'Фото агента' },
        rows: [
          ['Дата рождения', 'Засекречено'],
          ['Гражданство', 'Засекречено'],
          ['Языки', 'Русский, английский'],
          ['Семья', 'Засекречено'],
          ['Числится как', 'Агент под прикрытием'],
          ['Кодовое имя', 'МУСЯ'],
          ['Досье №', '43HSB0'],
        ],
      },
      { kind: 'section', text: 'Внешность' },
      {
        kind: 'fields',
        rows: [
          ['Цвет волос', 'Русый'],
          ['Цвет глаз', 'Карий'],
          ['Рост', '171'],
          ['Сложение', 'Идеальное'],
          ['Приметы', 'Исключительное обаяние'],
        ],
      },
      { kind: 'section', text: 'Служебные отметки' },
      { kind: 'fields', rows: [['Контрольное слово', 'ОБРАЗЕЦ']] },
    ],
  },
  {
    id: 'DOC-003',
    filename: 'SECURITY_REPORT.pdf',
    title: 'Отчёт службы безопасности',
    category: 'SECURITY',
    type: 'TEXT',
    classification: 'SECRET',
    content: [
      { kind: 'heading', text: 'Отчёт службы безопасности' },
      { kind: 'paragraph', text: 'Текст-заглушка. Демонстрационная оценка маршрутов.' },
      {
        kind: 'fields',
        rows: [
          ['Маршрут A', 'не допустим'],
          ['Маршрут B', 'допустим'],
          ['Маршрут C', 'не допустим'],
        ],
      },
    ],
  },
];

export const initialDocuments = ['DOC-001'];
