export interface CursorPayload {
  date: Date;
  id: string;
}

export const encodeCursor = (date: Date | string, id: string): string => {
  const d = typeof date === 'string' ? date : date.toISOString();
  return Buffer.from(JSON.stringify({ d, id })).toString('base64url');
};

export const decodeCursor = (cursor?: string | null): CursorPayload | null => {
  if (!cursor || typeof cursor !== 'string') return null;
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.d || !parsed.id || typeof parsed.id !== 'string') return null;
    const date = new Date(parsed.d);
    if (isNaN(date.getTime())) return null;
    return { date, id: parsed.id };
  } catch {
    return null;
  }
};
