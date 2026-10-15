import { describe, expect, it } from 'vitest';

import { decodeCursor, encodeCursor } from './cursor';

describe('cursor utils', () => {
  it('encodes and decodes valid cursor with Date object', () => {
    const date = new Date('2026-05-15T12:00:00.000Z');
    const id = '507f1f77bcf86cd799439011';

    const cursor = encodeCursor(date, id);
    expect(typeof cursor).toBe('string');

    const decoded = decodeCursor(cursor);
    expect(decoded).not.toBeNull();
    expect(decoded?.date.toISOString()).toBe(date.toISOString());
    expect(decoded?.id).toBe(id);
  });

  it('encodes and decodes valid cursor with ISO string date', () => {
    const dateStr = '2026-05-15T12:00:00.000Z';
    const id = '507f1f77bcf86cd799439011';

    const cursor = encodeCursor(dateStr, id);
    const decoded = decodeCursor(cursor);

    expect(decoded?.date.toISOString()).toBe(dateStr);
    expect(decoded?.id).toBe(id);
  });

  it('returns null for null, undefined, or empty string', () => {
    expect(decodeCursor(null)).toBeNull();
    expect(decodeCursor(undefined)).toBeNull();
    expect(decodeCursor('')).toBeNull();
  });

  it('returns null for malformed base64 cursor', () => {
    expect(decodeCursor('not-valid-base64-json!')).toBeNull();
  });

  it('returns null when payload is missing required properties', () => {
    const invalidJson = Buffer.from(JSON.stringify({ other: 123 })).toString('base64url');
    expect(decodeCursor(invalidJson)).toBeNull();
  });

  it('returns null when date is unparseable', () => {
    const invalidDate = Buffer.from(
      JSON.stringify({ d: 'invalid-date', id: '123' }),
    ).toString('base64url');
    expect(decodeCursor(invalidDate)).toBeNull();
  });
});
