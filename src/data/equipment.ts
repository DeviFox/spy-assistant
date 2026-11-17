import type { Equipment } from '../types';

/** Operative equipment. Granted by task/event effects: { type: 'grantItem', item: id }. */
export const equipment: Equipment[] = [
  {
    id: 'strange-sheet',
    name: 'UNKNOWN DOCUMENT',
    description: 'Изъятый документ. Содержание не поддаётся прочтению.',
    details: 'Назначение не установлено.',
    icon: 'text',
  },
  {
    id: 'uv-flashlight',
    name: 'UV FLASHLIGHT',
    description: 'Спецприбор куратора.',
    details: 'Назначение засекречено.',
    icon: 'flashlight',
  },
  {
    // Stays CLASSIFIED in the list all game long; granted by the finale (src/pages/mission/Finale.tsx).
    id: 'main-prize',
    name: 'AirPods Pro 3',
    description: 'Засекреченное спецустройство. Цель операции.',
    details: 'Рассекречено после вскрытия хранилища.',
    icon: 'gift',
  },
];
