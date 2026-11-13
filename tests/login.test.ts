import { describe, it, expect } from 'vitest';
import { ruCharFor, matchName } from '../src/features/login/layout';
import { login } from '../src/data/login';

const type = (codes: string[]) => codes.map((c) => ruCharFor(c, 'x', false)).join('');

describe('login layout mapping', () => {
  it('maps physical QWERTY keys to ЙЦУКЕН', () => {
    expect(type(['KeyY', 'KeyF', 'KeyC', 'KeyN', 'KeyZ'])).toBe('настя');
    expect(type(['KeyV', 'KeyE', 'KeyC', 'KeyZ'])).toBe('муся');
  });
  it('uppercases with shift and ignores unmapped keys', () => {
    expect(ruCharFor('KeyY', 'Y', true)).toBe('Н');
    expect(ruCharFor('Enter', 'Enter', false)).toBeNull();
    expect(ruCharFor('Digit1', '1', false)).toBeNull();
  });
  it('accepts only the call sign case- and ё-insensitively', () => {
    expect(matchName(' муся ', login.acceptedNames)).toBe('МУСЯ');
    expect(matchName('настя', login.acceptedNames)).toBeNull();
    expect(matchName('Настя', login.nearMiss.names)).toBe('НАСТЯ');
    expect(matchName('nastya', login.acceptedNames)).toBeNull();
  });
});
