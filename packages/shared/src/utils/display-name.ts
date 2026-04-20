// Derive a displayName from an email address.
// Pure function — no side effects.
//
// Rules:
//   - take substring before '@'
//   - if '+' present, cut at '+' (strip +tag)
//   - truncate to max 50 chars
//   - no case transformation
//
// Edge case: input without '@' returns the input (after +tag strip and
// 50-char truncation). This keeps the function total; callers should
// still validate emails upstream.

const MAX_LEN = 50;

export function deriveDisplayNameFromEmail(email: string): string {
  const atIdx = email.indexOf('@');
  const localPart = atIdx === -1 ? email : email.slice(0, atIdx);
  const plusIdx = localPart.indexOf('+');
  const base = plusIdx === -1 ? localPart : localPart.slice(0, plusIdx);
  return base.slice(0, MAX_LEN);
}
