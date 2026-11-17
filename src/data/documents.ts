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
      { kind: 'paragraph', text: 'Агент, ваша задача — получить доступ к засекреченному объекту ASSET P-03.' },
      { kind: 'paragraph', text: 'Объект находится в защищённом хранилище. Доступ ограничен.' },
      { kind: 'paragraph', text: 'В ходе операции вам могут потребоваться физические инструменты.' },
      { kind: 'paragraph', text: 'Следуйте инструкциям системы. Изучайте документы. Будьте аккуратны и тщательно запоминайте информацию.' },
    ],
  },
  {
    // Hint for T-04: where the UV flashlight is hidden in the flat.
    id: 'DOC-004',
    filename: 'EXHIBIT_B-2.png',
    title: 'Фотография с места',
    category: 'EVIDENCE',
    type: 'IMAGE',
    classification: 'RESTRICTED',
    content: [
      { kind: 'heading', text: 'Вещественное доказательство B-2' },
      { kind: 'paragraph', text: 'Снимок получен от источника. Место съёмки не установлено.' },
      {
        kind: 'media',
        media: 'IMAGE',
        caption: 'EXHIBIT B-2 · EVIDENCE PHOTOGRAPH',
        src: `${import.meta.env.BASE_URL}place.webp`,
        frame: 'scan',
      },
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
          ['Дата рождения', '19.11.<Засекречено>'],
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
          ['Телосложение', 'Идеальное'],
          ['Приметы', 'Исключительное обаяние'],
        ],
      },
      { kind: 'section', text: 'Служебные отметки' },
      { kind: 'fields', rows: [['Контрольное слово', 'Ч***ЕКИ']] },
    ],
  },
  {
    id: 'DOC-003',
    filename: 'ENCRYPTED_POEM.png',
    title: 'Личный архив: стихотворение',
    category: 'PERSONAL',
    type: 'IMAGE',
    classification: 'PERSONAL',
    content: [
      { kind: 'heading', text: 'Перехваченный документ' },
      { kind: 'paragraph', text: 'Источник неизвестен. Текст выглядит обычным, но анализ показал наличие скрытых данных.' },
      {
        kind: 'media',
        media: 'IMAGE',
        caption: 'DOCUMENT 003 · PERSONAL ARCHIVE',
        src: `${import.meta.env.BASE_URL}encrypted_poem.webp`,
        frame: 'scan',
        stencil: true,
      },
    ],
  },
  {
    // Issued by T-07. The vault combination is assembled from earlier answers (see tests/engine.test.ts, vaultCode).
    id: 'DOC-005',
    filename: 'VAULT_ACCESS.key',
    title: 'Протокол доступа к хранилищу',
    category: 'ACCESS',
    type: 'TEXT',
    classification: 'SECRET',
    content: [
      { kind: 'heading', text: 'VAULT ACCESS PROTOCOL' },
      { kind: 'fields', rows: [['Объект', 'ASSET P-03'], ['Авторизация', 'GRANTED']] },
      { kind: 'paragraph', text: 'Авторизация агента подтверждена. Для получения комбинации хранилища используйте данные, собранные в ходе операции.' },
      { kind: 'section', text: 'Комбинация' },
      {
        kind: 'fields',
        rows: [
          ['01', 'Последняя цифра серийного номера спецоборудования.'],
          ['02', 'Первая цифра кода, обнаруженного в изъятом документе.'],
          ['03', 'Контрольная цифра агента: сведите результат проверки личности к одной цифре.'],
          ['04', 'Число букв в расшифрованном слове.'],
        ],
      },
      { kind: 'paragraph', text: 'Последовательность соответствует порядку пунктов. Введите полученную комбинацию на защитном контейнере.' },
    ],
  },
];

export const initialDocuments = ['DOC-001'];
