import type { Equipment } from '../types';

/** Operative equipment. Granted by task/event effects: { type: 'grantItem', item: id }. */
export const equipment: Equipment[] = [
  {
    id: 'uv-flashlight',
    name: 'UV FLASHLIGHT',
    description: 'Ультрафиолетовый фонарь.',
    details: 'Демонстрационное описание. Назначение будет указано в сценарии.',
    icon: 'flashlight',
  },
  {
    id: 'access-key',
    name: 'ACCESS KEY',
    description: 'Ключ доступа.',
    details: 'Демонстрационное описание. Назначение будет указано в сценарии.',
    icon: 'key',
  },
  {
    id: 'decoder',
    name: 'DECODER',
    description: 'Устройство расшифровки.',
    details: 'Демонстрационное описание. Назначение будет указано в сценарии.',
    icon: 'decoder',
  },
  {
    id: 'magnetic-tool',
    name: 'MAGNETIC TOOL',
    description: 'Магнитный инструмент.',
    details: 'Демонстрационное описание. Назначение будет указано в сценарии.',
    icon: 'magnet',
  },
];
