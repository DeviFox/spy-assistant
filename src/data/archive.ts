import type { ArchiveEntry, ArchiveCategory } from '../types';

export const archiveCategories: { id: ArchiveCategory; label: string }[] = [
  { id: 'DOCUMENTS', label: 'DOCUMENTS' },
  { id: 'IMAGES', label: 'IMAGES' },
  { id: 'AUDIO', label: 'AUDIO RECORDINGS' },
  { id: 'LOGS', label: 'SYSTEM LOGS' },
];

/**
 * Archive entries. Neutral placeholders. Unlock with { type: 'unlockArchive', entry: id }.
 * Viewed case files and the live session log are added to DOCUMENTS / LOGS automatically.
 */
export const archiveEntries: ArchiveEntry[] = [
  {
    id: 'ARC-IMG-01',
    category: 'IMAGES',
    title: 'Изображение 01',
    description: 'Материалы дела агента.',
    media: 'IMAGE',
    src: `${import.meta.env.BASE_URL}agent_docs_table.jpg`,
    locked: true,
  },
  {
    id: 'ARC-IMG-02',
    category: 'IMAGES',
    title: 'Изображение 02',
    description: 'Заглушка для будущего изображения.',
    media: 'IMAGE',
    locked: true,
  },
  {
    id: 'ARC-AUD-01',
    category: 'AUDIO',
    title: 'Аудиозапись 01',
    description: 'Заглушка для будущей аудиозаписи.',
    media: 'AUDIO',
    locked: true,
  },
  {
    id: 'ARC-VID-01',
    category: 'IMAGES',
    title: 'Видеозапись 01',
    description: 'Заглушка для будущего видео.',
    media: 'VIDEO',
    locked: true,
  },
];
