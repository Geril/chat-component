/**
 * Lightweight client-side PII guard.
 *
 * Applied at two layers:
 *   1. Transport boundary (chat-client.ts): scrubPii() replaces matched patterns in the
 *      fetch body before anything leaves the browser. The user's original text is still
 *      shown in the chat UI — only the wire payload is scrubbed.
 *   2. Input UI (chat-input.tsx): hasPii() drives a non-blocking warning so the user
 *      is aware before they send.
 *
 * Known limitations (documented intentionally):
 *   - Regex cannot detect freeform PII: "my name is John Smith" → undetected.
 *   - Phone patterns produce false positives on numeric codes (order IDs, etc.).
 *   - Production systems should add a server-side NLP/ML scrubbing layer on top of this.
 */

export type PiiKind = 'email' | 'phone' | 'creditCard' | 'ssn' | 'ipv4'

export interface PiiMatch {
  kind: PiiKind
  value: string
}

interface PiiPatternDef {
  kind: PiiKind
  /**
   * Non-global pattern — stateless, safe to reuse with .test() across calls.
   * scrubPii and detectPii create new RegExp(source, 'gi') instances when they
   * need global matching, avoiding any shared lastIndex state.
   */
  pattern: RegExp
  placeholder: string
}

const PATTERNS: readonly PiiPatternDef[] = [
  {
    kind: 'email',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    placeholder: '[EMAIL]'
  },
  {
    kind: 'creditCard',
    // 16 digits in 4 groups, optionally separated by spaces or hyphens
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    placeholder: '[CARD]'
  },
  {
    kind: 'ssn',
    // US SSN: XXX-XX-XXXX or XXX XX XXXX
    pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/,
    placeholder: '[ID]'
  },
  {
    kind: 'phone',
    // Requires separators between groups to reduce false positives on plain numeric codes
    pattern: /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
    placeholder: '[PHONE]'
  },
  {
    kind: 'ipv4',
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/,
    placeholder: '[IP]'
  }
]

/**
 * Returns true if any known PII pattern is detected.
 * Uses Array.some — stops at the first match (fast path).
 */
export function hasPii(text: string): boolean {
  return PATTERNS.some(({ pattern }) => pattern.test(text))
}

/**
 * Replaces all detected PII with anonymous placeholders.
 * Creates new RegExp instances per call — no shared lastIndex state.
 */
export function scrubPii(text: string): string {
  return PATTERNS.reduce(
    (acc, { pattern, placeholder }) => acc.replace(new RegExp(pattern.source, 'gi'), placeholder),
    text
  )
}

/**
 * Returns every detected PII match with its kind and original value.
 * Useful for detailed warnings or audit logging.
 */
export function detectPii(text: string): readonly PiiMatch[] {
  return PATTERNS.flatMap(({ kind, pattern }) =>
    Array.from(text.matchAll(new RegExp(pattern.source, 'gi'))).map(match => ({
      kind,
      value: match[0]
    }))
  )
}
