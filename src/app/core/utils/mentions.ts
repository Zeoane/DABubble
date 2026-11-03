/** "@" or "#" right before the cursor, with what was typed after it. */
export interface MentionTrigger {
  char: '@' | '#';
  query: string;
  /** Index of "@" / "#" in the text. */
  start: number;
}

export interface TextPart {
  text: string;
  mention: boolean;
}

const TRIGGER = /(?:^|\s)([@#])([^\s@#]*)$/;


/** The mention being typed at the cursor, e.g. "Hallo @So|" → @ "So". */
export function findTrigger(text: string, cursor: number): MentionTrigger | null {
  const match = TRIGGER.exec(text.slice(0, cursor));
  if (!match) return null;
  const query = match[2];
  return { char: match[1] as '@' | '#', query, start: cursor - query.length - 1 };
}


/**
 * Splits a message into plain text and known mentions ("@Sofia Müller",
 * "#Entwicklerteam"), so the mentions can be highlighted.
 */
export function splitMentions(text: string, tokens: string[]): TextPart[] {
  const known = tokens.filter((token) => token.length > 1).sort((a, b) => b.length - a.length);
  if (!known.length) return [{ text, mention: false }];
  const pattern = new RegExp(`(${known.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'gu');
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, mention: known.includes(part) }));
}


function escape(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
