/** Physical key (KeyboardEvent.code) → Russian ЙЦУКЕН character (lowercase). */
export const RU_BY_CODE: Record<string, string> = {
  Backquote: 'ё',
  KeyQ: 'й', KeyW: 'ц', KeyE: 'у', KeyR: 'к', KeyT: 'е', KeyY: 'н', KeyU: 'г', KeyI: 'ш', KeyO: 'щ', KeyP: 'з',
  BracketLeft: 'х', BracketRight: 'ъ',
  KeyA: 'ф', KeyS: 'ы', KeyD: 'в', KeyF: 'а', KeyG: 'п', KeyH: 'р', KeyJ: 'о', KeyK: 'л', KeyL: 'д',
  Semicolon: 'ж', Quote: 'э',
  KeyZ: 'я', KeyX: 'ч', KeyC: 'с', KeyV: 'м', KeyB: 'и', KeyN: 'т', KeyM: 'ь', Comma: 'б', Period: 'ю',
  Space: ' ', Minus: '-',
};

/** Returns the Cyrillic character for a key press, or null when the key is not a mapped character key. */
export function ruCharFor(code: string, key: string, shift: boolean): string | null {
  const ch = RU_BY_CODE[code] ?? (/^[а-яё]$/i.test(key) ? key.toLowerCase() : null);
  if (!ch) return null;
  return shift ? ch.toUpperCase() : ch;
}

export const normalizeName = (v: string) => v.trim().toUpperCase().replace(/Ё/g, 'Е').replace(/\s+/g, ' ');

export function matchName(input: string, accepted: string[]): string | null {
  const n = normalizeName(input);
  return accepted.map(normalizeName).includes(n) ? n : null;
}
